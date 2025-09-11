import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { 
  FaGraduationCap, 
  FaChalkboardTeacher, 
  FaUsers, 
  FaClock, 
  FaStar,
  FaSearch,
  FaFilter,
  FaArrowRight
} from 'react-icons/fa';

const Home = () => {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/teachers?limit=6');
      setTeachers(response.data.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects.some(subject => subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSubject = !selectedSubject || teacher.subjects.includes(selectedSubject);
    return matchesSearch && matchesSubject;
  });

  const subjects = [
    'Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History',
    'Geography', 'Computer Science', 'Art', 'Music', 'Spanish', 'French'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Connect with Expert Teachers
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100 max-w-3xl mx-auto">
              Find qualified teachers for personalized online learning. 
              Book classes, learn at your own pace, and achieve your educational goals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!user ? (
                <>
                  <Link
                    to="/register"
                    className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                  >
                    Get Started
                  </Link>
                  <Link
                    to="/login"
                    className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
                  >
                    Find Teachers
                  </Link>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              Why Choose CLICK4CLASS?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our platform provides everything you need for successful online learning
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaChalkboardTeacher className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Teachers</h3>
              <p className="text-gray-600">
                Connect with qualified and experienced teachers in your subject of interest
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-gray-600">
                Book classes at times that work for you with our flexible scheduling system
              </p>
            </div>

            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUsers className="h-8 w-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Personalized Learning</h3>
              <p className="text-gray-600">
                One-on-one sessions tailored to your learning style and pace
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Teacher Search Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Find Your Perfect Teacher
            </h2>
            <p className="text-lg text-gray-600">
              Browse through our qualified teachers and find the one that matches your needs
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search teachers or subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input pl-10"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="input pl-10 appearance-none"
                >
                  <option value="">All Subjects</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Teachers Grid */}
          {loading ? (
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeachers.map(teacher => (
                <div key={teacher._id} className="card hover:shadow-lg transition-shadow">
                  <div className="card-body">
                    <div className="flex items-center mb-4">
                      <img
                        src={teacher.avatar?.url || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacher.name) + '&size=60&background=6366f1&color=fff'}
                        alt={teacher.name}
                        className="w-15 h-15 rounded-full object-cover mr-4"
                        onError={(e) => {
                          e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(teacher.name) + '&size=60&background=6366f1&color=fff';
                        }}
                      />
                      <div>
                        <h3 className="font-semibold text-lg">{teacher.name}</h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <FaStar className="text-yellow-400 mr-1" />
                          <span>{teacher.rating.toFixed(1)}</span>
                          <span className="mx-1">•</span>
                          <span>{teacher.totalReviews} reviews</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {teacher.subjects.slice(0, 3).map(subject => (
                          <span key={subject} className="badge badge-info text-xs">
                            {subject}
                          </span>
                        ))}
                        {teacher.subjects.length > 3 && (
                          <span className="text-gray-500 text-xs">+{teacher.subjects.length - 3} more</span>
                        )}
                      </div>
                      {teacher.bio && (
                        <p className="text-gray-600 text-sm line-clamp-2">{teacher.bio}</p>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-semibold text-primary-600">
                        ${teacher.hourlyRate}/hr
                      </div>
                      <Link
                        to={`/teacher/${teacher._id}`}
                        className="btn btn-primary text-sm"
                      >
                        View Profile
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* View All Teachers Button */}
          <div className="text-center mt-8">
            <Link
              to="/teachers"
              className="inline-flex items-center btn btn-outline"
            >
              View All Teachers
              <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Start Learning?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
            Join thousands of students who are already learning with our expert teachers
          </p>
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Sign Up as Student
              </Link>
              <Link
                to="/register?role=teacher"
                className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary-600 transition-colors"
              >
                Become a Teacher
              </Link>
            </div>
          ) : (
            <Link
              to="/dashboard"
              className="bg-white text-primary-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Go to Dashboard
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home; 