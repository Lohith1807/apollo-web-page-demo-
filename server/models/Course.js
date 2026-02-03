import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    title: { type: String, required: true },
    code: { type: String, required: true, unique: true },
    description: { type: String },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now }
});

const Course = mongoose.model('Course', courseSchema);
export default Course;
