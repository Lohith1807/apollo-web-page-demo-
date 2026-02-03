import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
    email: { type: String, required: true },
    date: { type: String, required: true }, // Keeping string format for consistency with current code, or use Date
    subject: { type: String, required: true },
    status: { type: String, enum: ['Present', 'Absent', 'Not Marked'], default: 'Not Marked' },
    markedAt: { type: Date, default: Date.now }
});

// Index for faster lookups
attendanceSchema.index({ email: 1, date: 1, subject: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
export default Attendance;
