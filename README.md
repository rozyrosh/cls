# CLICK4CLASS - Online Class Booking System

A modern web application for booking online classes between students and teachers. Built with React, Node.js, and MongoDB.

## 🚀 Features

### For Students
- **User Registration & Authentication**: Secure signup/login with JWT
- **Teacher Discovery**: Browse and search for qualified teachers
- **Teacher Profiles**: View detailed teacher information, subjects, ratings, and reviews
- **Class Booking**: Book classes with calendar integration and time slot selection
- **Booking Management**: View upcoming classes, booking history, and status
- **Real-time Notifications**: Get notified about booking confirmations and updates
- **Video Integration**: Join classes via integrated video calling (Jitsi Meet)

### For Teachers
- **Profile Management**: Create and update teacher profiles with subjects and rates
- **Availability Management**: Set available time slots using calendar interface
- **Booking Notifications**: Receive notifications for new class bookings
- **Class Management**: View and manage upcoming classes
- **Schedule Management**: Manage weekly availability and time slots
- **Earnings Tracking**: Monitor class bookings and earnings

### For Admins
- **User Management**: Manage students and teachers
- **Booking Overview**: View all bookings and system statistics
- **Teacher Verification**: Verify teacher accounts and credentials

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **React Icons** - Icon library
- **React Hot Toast** - Toast notifications
- **Axios** - HTTP client
- **JWT Decode** - JWT token handling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Bcryptjs** - Password hashing
- **Nodemailer** - Email notifications
- **Socket.io** - Real-time communication
- **Express Validator** - Input validation
- **Multer** - File upload handling

### Additional Features
- **Responsive Design** - Mobile-first approach
- **Real-time Updates** - WebSocket integration
- **Email Notifications** - Automated email system
- **Video Calling** - Jitsi Meet integration
- **File Upload** - Profile picture uploads
- **Search & Filtering** - Advanced search capabilities

## 📁 Project Structure

```
077/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── ...
│   ├── package.json
│   └── tailwind.config.js
├── server/                 # Node.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   ├── config.env         # Environment variables
│   ├── package.json
│   └── server.js
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd 077
   ```

2. **Install backend dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**

   Create a `.env` file in the server directory:
   ```bash
   cd ../server
   cp config.env .env
   ```

   Update the `.env` file with your configuration:
   ```env
   # Server Configuration
   PORT=5000
   NODE_ENV=development

   # MongoDB Configuration
   MONGODB_URI=mongodb://localhost:27017/online-class-booking

   # JWT Configuration
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=7d

   # Email Configuration (Gmail)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password

   # Frontend URL
   CLIENT_URL=http://localhost:3000

   # Video Call Configuration
   JITSI_DOMAIN=meet.jit.si
   ```

5. **Start MongoDB**
   ```bash
   # Make sure MongoDB is running on your system
   mongod
   ```

6. **Run the application**

   **Development mode (with hot reload):**
   ```bash
   # Terminal 1 - Start backend
   cd server
   npm run dev

   # Terminal 2 - Start frontend
   cd client
   npm start
   ```

   **Production mode:**
   ```bash
   # Build frontend
   cd client
   npm run build

   # Start backend
   cd ../server
   npm start
   ```

7. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

### Teachers
- `GET /api/teachers` - Get all teachers
- `GET /api/teachers/:id` - Get teacher by ID
- `GET /api/teachers/:id/availability` - Get teacher availability
- `GET /api/teachers/:id/schedule` - Get teacher schedule

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/status` - Update booking status
- `PUT /api/bookings/:id/cancel` - Cancel booking
- `POST /api/bookings/:id/review` - Add review

### Availability
- `POST /api/availability` - Set availability
- `GET /api/availability` - Get teacher availability
- `PUT /api/availability/:id` - Update availability
- `DELETE /api/availability/:id` - Delete availability

### Users (Admin)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

## 🔧 Configuration

### Email Setup
To enable email notifications, configure your Gmail account:
1. Enable 2-factor authentication
2. Generate an app password
3. Update the email configuration in `.env`

### MongoDB Setup
1. Install MongoDB on your system
2. Create a database named `online-class-booking`
3. Update the `MONGODB_URI` in your `.env` file

### JWT Configuration
Generate a strong JWT secret for production:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## 🎨 Customization

### Styling
The application uses Tailwind CSS. You can customize the design by:
1. Modifying `client/tailwind.config.js`
2. Updating the color scheme in `client/src/index.css`
3. Adding custom components in the components directory

### Adding New Features
1. Create new API routes in `server/routes/`
2. Add corresponding models in `server/models/`
3. Create React components in `client/src/components/`
4. Add new pages in `client/src/pages/`

## 🚀 Deployment

### Frontend Deployment (Vercel/Netlify)
1. Build the frontend: `npm run build`
2. Deploy the `build` folder to your hosting platform
3. Set environment variables for API URL

### Backend Deployment (Heroku/Railway)
1. Set up your hosting platform
2. Configure environment variables
3. Deploy the server directory
4. Set up MongoDB Atlas for database

### Environment Variables for Production
```env
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-frontend-domain.com
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

## 🎯 Roadmap

- [ ] Payment integration (Stripe/PayPal)
- [ ] Advanced search filters
- [ ] Group classes
- [ ] Course management
- [ ] Progress tracking
- [ ] Mobile app
- [ ] AI-powered recommendations
- [ ] Multi-language support

---

**Built with ❤️ for better education** 