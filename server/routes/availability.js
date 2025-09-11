const express = require('express');
const { body, validationResult } = require('express-validator');
const Availability = require('../models/Availability');
const { protect, isTeacher } = require('../middleware/auth');

const router = express.Router();

// @desc    Set teacher availability
// @route   POST /api/availability
// @access  Private (Teacher only)
router.post('/', protect, isTeacher, [
  body('dayOfWeek').isInt({ min: 0, max: 6 }).withMessage('Day of week must be between 0-6'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { dayOfWeek, startTime, endTime } = req.body;

    // Check if time slot already exists
    const existingSlot = await Availability.findOne({
      teacher: req.user._id,
      dayOfWeek,
      startTime,
      endTime
    });

    if (existingSlot) {
      return res.status(400).json({
        success: false,
        message: 'Time slot already exists'
      });
    }

    // Validate time range
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(`2000-01-01T${endTime}:00`);
    
    if (start >= end) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const availability = await Availability.create({
      teacher: req.user._id,
      dayOfWeek,
      startTime,
      endTime
    });

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Set availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get teacher's availability
// @route   GET /api/availability
// @access  Private (Teacher only)
router.get('/', protect, isTeacher, async (req, res) => {
  try {
    const availability = await Availability.find({
      teacher: req.user._id
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
    console.error('Get availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get specific teacher's availability (public)
// @route   GET /api/availability/teacher/:teacherId
// @access  Public
router.get('/teacher/:teacherId', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { dayOfWeek } = req.query;

    let query = { teacher: teacherId };
    
    // If dayOfWeek is provided, filter by it
    if (dayOfWeek !== undefined) {
      query.dayOfWeek = parseInt(dayOfWeek);
    }

    const availability = await Availability.find(query)
      .sort({ dayOfWeek: 1, startTime: 1 });

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

// @desc    Update availability slot
// @route   PUT /api/availability/:id
// @access  Private (Teacher only)
router.put('/:id', protect, isTeacher, [
  body('startTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('endTime').optional().matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('End time must be in HH:MM format'),
  body('isAvailable').optional().isBoolean().withMessage('isAvailable must be a boolean')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    // Check if the slot belongs to the teacher
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this slot'
      });
    }

    // Update fields
    if (req.body.startTime) availability.startTime = req.body.startTime;
    if (req.body.endTime) availability.endTime = req.body.endTime;
    if (req.body.isAvailable !== undefined) availability.isAvailable = req.body.isAvailable;

    // Validate time range if times are being updated
    if (req.body.startTime || req.body.endTime) {
      const start = new Date(`2000-01-01T${availability.startTime}:00`);
      const end = new Date(`2000-01-01T${availability.endTime}:00`);
      
      if (start >= end) {
        return res.status(400).json({
          success: false,
          message: 'End time must be after start time'
        });
      }
    }

    const updatedAvailability = await availability.save();

    res.json({
      success: true,
      data: updatedAvailability
    });
  } catch (error) {
    console.error('Update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete availability slot
// @route   DELETE /api/availability/:id
// @access  Private (Teacher only)
router.delete('/:id', protect, isTeacher, async (req, res) => {
  try {
    const availability = await Availability.findById(req.params.id);

    if (!availability) {
      return res.status(404).json({
        success: false,
        message: 'Availability slot not found'
      });
    }

    // Check if the slot belongs to the teacher
    if (availability.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this slot'
      });
    }

    // Use deleteOne instead of deprecated remove()
    await Availability.deleteOne({ _id: req.params.id });

    res.json({
      success: true,
      message: 'Availability slot deleted'
    });
  } catch (error) {
    console.error('Delete availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Bulk update availability
// @route   POST /api/availability/bulk
// @access  Private (Teacher only)
router.post('/bulk', protect, isTeacher, async (req, res) => {
  try {
    const { slots } = req.body;

    if (!Array.isArray(slots)) {
      return res.status(400).json({
        success: false,
        message: 'Slots must be an array'
      });
    }

    // Delete existing slots for the teacher
    await Availability.deleteMany({ teacher: req.user._id });

    // Create new slots
    const newSlots = slots.map(slot => ({
      ...slot,
      teacher: req.user._id
    }));

    const availability = await Availability.insertMany(newSlots);

    res.status(201).json({
      success: true,
      data: availability
    });
  } catch (error) {
    console.error('Bulk update availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 