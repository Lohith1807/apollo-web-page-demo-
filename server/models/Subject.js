import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    branch: { type: String, required: true },
    specialization: { type: String, required: true },
    semester: { type: String, required: true },
    theory: { type: [String], default: [] },
    labs: { type: [String], default: [] },
    updatedAt: { type: Date, default: Date.now }
});

// Ensure unique combination
subjectSchema.index({ branch: 1, specialization: 1, semester: 1 }, { unique: true });

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;

