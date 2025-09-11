const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Send email
const sendEmail = async (options) => {
  const transporter = createTransporter();

  const message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  const info = await transporter.sendMail(message);

  console.log('Message sent: %s', info.messageId);
};

// Send booking confirmation email
const sendBookingConfirmation = async (booking, user) => {
  const subject = 'Class Booking Confirmation';
  const message = `
    Hello ${user.name},
    
    Your class booking has been confirmed!
    
    Details:
    - Subject: ${booking.subject}
    - Date: ${new Date(booking.date).toLocaleDateString()}
    - Time: ${booking.startTime} - ${booking.endTime}
    - Duration: ${booking.duration} minutes
    - Amount: $${booking.amount}
    
    Meeting Link: ${booking.meetingLink || 'Will be provided before the class'}
    
    Thank you for choosing our platform!
  `;

  await sendEmail({
    email: user.email,
    subject,
    message,
  });
};

// Send booking notification to teacher
const sendTeacherNotification = async (booking, teacher) => {
  const subject = 'New Class Booking';
  const message = `
    Hello ${teacher.name},
    
    You have a new class booking!
    
    Details:
    - Student: ${booking.student.name}
    - Subject: ${booking.subject}
    - Date: ${new Date(booking.date).toLocaleDateString()}
    - Time: ${booking.startTime} - ${booking.endTime}
    - Duration: ${booking.duration} minutes
    
    Please confirm this booking in your dashboard.
  `;

  await sendEmail({
    email: teacher.email,
    subject,
    message,
  });
};

// Send reminder email
const sendReminder = async (booking, user, userType) => {
  const subject = 'Class Reminder';
  const message = `
    Hello ${user.name},
    
    This is a reminder for your upcoming class!
    
    Details:
    - Subject: ${booking.subject}
    - Date: ${new Date(booking.date).toLocaleDateString()}
    - Time: ${booking.startTime} - ${booking.endTime}
    - Duration: ${booking.duration} minutes
    
    ${userType === 'student' ? 'Teacher' : 'Student'}: ${userType === 'student' ? booking.teacher.name : booking.student.name}
    
    Meeting Link: ${booking.meetingLink || 'Will be provided before the class'}
    
    See you in class!
  `;

  await sendEmail({
    email: user.email,
    subject,
    message,
  });
};

module.exports = {
  sendEmail,
  sendBookingConfirmation,
  sendTeacherNotification,
  sendReminder,
}; 