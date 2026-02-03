import mongoose from 'mongoose';

const examConfigSchema = new mongoose.Schema({
    batch: { type: String, required: true },
    semester: { type: String, required: true },
    published: { type: Boolean, default: false }
});

examConfigSchema.index({ batch: 1, semester: 1 }, { unique: true });

const ExamConfig = mongoose.model('ExamConfig', examConfigSchema);
export default ExamConfig;
