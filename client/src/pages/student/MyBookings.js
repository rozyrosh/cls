import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaClock, FaStar, FaVideo } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../../services/api';
import toast from 'react-hot-toast';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await api.get('/api/bookings');
      setBookings(response.data.data || []);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load bookings');
      setBookings([]);
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    try {
      await api.put(`/api/bookings/${bookingId}/cancel`);
      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      completed: { color: 'bg-blue-100 text-blue-800', text: 'Completed' },
      cancelled: { color: 'bg-red-100 text-red-800', text: 'Cancelled' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const filteredBookings = Array.isArray(bookings) ? bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  }) : [];

  const upcomingBookings = Array.isArray(filteredBookings) ? filteredBookings.filter(booking => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const isUpcoming = bookingDateTime > now && booking.status !== 'cancelled';
    return isUpcoming;
  }) : [];

  const pastBookings = Array.isArray(filteredBookings) ? filteredBookings.filter(booking => {
    const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
    const now = new Date();
    const isPast = bookingDateTime <= now || booking.status === 'cancelled';
    return isPast;
  }) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your scheduled classes</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex space-x-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'all' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              All ({Array.isArray(bookings) ? bookings.length : 0})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'confirmed' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Confirmed ({Array.isArray(bookings) ? bookings.filter(b => b.status === 'confirmed').length : 0})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'completed' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Completed ({Array.isArray(bookings) ? bookings.filter(b => b.status === 'completed').length : 0})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filter === 'cancelled' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Cancelled ({Array.isArray(bookings) ? bookings.filter(b => b.status === 'cancelled').length : 0})
            </button>
          </div>
        </div>

        {/* Upcoming Bookings */}
        {upcomingBookings.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Upcoming Classes</h2>
            <div className="space-y-4">
              {upcomingBookings.map((booking) => (
                <div key={booking._id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-lg font-bold text-blue-600">
                            {booking.teacher?.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {booking.teacher?.name}
                          </h3>
                          <p className="text-gray-600">{booking.subject}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center">
                          <FaCalendar className="text-gray-400 mr-2" />
                          <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="text-gray-400 mr-2" />
                          <span>{booking.startTime} - {booking.endTime}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-gray-600">${booking.amount}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                      {getStatusBadge(booking.status)}
                      
                      {booking.status === 'confirmed' && (
                        <Link
                          to={`/video-call/${booking._id}`}
                          className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                        >
                          <FaVideo className="mr-1" />
                          Join Class
                        </Link>
                      )}
                      
                      {(booking.status === 'pending' || booking.status === 'confirmed') && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Show All Bookings when All filter is selected */}
        {filter === 'all' && filteredBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">All Bookings</h2>
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
                const now = new Date();
                const isUpcoming = bookingDateTime > now && booking.status !== 'cancelled';
                const isPast = bookingDateTime <= now || booking.status === 'cancelled';
                
                return (
                  <div key={booking._id} className={`bg-white rounded-lg shadow-md p-6 ${isPast ? 'border-l-4 border-gray-300' : 'border-l-4 border-blue-500'}`}>
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${isPast ? 'bg-gray-100' : 'bg-blue-100'}`}>
                            <span className={`text-lg font-bold ${isPast ? 'text-gray-600' : 'text-blue-600'}`}>
                              {booking.teacher?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.teacher?.name}
                            </h3>
                            <p className="text-gray-600">{booking.subject}</p>
                            <p className="text-xs text-gray-500">
                              {isUpcoming ? 'Upcoming' : isPast ? 'Past' : 'Current'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <FaCalendar className="text-gray-400 mr-2" />
                            <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="text-gray-400 mr-2" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">${booking.amount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        {getStatusBadge(booking.status)}
                        
                        {booking.status === 'confirmed' && isUpcoming && (
                          <Link
                            to={`/video-call/${booking._id}`}
                            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <FaVideo className="mr-1" />
                            Join Class
                          </Link>
                        )}
                        
                        {(booking.status === 'pending' || (booking.status === 'confirmed' && isUpcoming)) && (
                          <button
                            onClick={() => handleCancelBooking(booking._id)}
                            className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                        
                        {booking.status === 'completed' && !booking.rating && isPast && (
                          <button className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            <FaStar className="mr-1" />
                            Rate Class
                          </button>
                        )}
                        
                        {booking.rating && isPast && (
                          <div className="flex items-center">
                            <FaStar className="text-yellow-400 mr-1" />
                            <span>{booking.rating}/5</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Show Cancelled Bookings when Cancelled filter is selected */}
        {filter === 'cancelled' && filteredBookings.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Cancelled Bookings</h2>
            <div className="space-y-4">
              {filteredBookings.map((booking) => {
                const bookingDateTime = new Date(`${booking.date}T${booking.startTime}`);
                const now = new Date();
                const isPast = bookingDateTime <= now;
                
                return (
                  <div key={booking._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-300">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-3">
                          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-lg font-bold text-red-600">
                              {booking.teacher?.name?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                              {booking.teacher?.name}
                            </h3>
                            <p className="text-gray-600">{booking.subject}</p>
                            <p className="text-xs text-gray-500">
                              {isPast ? 'Past' : 'Upcoming'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="flex items-center">
                            <FaCalendar className="text-gray-400 mr-2" />
                            <span>{format(new Date(booking.date), 'MMM dd, yyyy')}</span>
                          </div>
                          <div className="flex items-center">
                            <FaClock className="text-gray-400 mr-2" />
                            <span>{booking.startTime} - {booking.endTime}</span>
                          </div>
                          <div className="flex items-center">
                            <span className="text-gray-600">${booking.amount}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        {getStatusBadge(booking.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">📚</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings found</h3>
            <p className="text-gray-600 mb-4">You haven't booked any classes yet</p>
            <Link
              to="/book-class"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              Find Teachers
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;