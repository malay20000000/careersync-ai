import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'recruiter'], default: 'student' },
  resumeText: { type: String },
  resumeFileName: { type: String },
  profileSummary: { type: Object }
}, { timestamps: true });

export const User = mongoose.model('User', userSchema);
