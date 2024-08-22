import mongoose from 'mongoose';

const userProgressSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },  // Unique session or identifier instead of userId
  videoId: { type: mongoose.Schema.Types.ObjectId, ref: 'Video', required: true },
  completed: { type: Boolean, default: false },
  lastPosition: { type: Number, default: 0 },
  watchedVideos: { type: Number, default: 0 },
});

export default mongoose.model('UserProgress', userProgressSchema);

