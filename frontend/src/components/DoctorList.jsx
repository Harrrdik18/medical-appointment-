import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function DoctorList() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        console.log('Fetching doctors...');
        const response = await axios.get('http://localhost:3000/api/doctors');
        console.log('Doctors response:', response.data);
        setDoctors(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching doctors:', err);
        setError(`Failed to fetch doctors: ${err.message}`);
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4 bg-red-50 rounded-lg">
        {error}
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!doctors || doctors.length === 0) {
    return (
      <div className="text-center text-gray-600 p-4">
        <p>No doctors available.</p>
        <p className="text-sm mt-2">Please add some doctors to the system.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {doctors.map((doctor) => (
        <div
          key={doctor._id}
          className="bg-white overflow-hidden shadow rounded-lg cursor-pointer hover:shadow-lg transition-shadow duration-200"
          onClick={() => navigate(`/doctor/${doctor._id}`)}
        >
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {doctor.name}
            </h3>
            <div className="mt-2 text-sm text-gray-500">
              <p>Working Hours: {doctor.workingHours.start} - {doctor.workingHours.end}</p>
              {doctor.specialization && (
                <p className="mt-1">Specialization: {doctor.specialization}</p>
              )}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-4 sm:px-6">
            <div className="text-sm">
              <button
                className="font-medium text-blue-600 hover:text-blue-500"
              >
                View Available Slots →
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default DoctorList; 