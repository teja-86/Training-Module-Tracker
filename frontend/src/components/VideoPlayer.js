import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

function VideoPlayer() {
  const { id } = useParams();
  const [video, setVideo] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0); // State to store video progress
  const [lastAllowedTime, setLastAllowedTime] = useState(0); // State to store last allowed playback position
  const videoRef = useRef(null);
  const [sessionId] = useState("123"); // Replace with actual session ID

  useEffect(() => {
    const fetchVideo = async () => {
      try {
        const response = await axios.get(`/api/videos/${id}`);
        setVideo(response.data);
      } catch (err) {
        setError(err.message);
      }
    };

    const fetchProgress = async () => {
      try {
        const progressResponse = await axios.get(`/api/progress/${sessionId}/${id}`);
        const progressData = progressResponse.data;
        if (progressData) {
          setLastAllowedTime(progressData.lastPosition || 0);
          if (videoRef.current) {
            videoRef.current.currentTime = progressData.lastPosition || 0;
          }
        }
      } catch (err) {
        console.error('Error fetching progress:', err.message);
      }
    };

    fetchVideo();
    fetchProgress();
  }, [id, sessionId]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (videoRef.current) {
        const currentTime = videoRef.current.currentTime;
        const videoDuration = videoRef.current.duration;
        updateVideoProgress(sessionId, id, currentTime, videoDuration);

        // Calculate and update progress percentage
        const progressPercentage = (currentTime / videoDuration) * 100;
        setProgress(progressPercentage);
      }
    }, 5000); // Update progress every 5 seconds

    return () => clearInterval(intervalId); // Cleanup interval on component unmount
  }, [id, sessionId]);

  const updateVideoProgress = async (sessionId, videoId, currentTime, videoDuration) => {
    try {
      const response = await axios.post('/api/progress', {
        sessionId,
        videoId,
        currentTime,
        videoDuration,
      });
      console.log(response.data.message); // Progress updated successfully
    } catch (error) {
      console.error('Error updating progress:', error.response?.data?.message || error.message);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      const videoDuration = videoRef.current.duration;
      setProgress((currentTime / videoDuration) * 100);
    }
  };

  const handleSeeking = (event) => {
    if (videoRef.current) {
      const currentTime = videoRef.current.currentTime;
      if (currentTime > lastAllowedTime) {
        videoRef.current.currentTime = lastAllowedTime; // Revert to the last allowed time
        alert("Skipping ahead is not allowed. Please watch the video in order.");
      }
    }
  };

  if (error) {
    return <div className="text-red-500 font-semibold text-center">Error: {error}</div>;
  }

  if (!video) {
    return <div className="text-gray-500 font-semibold text-center">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-center">{video.title}</h1>
      <div className="flex flex-col items-center mb-4">
        <video
          ref={videoRef}
          controls
          className="w-full max-w-3xl border rounded-lg shadow-lg"
          onTimeUpdate={handleTimeUpdate}
          onSeeking={handleSeeking}
          onSeeked={handleSeeking}
        >
          <source src={`http://localhost:5000/${video.videoPath}`} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
          <div
            className="bg-blue-600 h-2.5 rounded-full"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Progress: {Math.round(progress)}%</p>
      </div>
      <p className="text-lg text-gray-700 mt-2">{video.description}</p>
    </div>
  );
}

export default VideoPlayer;
