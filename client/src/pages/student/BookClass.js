import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaClock, FaSearch, FaFilter } from 'react-icons/fa';
import api from '../../services/api';
import toast from 'react-hot-toast';

const BookClass = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetchTeachers();
    fetchSubjects();
  }, []);

  const fetchTeachers = async () => {
    try {
      const response = await api.get('/api/teachers');
      setTeachers(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load teachers');
      setLoading(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await api.get('/api/teachers/subjects/popular');
      setSubjects(response.data);
    } catch (error) {
      console.error('Failed to load subjects');
    }
  };

  const filteredTeachers = teachers.filter(teacher => {
    const matchesSearch = teacher.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         teacher.subjects?.some(subject => 
                           subject.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    const matchesSubject = !selectedSubject || teacher.subjects?.includes(selectedSubject);
    
    return matchesSearch && matchesSubject;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading teachers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Your Perfect Teacher</h1>
          <p className="text-gray-600">Browse our qualified teachers and book your next class</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search teachers or subjects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((subject, index) => (
                  <option key={index} value={subject}>{subject}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-gray-600">
                {filteredTeachers.length} teacher{filteredTeachers.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        </div>

        {/* Teachers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.map((teacher) => (
            <div key={teacher._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-blue-600">
                      {teacher.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {teacher.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {teacher.subjects?.slice(0, 2).join(', ')}
                      {teacher.subjects?.length > 2 && '...'}
                    </p>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center">
                        <FaStar className="text-yellow-400 mr-1" />
                        <span className="text-gray-700">{teacher.rating || 0}</span>
                        <span className="text-gray-500 ml-1">({teacher.totalReviews || 0})</span>
                      </div>
                      <div className="flex items-center">
                        <FaClock className="text-gray-400 mr-1" />
                        <span className="text-gray-700">${teacher.hourlyRate || 0}/hr</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {teacher.bio || 'No bio available'}
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-1">
                  {teacher.subjects?.slice(0, 3).map((subject, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium"
                    >
                      {subject}
                    </span>
                  ))}
                  {teacher.subjects?.length > 3 && (
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                      +{teacher.subjects.length - 3} more
                    </span>
                  )}
                </div>

                <div className="mt-6">
                  <Link
                    to={`/teacher/${teacher._id}`}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center block"
                  >
                    View Profile & Book
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookClass; 