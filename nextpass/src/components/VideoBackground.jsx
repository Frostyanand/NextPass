"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_VIDEO_PLAYLIST = [
  "https://videos.pexels.com/video-files/7578555/7578555-hd_1920_1080_30fps.mp4",      
  "https://videos.pexels.com/video-files/7578536/7578536-hd_1920_1080_30fps.mp4",
];

export default function VideoBackground({ playlist = DEFAULT_VIDEO_PLAYLIST, loop = false }) {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

  useEffect(() => {
    setCurrentVideoIndex(0);
  }, [playlist]);

  const handleVideoEnd = () => {
    if (playlist.length === 0) return;
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % playlist.length);
  };
  
  if (playlist.length === 0) {
    return null;
  }

  // If loop is true, render a simpler, non-fading video player
  if (loop) {
    return (
      <div className="absolute inset-0 z-0 overflow-hidden">
        <video
          key={playlist[0]} // Keyed to the first video in the playlist
          autoPlay
          muted
          loop // The native HTML5 loop attribute
          playsInline
          className="w-full h-full object-cover"
          // Animate opacity once on load
          style={{ opacity: 0 }}
          onCanPlay={(e) => (e.currentTarget.style.opacity = '0.4')}
        >
          <source src={playlist[0]} type="video/mp4" />
        </video>
        {/* The overlay is still useful for readability */}
        <div className="absolute inset-0 bg-slate-900/40" />
      </div>
    );
  }

  // Original playlist logic for multi-video pages
  return (
    <div className="absolute inset-0 z-0 overflow-hidden">
      <AnimatePresence>
        <motion.video
          key={`${playlist[currentVideoIndex]}-${currentVideoIndex}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }} // Adjusted opacity for better text contrast
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5 }}
          autoPlay
          muted
          onEnded={handleVideoEnd}
          playsInline
          className="w-full h-full object-cover"
        >
          <source src={playlist[currentVideoIndex]} type="video/mp4" />
        </motion.video>
      </AnimatePresence>
      <div className="absolute inset-0 bg-slate-900/40" />
    </div>
  );
}
