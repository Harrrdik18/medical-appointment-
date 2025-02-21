const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { parseISO, addMinutes, isWithinInterval } = require('date-fns');
const Appointment = require('../models/Appointment');
const Doctor = require('../models/Doctor');

// Validation middleware
const appointmentValidation = [
  body('doctorId').notEmpty().isMongoId(),
  body('date').notEmpty().isISO8601(),
  body('duration').isInt({ min: 15, max: 120 }),
  body('appointmentType').notEmpty().trim(),
  body('patientName').notEmpty().trim(),
  body('notes').optional().trim()
];

// Check for appointment conflicts
const checkAvailability = async (doctorId, date, duration, excludeAppointmentId = null) => {
  const appointmentStart = parseISO(date);
  const appointmentEnd = addMinutes(appointmentStart, duration);

  // Find any overlapping appointments
  const query = {
    doctorId,
    _id: { $ne: excludeAppointmentId }, // Exclude current appointment when updating
    date: {
      $lt: appointmentEnd
    }
  };

  const conflictingAppointments = await Appointment.find(query);

  return !conflictingAppointments.some(existing => {
    const existingEnd = addMinutes(existing.date, existing.duration);
    return isWithinInterval(appointmentStart, { start: existing.date, end: existingEnd }) ||
           isWithinInterval(appointmentEnd, { start: existing.date, end: existingEnd });
  });
};

// Get all appointments
router.get('/', async (req, res) => {
  try {
    const appointments = await Appointment.find().populate('doctorId');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get specific appointment
router.get('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id).populate('doctorId');
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create appointment
router.post('/', appointmentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const isAvailable = await checkAvailability(
      req.body.doctorId,
      req.body.date,
      req.body.duration
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const appointment = new Appointment(req.body);
    const savedAppointment = await appointment.save();
    
    // Emit socket event for real-time updates
    req.app.get('io').emit('appointmentCreated', savedAppointment);
    
    res.status(201).json(savedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update appointment
router.put('/:id', appointmentValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const isAvailable = await checkAvailability(
      req.body.doctorId,
      req.body.date,
      req.body.duration,
      req.params.id
    );

    if (!isAvailable) {
      return res.status(400).json({ message: 'Time slot is not available' });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Emit socket event for real-time updates
    req.app.get('io').emit('appointmentUpdated', appointment);

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete appointment
router.delete('/:id', async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Emit socket event for real-time updates
    req.app.get('io').emit('appointmentDeleted', req.params.id);

    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 