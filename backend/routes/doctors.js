const express = require('express');
const router = express.Router();
const { parseISO, format, addMinutes, isWithinInterval } = require('date-fns');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

router.get('/', async (req, res) => {
  try {
    const doctors = await Doctor.find();
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.json(doctor);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id/slots', async (req, res) => {
  try {
    const { id } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ message: 'Date parameter is required' });
    }

    const doctor = await Doctor.findById(id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    const queryDate = parseISO(date);
    const startOfDay = new Date(queryDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(queryDate.setHours(23, 59, 59, 999));

    const appointments = await Appointment.find({
      doctorId: id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const [workingStartHour, workingStartMinute] = doctor.workingHours.start.split(':');
    const [workingEndHour, workingEndMinute] = doctor.workingHours.end.split(':');

    let currentSlot = new Date(queryDate.setHours(
      parseInt(workingStartHour),
      parseInt(workingStartMinute),
      0,
      0
    ));

    const endTime = new Date(queryDate.setHours(
      parseInt(workingEndHour),
      parseInt(workingEndMinute),
      0,
      0
    ));

    const availableSlots = [];
    const slotDuration = 30; 

    while (currentSlot < endTime) {
      const slotEnd = addMinutes(currentSlot, slotDuration);
      
      const isSlotAvailable = !appointments.some(appointment => {
        const appointmentEnd = addMinutes(appointment.date, appointment.duration);
        return isWithinInterval(currentSlot, { start: appointment.date, end: appointmentEnd }) ||
               isWithinInterval(slotEnd, { start: appointment.date, end: appointmentEnd });
      });

      if (isSlotAvailable) {
        availableSlots.push(format(currentSlot, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"));
      }

      currentSlot = slotEnd;
    }

    res.json(availableSlots);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 