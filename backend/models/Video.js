// models/Video.js
import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  videoPath: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Video = mongoose.model('Video', videoSchema);

export default Video;
