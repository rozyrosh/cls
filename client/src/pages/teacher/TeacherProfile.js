import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaStar, FaClock, FaCalendarAlt } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [teacher, setTeacher] = useState(null);
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [subject, setSubject] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    fetchTeacherProfile();
  }, [id]);

  const fetchTeacherProfile = async () => {
    try {
      const response = await api.get(`/api/teachers/${id}`);
      console.log('Teacher profile response:', response.data);
      setTeacher(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching teacher profile:', error);
      toast.error('Failed to load teacher profile');
      setLoading(false);
    }
  };

  const fetchAvailability = async (date) => {
    if (!date) return;
    
    setAvailabilityLoading(true);
    try {
      // Get the day of week (0 = Sunday, 1 = Monday, etc.)
      const selectedDateObj = new Date(date);
      const dayOfWeek = selectedDateObj.getDay();
      
      // Fetch availability for the specific teacher and day
      const response = await api.get(`/api/availability/teacher/${id}?dayOfWeek=${dayOfWeek}`);
      
      // Filter available slots for the selected date
      const availableSlots = response.data.data || response.data || [];
      const filteredSlots = availableSlots.filter(slot => slot.isAvailable);
      
      setAvailability(filteredSlots);
    } catch (error) {
      console.error('Error fetching availability:', error);
      toast.error('Failed to load availability');
      setAvailability([]);
    } finally {
      setAvailabilityLoading(false);
    }
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
    if (date) {
      fetchAvailability(date);
    } else {
      setAvailability([]);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !subject) {
      toast.error('Please fill in all fields');
      return;
    }

    setBookingLoading(true);
    try {
      const [startTime, endTime] = selectedTime.split('-');
      
      await api.post('/api/bookings', {
        teacherId: id,
        subject,
        date: selectedDate,
        startTime,
        duration: 60
      });

      toast.success('Class booked successfully!');
      navigate('/student/bookings');
    } catch (error) {
      console.error('Booking error:', error);
      toast.error(error.response?.data?.message || 'Failed to book class');
    } finally {
      setBookingLoading(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Get day name from day number
  const getDayName = (dayNumber) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[dayNumber];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teacher profile...</p>
        </div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Teacher not found</p>
        </div>
      </div>
    );
  }

  console.log('Rendering teacher profile with data:', teacher);
  console.log('Teacher subjects:', teacher.subjects);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Teacher Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-blue-600">
                {teacher.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">{teacher.name}</h1>
              <p className="text-gray-600 mt-1">
                {teacher.subjects && teacher.subjects.length > 0 
                  ? teacher.subjects.join(', ') 
                  : 'No subjects listed'}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <div className="flex items-center">
                  <FaStar className="text-yellow-400 mr-1" />
                  <span className="text-gray-700">{teacher.rating || 0}/5</span>
                  <span className="text-gray-500 ml-1">({teacher.totalReviews || 0} reviews)</span>
                </div>
                <div className="flex items-center">
                  <FaClock className="text-gray-400 mr-1" />
                  <span className="text-gray-700">${teacher.hourlyRate || 0}/hour</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Teacher Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">About</h2>
              <p className="text-gray-700 leading-relaxed">
                {teacher.bio || 'No bio available for this teacher.'}
              </p>
            </div>

            {/* Subjects */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Subjects</h2>
              {teacher.subjects && teacher.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects.map((subject, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No subjects listed for this teacher.</p>
              )}
            </div>
          </div>

          {/* Booking Form */}
          <div className="bg-white rounded-lg shadow-md p-6 h-fit">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Book a Class</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Subject
                </label>
                <select
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select a subject</option>
                  {teacher.subjects && teacher.subjects.length > 0 ? (
                    teacher.subjects.map((subj, index) => (
                      <option key={index} value={subj}>{subj}</option>
                    ))
                  ) : (
                    <option value="" disabled>No subjects available</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => handleDateChange(e.target.value)}
                    min={getMinDate()}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {selectedDate && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Time
                  </label>
                  <select
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={availabilityLoading}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                  >
                    <option value="">
                      {availabilityLoading ? 'Loading available times...' : 'Select a time'}
                    </option>
                    {!availabilityLoading && availability.length > 0 ? (
                      availability.map((slot, index) => (
                        <option key={index} value={`${slot.startTime}-${slot.endTime}`}>
                          {slot.startTime} - {slot.endTime}
                        </option>
                      ))
                    ) : !availabilityLoading ? (
                      <option value="" disabled>No available slots for this date</option>
                    ) : null}
                  </select>
                  {selectedDate && !availabilityLoading && availability.length === 0 && (
                    <p className="mt-1 text-sm text-gray-500">
                      No available time slots for {getDayName(new Date(selectedDate).getDay())}
                    </p>
                  )}
                </div>
              )}

              <button
                onClick={handleBooking}
                disabled={!selectedDate || !selectedTime || !subject || bookingLoading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {bookingLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Booking...
                  </div>
                ) : (
                  'Book Class'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile; 