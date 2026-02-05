import mongoose from 'mongoose';

const attendanceSessionSchema = new mongoose.Schema({
    specialization: { type: String, required: true }, // e.g., "AI&DS"
    batch: { type: String, required: true },          // e.g., "2022-2026"
    subject: { type: String, required: true },        // e.g., "Data Structures"
    date: { type: String, required: true },           // Store as "YYYY-MM-DD" to match existing frontend filtering
    startTime: { type: String, default: "09:00 AM" },

    // The list of students for *this specific session*
    records: [{
        email: { type: String, required: true },
        name: String,
        status: { type: String, enum: ['Present', 'Absent', 'Not Marked'], default: 'Not Marked' },
        markedAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Optimize Query: "Get attendance for a specific class on a specific day"
attendanceSessionSchema.index({ specialization: 1, batch: 1, subject: 1, date: 1 }, { unique: true });

// Optimize Query: "Get all attendance for a specific student"
attendanceSessionSchema.index({ "records.email": 1 });

const AttendanceSession = mongoose.model('AttendanceSession', attendanceSessionSchema);

export default AttendanceSession;
