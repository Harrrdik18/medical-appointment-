import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

function AppointmentList() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const socket = useSocket();

  useEffect(() => {
    fetchAppointments();

    socket.on('appointmentCreated', handleAppointmentUpdate);
    socket.on('appointmentUpdated', handleAppointmentUpdate);
    socket.on('appointmentDeleted', handleAppointmentDelete);

    return () => {
      socket.off('appointmentCreated');
      socket.off('appointmentUpdated');
      socket.off('appointmentDeleted');
    };
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await axios.get('https://medical-appointment-c94a.onrender.com/api/appointments');
      setAppointments(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch appointments');
      setLoading(false);
    }
  };

  const handleAppointmentUpdate = (appointment) => {
    setAppointments(prev => {
      const index = prev.findIndex(a => a._id === appointment._id);
      if (index !== -1) {
        const newAppointments = [...prev];
        newAppointments[index] = appointment;
        return newAppointments;
      }
      return [...prev, appointment];
    });
  };

  const handleAppointmentDelete = (appointmentId) => {
    setAppointments(prev => prev.filter(a => a._id !== appointmentId));
  };

  const handleCancel = async (appointmentId) => {
    try {
      await axios.delete(`https://medical-appointment-c94a.onrender.com/api/appointments/${appointmentId}`);
      handleAppointmentDelete(appointmentId);
    } catch (err) {
      setError('Failed to cancel appointment');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Your Appointments</h2>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {appointments.map((appointment) => (
            <li key={appointment._id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-medium text-blue-600 truncate">
                    {appointment.patientName}
                  </div>
                  <div className="ml-2 flex-shrink-0 flex">
                    <button
                      onClick={() => handleCancel(appointment._id)}
                      className="px-3 py-1 text-sm font-medium text-red-700 hover:text-red-900"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      {appointment.appointmentType}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      {format(parseISO(appointment.date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                    <p>Duration: {appointment.duration} minutes</p>
                  </div>
                </div>
                {appointment.notes && (
                  <div className="mt-2 text-sm text-gray-500">
                    Notes: {appointment.notes}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default AppointmentList; 