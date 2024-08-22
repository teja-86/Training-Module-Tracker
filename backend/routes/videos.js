// backend/routes/videos.js
import express from 'express';
import Video from '../models/Video.js';
import UserProgress from '../models/UserProgress.js';

const router = express.Router();

// Get all videos in order
router.get('/:id', async (req, res) => {
    try {
      const video = await Video.findById(req.params.id);
      if (!video) {
        return res.status(404).json({ message: 'Video not found' });
      }
      res.json(video);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching video', error });
    }
  });

//   Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.find().sort({ createdAt: 1 }); // Sort by creation date if needed
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching videos', error });
    }
});


// Update user progress
router.post('/progress', async (req, res) => {
    const { userId, videoId, progress, lastPosition } = req.body;
    try {
        let userProgress = await UserProgress.findOne({ userId, videoId });

        if (userProgress) {
            userProgress.progress = progress;
            userProgress.lastPosition = lastPosition;
        } else {
            userProgress = new UserProgress({ userId, videoId, progress, lastPosition });
        }

        await userProgress.save();
        res.status(200).json(userProgress);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
