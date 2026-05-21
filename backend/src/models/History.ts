import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['CAREER_ANALYSIS', 'JD_MATCH', 'AUTHENTICITY_CHECK', 'MOCK_INTERVIEW', 'RECRUITER_MODE'], required: true },
  title: { type: String, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true }
}, { timestamps: true });

export const History = mongoose.model('History', historySchema);
