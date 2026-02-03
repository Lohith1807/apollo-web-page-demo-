import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'low' },
    author: { type: String }, // Storing name or email for now to simplify
    target: { type: String, enum: ['all', 'dean', 'teacher', 'student'], default: 'all' },
    createdAt: { type: Date, default: Date.now }
});

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
