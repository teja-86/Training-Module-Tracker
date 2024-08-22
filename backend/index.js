import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import videoRoutes from './routes/videos.js';
import multer from 'multer';
import Video from './models/Video.js';
import path from 'path';
import { fileURLToPath } from 'url';
import UserProgress from './models/UserProgress.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Get the directory name of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch((error) => console.error("MongoDB connection failed:", error));

app.use('/api/videos', videoRoutes);


// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, 'uploads')); // Specify the uploads directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Append timestamp to the filename
  },
});

const upload = multer({ storage });

// Route to handle video upload
app.post('/api/videos', upload.single('video'), async (req, res) => {
  try {
    const { title, description } = req.body;

    // Convert the absolute path to a relative path
    const relativeVideoPath = path.relative(__dirname, req.file.path);

    const newVideo = new Video({
      title,
      description,
      videoPath: relativeVideoPath.replace(/\\/g, '/'), // Use forward slashes for consistency
    });

    await newVideo.save();
    res.status(201).json({ message: 'Video uploaded successfully', video: newVideo });
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video', error });
  }
});

// Route to update user progress
app.post('/api/progress', async (req, res) => {
  try {
    const { sessionId, videoId, currentTime, videoDuration } = req.body;

    // Find the existing progress record for this session and video
    let progress = await UserProgress.findOne({ sessionId, videoId });

    if (progress) {
      // Update the existing record
      progress.lastPosition = currentTime;
      if (currentTime >= videoDuration) {
        progress.completed = true;
        progress.watchedVideos += 1;
      }
      await progress.save();
    } else {
      // Create a new progress record
      progress = await UserProgress.create({
        sessionId,
        videoId,
        lastPosition: currentTime,
        completed: currentTime >= videoDuration,
        watchedVideos: currentTime >= videoDuration ? 1 : 0,
      });
    }

    res.status(200).json({ message: 'Progress updated successfully', progress });
  } catch (error) {
    res.status(500).json({ message: 'Error updating progress', error });
  }
});

app.get('/api/progress/:sessionId/:videoId', async (req, res) => {
  try {
    const { sessionId, videoId } = req.params;
    const progress = await UserProgress.findOne({ sessionId, videoId });
    res.json(progress || { currentTime: 0 });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching progress', error: err.message });
  }
});


// Get the users progress information
app.get('/api/progress', async (req, res) => {
  try {
    const sessionId = "123"; // Replace with actual session ID or retrieve it from the request

    // Find the user's progress for this video
    const progress = await UserProgress.find({ sessionId});

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found for this video and session' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error });
  }
});

app.get('/api/progress/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const sessionId = "123"; // Replace with actual session ID or retrieve from request

    // Find the user's progress for this video
    const progress = await UserProgress.findOne({ sessionId, videoId });

    if (!progress) {
      return res.status(404).json({ message: 'Progress not found for this video and session' });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching progress', error });
  }
});



app.use('/uploads', express.static(path.join(__dirname, 'uploads')));



// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
