# Medical Appointment System

A full-stack web application for managing medical appointments between doctors and patients.


## Features

- 👨‍⚕️ View list of available doctors
- 📅 Check doctor's available time slots
- 🏥 Book appointments with preferred doctors
- ⏰ Real-time updates using WebSocket
- 📋 Manage and cancel appointments
- 🔄 Automatic slot availability updates

## Tech Stack

### Frontend
- React.js with Vite
- Tailwind CSS for styling
- Socket.IO client for real-time updates
- Axios for API requests
- date-fns for date manipulation




## API Endpoints

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get specific doctor
- `GET /api/doctors/:id/slots?date=YYYY-MM-DD` - Get available slots for a doctor

### Appointments
- `GET /api/appointments` - Get all appointments
- `GET /api/appointments/:id` - Get specific appointment
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Cancel appointment

