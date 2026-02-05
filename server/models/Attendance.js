import mongoose from 'mongoose';

const logSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, default: '09:00 AM' },
    status: { type: String, enum: ['Present', 'Absent', 'Not Marked'], default: 'Not Marked' },
    markedAt: { type: Date, default: Date.now }
});

const studentSchema = new mongoose.Schema({
    email: { type: String, required: true },
    name: { type: String },
    logs: [logSchema]
});

const subjectSchema = new mongoose.Schema({
    subjectName: { type: String, required: true },
    students: [studentSchema]
});

const batchSchema = new mongoose.Schema({
    batchName: { type: String, required: true },
    subjects: [subjectSchema]
});

const attendanceSchema = new mongoose.Schema({
    specialization: { type: String, required: true, unique: true }, // e.g., "Core", "AI&DS"
    batches: [batchSchema]
}, { timestamps: true });

// Multikey index for faster student lookups
attendanceSchema.index({ "batches.subjects.students.email": 1 });

const Attendance = mongoose.model('Attendance', attendanceSchema);

export default Attendance;
