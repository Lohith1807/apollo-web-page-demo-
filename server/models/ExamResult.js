import mongoose from 'mongoose';

const examResultSchema = new mongoose.Schema({
    email: { type: String, required: true },
    course: { type: String, required: true },
    code: { type: String },
    internal: { type: Number, default: 0 },
    external: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    grade: { type: String, default: 'F' },
    credits: { type: Number, default: 3 },
    semester: { type: String },
    updatedAt: { type: Date, default: Date.now }
});

examResultSchema.index({ email: 1, course: 1 }, { unique: true });

const ExamResult = mongoose.model('ExamResult', examResultSchema);
export default ExamResult;
