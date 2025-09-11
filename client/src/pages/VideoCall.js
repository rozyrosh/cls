import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { FaPhone, FaPhoneSlash, FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash } from 'react-icons/fa';

const VideoCall = () => {
  const { bookingId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isInCall, setIsInCall] = useState(false);

  useEffect(() => {
    fetchBooking();
  }, [bookingId]);

  const fetchBooking = async () => {
    try {
      const response = await api.get(`/bookings/${bookingId}`);
      setBooking(response.data.data);
    } catch (error) {
      console.error('Error fetching booking:', error);
    } finally {
      setLoading(false);
    }
  };

  const startCall = () => {
    setIsInCall(true);
    // In a real implementation, this would initialize Jitsi Meet
    // For now, we'll just show a placeholder
  };

  const endCall = () => {
    setIsInCall(false);
    navigate('/dashboard');
  };

  const toggleAudio = () => {
    setIsAudioEnabled(!isAudioEnabled);
  };

  const toggleVideo = () => {
    setIsVideoEnabled(!isVideoEnabled);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Booking not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-primary"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const otherPerson = user?.role === 'student' ? booking.teacher : booking.student;

  return (
    <div className="min-h-screen bg-gray-900">
      {!isInCall ? (
        // Pre-call screen
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center text-white max-w-md mx-auto p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-4">Class Session</h1>
              <p className="text-gray-300 mb-6">
                {user?.role === 'student' ? 'You are about to join a class with' : 'You are about to start a class with'}
              </p>
              
              <div className="bg-gray-800 rounded-lg p-6 mb-6">
                <div className="flex items-center mb-4">
                  <img
                    src={otherPerson?.avatar?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherPerson?.name || 'User') + '&size=60&background=6366f1&color=fff'}
                    alt={otherPerson?.name}
                    className="w-15 h-15 rounded-full object-cover mr-4"
                    onError={(e) => {
                      e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(otherPerson?.name || 'User') + '&size=60&background=6366f1&color=fff';
                    }}
                  />
                  <div className="text-left">
                    <h3 className="text-xl font-semibold">{otherPerson?.name}</h3>
                    <p className="text-gray-400">{booking.subject}</p>
                  </div>
                </div>
                
                <div className="text-sm text-gray-400 space-y-2">
                  <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                  <p>Time: {booking.startTime} - {booking.endTime}</p>
                  <p>Duration: {booking.duration} minutes</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <button
                onClick={startCall}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center"
              >
                <FaPhone className="mr-2" />
                Join Class
              </button>
              
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : (
        // In-call screen
        <div className="relative min-h-screen bg-gray-900">
          {/* Main video area */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="mb-8">
                <h2 className="text-2xl font-bold mb-2">Class in Progress</h2>
                <p className="text-gray-300">Connected with {otherPerson?.name}</p>
              </div>
              
              {/* Placeholder for video streams */}
              <div className="bg-gray-800 rounded-lg p-8 mb-8 max-w-md mx-auto">
                <div className="text-center">
                  <div className="w-32 h-32 bg-gray-700 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <span className="text-4xl">📹</span>
                  </div>
                  <p className="text-gray-400">Video streams would appear here</p>
                  <p className="text-sm text-gray-500 mt-2">
                    In a real implementation, this would show Jitsi Meet video interface
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Call controls */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3">
              <button
                onClick={toggleAudio}
                className={`p-3 rounded-full ${
                  isAudioEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isAudioEnabled ? <FaMicrophone /> : <FaMicrophoneSlash />}
              </button>
              
              <button
                onClick={toggleVideo}
                className={`p-3 rounded-full ${
                  isVideoEnabled ? 'bg-gray-600 hover:bg-gray-700' : 'bg-red-600 hover:bg-red-700'
                } text-white`}
              >
                {isVideoEnabled ? <FaVideo /> : <FaVideoSlash />}
              </button>
              
              <button
                onClick={endCall}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
              >
                <FaPhoneSlash />
              </button>
            </div>
          </div>

          {/* Call info */}
          <div className="absolute top-8 left-8 text-white">
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold mb-2">Class Info</h3>
              <p className="text-sm text-gray-300">{booking.subject}</p>
              <p className="text-sm text-gray-300">
                {new Date(booking.date).toLocaleDateString()} • {booking.startTime} - {booking.endTime}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall; 