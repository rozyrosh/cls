import React, { useState, useEffect } from 'react';
import { FaClock, FaTrash } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TeacherSchedule = () => {
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDay, setSelectedDay] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  // Convert day name to number (0-6)
  const getDayNumber = (dayName) => {
    const dayMap = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
      'Sunday': 0
    };
    return dayMap[dayName] || 0;
  };

  useEffect(() => {
    fetchAvailability();
    
    // Debug authentication
    const token = localStorage.getItem('token');
    console.log('Auth token exists:', !!token);
    if (token) {
      try {
        const decoded = JSON.parse(atob(token.split('.')[1]));
        console.log('User role:', decoded.role);
        console.log('User ID:', decoded.id);
      } catch (e) {
        console.log('Invalid token format');
      }
    }
  }, []);

  const fetchAvailability = async () => {
    try {
      const response = await api.get('/api/availability');
      // Handle the nested data structure from the server
      const availabilityData = response.data.data || response.data || [];
      
      // If the data is grouped by day (object with day numbers as keys), flatten it
      let flattenedData = [];
      if (availabilityData && typeof availabilityData === 'object' && !Array.isArray(availabilityData)) {
        // Data is grouped by day, flatten it
        flattenedData = Object.values(availabilityData).flat();
      } else if (Array.isArray(availabilityData)) {
        // Data is already an array
        flattenedData = availabilityData;
      }
      
      setAvailability(flattenedData);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load availability');
      setAvailability([]);
      setLoading(false);
    }
  };

  const handleAddSlot = async () => {
    if (!selectedDay || !startTime || !endTime) {
      toast.error('Please fill in all fields');
      return;
    }

    if (startTime >= endTime) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      setSaving(true);
      const slotData = {
        dayOfWeek: getDayNumber(selectedDay),
        startTime,
        endTime,
        isAvailable: true
      };
      console.log('Adding slot data:', slotData);
      await api.post('/api/availability', slotData);
      
      toast.success('Time slot added successfully');
      setSelectedDay('');
      setStartTime('');
      setEndTime('');
      fetchAvailability();
    } catch (error) {
      console.error('Add slot error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to add time slot');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this time slot?')) {
      return;
    }

    try {
      console.log('Attempting to delete slot:', slotId);
      const response = await api.delete(`/api/availability/${slotId}`);
      console.log('Delete response:', response.data);
      toast.success('Time slot deleted successfully');
      fetchAvailability();
    } catch (error) {
      console.error('Delete slot error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to delete time slot');
    }
  };

  const handleBulkUpdate = async (day, isAvailable) => {
    try {
      setSaving(true);
      const dayNumber = getDayNumber(day);
      const slots = Array.isArray(availability) ? availability.filter(slot => slot.dayOfWeek === dayNumber) : [];
      
      if (slots.length === 0) {
        // Create default slots for the day only if they don't exist
        const defaultSlots = [
          { startTime: '09:00', endTime: '12:00' },
          { startTime: '14:00', endTime: '17:00' },
          { startTime: '18:00', endTime: '21:00' }
        ];

        for (const slot of defaultSlots) {
          try {
            const slotData = {
              dayOfWeek: dayNumber,
              startTime: slot.startTime,
              endTime: slot.endTime,
              isAvailable
            };
            console.log('Sending slot data:', slotData);
            await api.post('/api/availability', slotData);
          } catch (error) {
            // If slot already exists, just update its availability
            if (error.response?.data?.message === 'Time slot already exists') {
              try {
                // Find the existing slot and update it
                const existingSlotsResponse = await api.get('/api/availability');
                const existingSlotsData = existingSlotsResponse.data;
                
                // Handle different response structures
                let allSlots = [];
                if (existingSlotsData && typeof existingSlotsData === 'object') {
                  if (Array.isArray(existingSlotsData)) {
                    allSlots = existingSlotsData;
                  } else if (existingSlotsData.data && Array.isArray(existingSlotsData.data)) {
                    allSlots = existingSlotsData.data;
                  } else if (existingSlotsData.success && existingSlotsData.data) {
                    // If data is grouped by day, flatten it
                    if (typeof existingSlotsData.data === 'object' && !Array.isArray(existingSlotsData.data)) {
                      allSlots = Object.values(existingSlotsData.data).flat();
                    } else if (Array.isArray(existingSlotsData.data)) {
                      allSlots = existingSlotsData.data;
                    }
                  }
                }
                
                // Ensure allSlots is an array
                if (!Array.isArray(allSlots)) {
                  console.warn('allSlots is not an array:', allSlots);
                  allSlots = [];
                }
                
                const existingSlot = allSlots.find(s => 
                  s && s.dayOfWeek === dayNumber && 
                  s.startTime === slot.startTime && 
                  s.endTime === slot.endTime
                );
                
                if (existingSlot && existingSlot._id) {
                  await api.put(`/api/availability/${existingSlot._id}`, {
                    isAvailable
                  });
                }
              } catch (fetchError) {
                console.error('Error fetching existing slots:', fetchError);
                // Continue with the next slot
              }
            } else {
              throw error;
            }
          }
        }
      } else {
        // Update existing slots
        for (const slot of slots) {
          if (slot._id) {
            await api.put(`/api/availability/${slot._id}`, {
              isAvailable
            });
          }
        }
      }
      
      toast.success(`${day} availability updated successfully`);
      fetchAvailability();
    } catch (error) {
      console.error('Bulk update error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Failed to update availability');
    } finally {
      setSaving(false);
    }
  };

  const getSlotsForDay = (day) => {
    return Array.isArray(availability) ? availability.filter(slot => slot.dayOfWeek === getDayNumber(day)) : [];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your schedule...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Schedule</h1>
          <p className="text-gray-600">Manage your availability for students to book classes</p>
        </div>

        {/* Add New Time Slot */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Add Time Slot</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Day of Week
              </label>
              <select
                value={selectedDay}
                onChange={(e) => setSelectedDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a day</option>
                {daysOfWeek.map((day) => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex items-end">
              <button
                onClick={handleAddSlot}
                disabled={saving || !selectedDay || !startTime || !endTime}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? 'Adding...' : 'Add Slot'}
              </button>
            </div>
          </div>
        </div>

        {/* Weekly Schedule */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Weekly Schedule</h2>
          <div className="space-y-6">
            {daysOfWeek.map((day) => {
              const daySlots = getSlotsForDay(day);
              const isAvailable = Array.isArray(daySlots) && daySlots.some(slot => slot.isAvailable);
              
              return (
                <div key={day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{day}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkUpdate(day, true)}
                        disabled={saving}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          isAvailable 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-800'
                        }`}
                      >
                        Available
                      </button>
                      <button
                        onClick={() => handleBulkUpdate(day, false)}
                        disabled={saving}
                        className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                          !isAvailable 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-800'
                        }`}
                      >
                        Unavailable
                      </button>
                    </div>
                  </div>
                  
                  {daySlots.length > 0 ? (
                    <div className="space-y-2">
                      {daySlots.map((slot) => (
                        <div
                          key={slot._id}
                          className={`flex items-center justify-between p-3 rounded-md ${
                            slot.isAvailable ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                          }`}
                        >
                          <div className="flex items-center space-x-4">
                            <FaClock className="text-gray-400" />
                            <span className="text-sm font-medium">
                              {slot.startTime} - {slot.endTime}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              slot.isAvailable 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {slot.isAvailable ? 'Available' : 'Unavailable'}
                            </span>
                          </div>
                          
                          <button
                            onClick={() => handleDeleteSlot(slot._id)}
                            className="text-red-600 hover:text-red-800 transition-colors"
                          >
                            <FaTrash className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 text-gray-500">
                      No time slots set for {day}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips for Setting Your Schedule</h3>
          <ul className="text-blue-800 space-y-1 text-sm">
            <li>• Set multiple time slots per day to give students more options</li>
            <li>• Consider your timezone and peak study hours</li>
            <li>• Keep some buffer time between classes</li>
            <li>• Update your availability regularly to reflect your current schedule</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherSchedule; 