import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ['admin', 'coe', 'teacher', 'student', 'pending'],
        default: 'student'
    },
    // Academic fields
    batch: { type: String },
    branch: { type: String },
    specialization: { type: String },
    section: { type: String },
    semester: { type: String },
    rollNo: { type: String },
    id: { type: String }, // For faculty/admin

    // Profile fields
    department: { type: String },
    phone: { type: String },
    dob: { type: String },
    gender: { type: String },
    address: { type: String },

    // Faculty specific
    assignedSubjects: [{
        subject: String,
        batch: String,
        branch: String,
        semester: String,
        specialization: String
    }],

    // Lifecycle
    status: { type: String, enum: ['approved', 'pending'], default: 'approved' },
    submittedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

// Hash password before saving
userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
