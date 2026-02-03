import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema({
    // Using a flexible structure to store the nested department/spec data
    data: { type: mongoose.Schema.Types.Mixed, required: true },
    updatedAt: { type: Date, default: Date.now }
});

const Subject = mongoose.model('Subject', subjectSchema);
export default Subject;
