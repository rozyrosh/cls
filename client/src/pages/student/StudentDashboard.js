import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../services/api';
import { 
  FaCalendarAlt, 
  FaClock, 
  FaStar, 
  FaSearch, 
  FaBookOpen,
  FaUserGraduate,
  FaChalkboardTeacher
} from 'react-icons/fa';

const StudentDashboard = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalBookings: 0,
    upcomingBookings: 0,
    completedBookings: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings?limit=5');
      setBookings(response.data.data);
      
      // Calculate stats
      const allBookings = response.data.data;
      const upcoming = allBookings.filter(b => b.status === 'confirmed' || b.status === 'pending');
      const completed = allBookings.filter(b => b.status === 'completed');
      const totalSpent = completed.reduce((sum, b) => sum + b.amount, 0);
      
      setStats({
        totalBookings: allBookings.length,
        upcomingBookings: upcoming.length,
        completedBookings: completed.length,
        totalSpent
      });
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'badge-warning', text: 'Pending' },
      confirmed: { class: 'badge-info', text: 'Confirmed' },
      completed: { class: 'badge-success', text: 'Completed' },
      cancelled: { class: 'badge-error', text: 'Cancelled' },
      'no-show': { class: 'badge-error', text: 'No Show' }
    };
    
    const config = statusConfig[status] || { class: 'badge-secondary', text: status };
    return <span className={`badge ${config.class}`}>{config.text}</span>;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.name}!</h1>
          <p className="text-gray-600 mt-2">Here's what's happening with your learning journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-primary-100 p-3 rounded-lg">
                  <FaCalendarAlt className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FaClock className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Upcoming Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.upcomingBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-3 rounded-lg">
                  <FaBookOpen className="h-6 w-6 text-yellow-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Completed Classes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completedBookings}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <FaStar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-gray-900">${stats.totalSpent.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="card-body">
              <div className="space-y-4">
                <Link
                  to="/"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaSearch className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">Find Teachers</h3>
                    <p className="text-sm text-gray-600">Browse and book classes with expert teachers</p>
                  </div>
                </Link>
                
                <Link
                  to="/student/bookings"
                  className="flex items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FaCalendarAlt className="h-5 w-5 text-primary-600 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">My Bookings</h3>
                    <p className="text-sm text-gray-600">View and manage your class bookings</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Profile Overview</h2>
            </div>
            <div className="card-body">
              <div className="flex items-center mb-4">
                <img
                  src={user?.avatar?.url || 'https://via.placeholder.com/60'}
                  alt={user?.name}
                  className="w-15 h-15 rounded-full object-cover mr-4"
                />
                <div>
                  <h3 className="font-medium text-gray-900">{user?.name}</h3>
                  <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
                  {user?.grade && (
                    <p className="text-sm text-gray-600">{user.grade}</p>
                  )}
                </div>
              </div>
              
              {user?.interests && user.interests.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Interests:</h4>
                  <div className="flex flex-wrap gap-1">
                    {user.interests.slice(0, 3).map(interest => (
                      <span key={interest} className="badge badge-info text-xs">
                        {interest}
                      </span>
                    ))}
                    {user.interests.length > 3 && (
                      <span className="text-gray-500 text-xs">+{user.interests.length - 3} more</span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Recent Bookings</h2>
              <Link
                to="/student/bookings"
                className="text-primary-600 hover:text-primary-700 text-sm font-medium"
              >
                View all
              </Link>
            </div>
          </div>
          <div className="card-body">
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
              </div>
            ) : bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map(booking => (
                  <div key={booking._id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center">
                      <img
                        src={booking.teacher?.avatar?.url || 'https://via.placeholder.com/40'}
                        alt={booking.teacher?.name}
                        className="w-10 h-10 rounded-full object-cover mr-3"
                      />
                      <div>
                        <h3 className="font-medium text-gray-900">{booking.teacher?.name}</h3>
                        <p className="text-sm text-gray-600">{booking.subject}</p>
                        <div className="flex items-center mt-1">
                          <FaCalendarAlt className="h-3 w-3 text-gray-400 mr-1" />
                          <span className="text-xs text-gray-500">
                            {formatDate(booking.date)} at {formatTime(booking.startTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="mb-1">{getStatusBadge(booking.status)}</div>
                      <div className="text-sm font-medium text-gray-900">
                        ${booking.amount.toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaBookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
                <p className="text-gray-600 mb-4">Start your learning journey by booking your first class</p>
                <Link
                  to="/"
                  className="btn btn-primary"
                >
                  Find Teachers
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 