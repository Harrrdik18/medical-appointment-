import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { format, addDays, parseISO } from 'date-fns';
import axios from 'axios';
import BookingModal from './BookingModal';

function AppointmentCalendar() {
  const { id } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const next7Days = Array.from({ length: 7 }, (_, i) => addDays(new Date(), i));

  useEffect(() => {
    const fetchDoctorAndSlots = async () => {
      try {
        const [doctorResponse, slotsResponse] = await Promise.all([
          axios.get(`https://medical-appointment-c94a.onrender.com/api/doctors/${id}`),
          axios.get(`https://medical-appointment-c94a.onrender.com/api/doctors/${id}/slots`, {
            params: { date: format(selectedDate, 'yyyy-MM-dd') }
          })
        ]);

        setDoctor(doctorResponse.data);
        setAvailableSlots(slotsResponse.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch data');
        setLoading(false);
      }
    };

    fetchDoctorAndSlots();
  }, [id, selectedDate]);

  const handleSlotClick = (slot) => {
    setSelectedSlot(slot);
    setIsModalOpen(true);
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
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-900">
          {doctor?.name}'s Available Slots
        </h2>
        
        {/* Date Selection */}
        <div className="flex space-x-4 mt-4 overflow-x-auto pb-4">
          {next7Days.map((date) => (
            <button
              key={date.toString()}
              onClick={() => setSelectedDate(date)}
              className={`px-4 py-2 rounded-md ${
                format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              {format(date, 'MMM d')}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-4 mt-6">
          {availableSlots.map((slot) => (
            <button
              key={slot}
              onClick={() => handleSlotClick(slot)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-2 px-4 rounded"
            >
              {format(parseISO(slot), 'h:mm a')}
            </button>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <BookingModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          doctorId={id}
          selectedSlot={selectedSlot}
        />
      )}
    </div>
  );
}

export default AppointmentCalendar; 