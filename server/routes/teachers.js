const express = require('express');
const User = require('../models/User');
const Availability = require('../models/Availability');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all teachers
// @route   GET /api/teachers
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { subject, minRating, maxPrice, page = 1, limit = 10 } = req.query;

    // Build filter object
    const filter = { role: 'teacher' };
    
    if (subject) {
      filter.subjects = { $in: [new RegExp(subject, 'i')] };
    }
    
    if (minRating) {
      filter.rating = { $gte: parseFloat(minRating) };
    }
    
    if (maxPrice) {
      filter.hourlyRate = { $lte: parseFloat(maxPrice) };
    }

    const skip = (page - 1) * limit;

    const teachers = await User.find(filter)
      .select('name email subjects bio hourlyRate rating totalReviews avatar role')
      .limit(parseInt(limit))
      .skip(skip)
      .sort({ rating: -1, totalReviews: -1 });

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: teachers,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get teachers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get teacher by ID
// @route   GET /api/teachers/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const teacher = await User.findById(req.params.id)
      .select('name email subjects bio hourlyRate rating totalReviews avatar phone isVerified role');

    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    res.json({
      success: true,
      data: teacher
    });
  } catch (error) {
    console.error('Get teacher error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get teacher availability
// @route   GET /api/teachers/:id/availability
// @access  Public
router.get('/:id/availability', async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    const availability = await Availability.find({
      teacher: req.params.id,
      dayOfWeek,
      isAvailable: true
    }).sort({ startTime: 1 });

    res.json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Get teacher availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get teacher schedule for a week
// @route   GET /api/teachers/:id/schedule
// @access  Public
router.get('/:id/schedule', async (req, res) => {
  try {
    const availability = await Availability.find({
      teacher: req.params.id,
      isAvailable: true
    }).sort({ dayOfWeek: 1, startTime: 1 });

    // Group by day of week
    const schedule = {};
    for (let i = 0; i < 7; i++) {
      schedule[i] = availability.filter(avail => avail.dayOfWeek === i);
    }

    res.json({
      success: true,
      data: schedule
    });
  } catch (error) {
    console.error('Get teacher schedule error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get popular subjects
// @route   GET /api/teachers/subjects/popular
// @access  Public
router.get('/subjects/popular', async (req, res) => {
  try {
    const teachers = await User.find({ role: 'teacher' }).select('subjects');
    
    const subjectCount = {};
    teachers.forEach(teacher => {
      teacher.subjects.forEach(subject => {
        subjectCount[subject] = (subjectCount[subject] || 0) + 1;
      });
    });

    const popularSubjects = Object.entries(subjectCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([subject, count]) => ({ subject, count }));

    res.json({
      success: true,
      data: popularSubjects
    });
  } catch (error) {
    console.error('Get popular subjects error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 