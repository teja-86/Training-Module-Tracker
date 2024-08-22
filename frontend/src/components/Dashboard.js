import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const [videos, setVideos] = useState([]);
  const [progress, setProgress] = useState({}); // Object to store progress data keyed by videoId

  useEffect(() => {
    const fetchVideosAndProgress = async () => {
      try {
        // Fetch videos
        const videosResponse = await axios.get('/api/videos');
        const videosData = videosResponse.data;
        setVideos(videosData);

        // Fetch progress for each video
        const progressData = {};
        await Promise.all(videosData.map(async (video) => {
          try {
            const progressResponse = await axios.get(`/api/progress/${video._id}`);
            progressData[video._id] = progressResponse.data;
          } catch (progressError) {
            console.error(`Error fetching progress for video ${video._id}:`, progressError);
          }
        }));
        setProgress(progressData);
      } catch (error) {
        console.error('Error fetching videos or progress:', error);
      }
    };

    fetchVideosAndProgress();
  }, []); // Empty dependency array to fetch data only once

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-6 px-4">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Training Module</h1>
      <div className="w-full max-w-4xl bg-white shadow-lg rounded-lg p-6">
        <ul className="space-y-4">
          {videos.map((video, index) => {
            const videoProgress = progress[video._id]
              ? (progress[video._id].lastPosition / video.videoDuration) * 100
              : 0;

            return (
              <li key={video._id} className={`bg-gray-50 border border-gray-200 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-300 `}>
                <Link to={`/video/${video._id}`} className="flex items-center text-lg font-semibold text-blue-600 hover:underline">
                  <span className="mr-4 text-gray-700">{index + 1}.</span>
                  {video.title}
                </Link>
                {videoProgress > 0 && (
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${videoProgress}%` }}
                    >
                      {/* Display progress as a percentage */}
                      <p className="text-xs text-white text-center">{Math.round(videoProgress)}%</p>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}

export default Dashboard;
