const express = require('express');
const { body, validationResult } = require('express-validator');
const Booking = require('../models/Booking');
const User = require('../models/User');
const Availability = require('../models/Availability');
const { protect, authorize } = require('../middleware/auth');
const { sendBookingConfirmation, sendTeacherNotification } = require('../utils/emailService');

const router = express.Router();

// @desc    Create a booking
// @route   POST /api/bookings
// @access  Private (Student only)
router.post('/', protect, authorize('student'), [
  body('teacherId').isMongoId().withMessage('Valid teacher ID is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('startTime').matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Start time must be in HH:MM format'),
  body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { teacherId, subject, date, startTime, duration, notes } = req.body;

    // Check if teacher exists and is a teacher
    const teacher = await User.findById(teacherId);
    if (!teacher || teacher.role !== 'teacher') {
      return res.status(404).json({
        success: false,
        message: 'Teacher not found'
      });
    }

    // Calculate end time
    const start = new Date(`2000-01-01T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60000);
    const endTime = end.toTimeString().slice(0, 5);

    // Check if the selected date is in the future
    const selectedDate = new Date(date);
    const now = new Date();
    if (selectedDate <= now) {
      return res.status(400).json({
        success: false,
        message: 'Cannot book classes in the past'
      });
    }

    // Check if teacher is available at the selected time
    const dayOfWeek = selectedDate.getDay();
    const availability = await Availability.findOne({
      teacher: teacherId,
      dayOfWeek,
      startTime: { $lte: startTime },
      endTime: { $gte: endTime },
      isAvailable: true
    });

    if (!availability) {
      return res.status(400).json({
        success: false,
        message: 'Teacher is not available at the selected time'
      });
    }

    // Check for conflicting bookings
    const conflictingBooking = await Booking.findOne({
      teacher: teacherId,
      date: selectedDate,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        {
          startTime: { $lt: endTime },
          endTime: { $gt: startTime }
        }
      ]
    });

    if (conflictingBooking) {
      return res.status(400).json({
        success: false,
        message: 'Time slot is already booked'
      });
    }

    // Calculate amount
    const amount = (teacher.hourlyRate * duration) / 60;

    // Create booking
    const booking = await Booking.create({
      student: req.user._id,
      teacher: teacherId,
      subject,
      date: selectedDate,
      startTime,
      endTime,
      duration,
      amount,
      notes,
      meetingLink: `https://meet.jit.si/class-${Date.now()}`
    });

    // Populate teacher and student details
    await booking.populate('teacher', 'name email');
    await booking.populate('student', 'name email');

    // Send email notifications
    try {
      await sendBookingConfirmation(booking, req.user);
      await sendTeacherNotification(booking, teacher);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's bookings
// @route   GET /api/bookings
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Build filter based on user role
    const filter = {};
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    if (status) {
      filter.status = status;
    }

    const bookings = await Booking.find(filter)
      .populate('teacher', 'name email avatar')
      .populate('student', 'name email avatar')
      .sort({ date: 1, startTime: 1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await Booking.countDocuments(filter);

    res.json({
      success: true,
      data: bookings,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get booking by ID
// @route   GET /api/bookings/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('teacher', 'name email avatar phone')
      .populate('student', 'name email avatar');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to view this booking
    if (booking.student._id.toString() !== req.user._id.toString() && 
        booking.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this booking'
      });
    }

    res.json({
      success: true,
      data: booking
    });
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private (Teacher only)
router.put('/:id/status', protect, authorize('teacher'), [
  body('status').isIn(['confirmed', 'cancelled', 'completed', 'no-show']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id)
      .populate('student', 'name email')
      .populate('teacher', 'name email');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the teacher
    if (booking.teacher._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this booking'
      });
    }

    booking.status = req.body.status;
    if (req.body.teacherNotes) {
      booking.teacherNotes = req.body.teacherNotes;
    }

    const updatedBooking = await booking.save();

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Update booking status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel booking
// @route   PUT /api/bookings/:id/cancel
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if user is authorized to cancel this booking
    if (booking.student.toString() !== req.user._id.toString() && 
        booking.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this booking'
      });
    }

    // Check if booking can be cancelled (not completed or already cancelled)
    if (booking.status === 'completed' || booking.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Booking cannot be cancelled'
      });
    }

    booking.status = 'cancelled';
    const updatedBooking = await booking.save();

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Cancel booking error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Add review to completed booking
// @route   POST /api/bookings/:id/review
// @access  Private (Student only)
router.post('/:id/review', protect, authorize('student'), [
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('review').optional().isLength({ max: 1000 }).withMessage('Review cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if the booking belongs to the student
    if (booking.student.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to review this booking'
      });
    }

    // Check if booking is completed
    if (booking.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Can only review completed bookings'
      });
    }

    // Check if already reviewed
    if (booking.rating) {
      return res.status(400).json({
        success: false,
        message: 'Booking already reviewed'
      });
    }

    booking.rating = req.body.rating;
    booking.review = req.body.review;

    const updatedBooking = await booking.save();

    // Update teacher's average rating
    const teacherBookings = await Booking.find({
      teacher: booking.teacher,
      rating: { $exists: true, $ne: null }
    });

    const totalRating = teacherBookings.reduce((sum, b) => sum + b.rating, 0);
    const averageRating = totalRating / teacherBookings.length;

    await User.findByIdAndUpdate(booking.teacher, {
      rating: averageRating,
      totalReviews: teacherBookings.length
    });

    res.json({
      success: true,
      data: updatedBooking
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router; 