import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    type: { type: String }, // Internal, Semester, etc.
    batch: { type: String },
    semester: { type: String },
    subjects: [String],
    dateRange: { type: String },
    status: { type: String, default: 'Scheduled' },
    createdAt: { type: Date, default: Date.now }
});

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
