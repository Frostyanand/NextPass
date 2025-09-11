"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlineDocument,
} from 'react-icons/hi2';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

// Easy-to-edit variables
const resumeLink = "https://drive.google.com/file/d/1P4u0pKSPmc1_z2vHyfiDNwFxcB-uw2uP/view?usp=sharing";
const githubLink = "https://github.com/Frostyanand";
const linkedInLink = "https://www.linkedin.com/in/frostyanand/";
const instaLink = "https://www.instagram.com/frostyanand";

// Background video playlist (same concept as landing page)
const VIDEO_PLAYLIST = [
//   "https://videos.pexels.com/video-files/7578555/7578555-hd_1920_1080_30fps.mp4",
  "https://videos.pexels.com/video-files/2896342/2896342-hd_1920_1080_25fps.mp4",
  "https://videos.pexels.com/video-files/4492572/4492572-hd_1920_1080_25fps.mp4"
];

// Clean aurora blob for subtle background effect
function AuroraBlob({ delay = 0, color = "indigo", size = "large" }) {
  const [animationProps, setAnimationProps] = useState(null);

  useEffect(() => {
    setAnimationProps({
      x: [
        Math.random() * 300 - 150,
        Math.random() * 400 - 200,
        Math.random() * 300 - 150
      ],
      y: [
        Math.random() * 300 - 150,
        Math.random() * 400 - 200,
        Math.random() * 300 - 150
      ],
      scale: [0.6, 0.8, 0.7, 0.9, 0.6],
      opacity: [0, 0.3, 0.5, 0.2, 0.4],
      transition: {
        duration: 25 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }
    });
  }, [delay]);

  const sizeClasses = {
    medium: "w-96 h-96",
    large: "w-[32rem] h-[32rem]",
    xlarge: "w-[40rem] h-[40rem]"
  };

  const colorClasses = {
    indigo: "bg-gradient-to-br from-indigo-500/20 to-purple-600/15",
    cyan: "bg-gradient-to-br from-cyan-500/15 to-blue-600/20",
    violet: "bg-gradient-to-br from-violet-500/20 to-indigo-600/15"
  };

  if (!animationProps) return null;

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${sizeClasses[size]} ${colorClasses[color]}`}
      initial={{ scale: 0.5, opacity: 0 }}
      animate={animationProps}
      transition={animationProps.transition}
    />
  );
}

export default function AboutPage() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isHoveringPicture, setIsHoveringPicture] = useState(false);

  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_PLAYLIST.length);
  };

  const socialLinks = [
    { 
      icon: FaGithub, 
      href: githubLink, 
      label: "GitHub"
    },
    { 
      icon: FaLinkedin, 
      href: linkedInLink, 
      label: "LinkedIn"
    },
    { 
      icon: FaInstagram, 
      href: instaLink, 
      label: "Instagram"
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2, delayChildren: 0.5 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden flex items-center justify-center">
      {/* Background Video */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence>
          <motion.video
            key={currentVideoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            autoPlay
            muted
            onEnded={handleVideoEnd}
            playsInline
            className="w-full h-full object-cover"
          >
            <source src={VIDEO_PLAYLIST[currentVideoIndex]} type="video/mp4" />
          </motion.video>
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/40 to-slate-900/70" />
      </div>

      {/* Subtle Aurora Effects */}
      <div className="absolute inset-0 z-10 overflow-hidden">
        <AuroraBlob delay={0} color="indigo" size="large" />
        <AuroraBlob delay={8} color="cyan" size="xlarge" />
        <AuroraBlob delay={16} color="violet" size="medium" />
      </div>

      {/* Main Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-20 max-w-2xl mx-auto px-6 text-center"
      >
        {/* Profile Picture */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <motion.div
            className="relative"
            onMouseEnter={() => setIsHoveringPicture(true)}
            onMouseLeave={() => setIsHoveringPicture(false)}
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div
              className="w-48 h-48 rounded-full overflow-hidden bg-gradient-to-br from-slate-700 to-slate-800 p-1 shadow-2xl"
              animate={{
                boxShadow: isHoveringPicture 
                  ? "0 0 40px rgba(99, 102, 241, 0.4), 0 0 80px rgba(99, 102, 241, 0.1)"
                  : "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
              }}
            >
              <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 p-1">
                <motion.img
                  src="/profile.jpg"
                  alt="Profile"
                  className="w-full h-full rounded-full object-cover"
                  animate={{
                    filter: isHoveringPicture 
                      ? "brightness(1.1) contrast(1.1)" 
                      : "brightness(1) contrast(1)"
                  }}
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Bio Text */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
              Anurag Anand
            </span>
          </h1>
          <p className="text-xl text-white/80 mb-4 leading-relaxed">
            Full Stack Developer
          </p>
          <motion.p 
            className="text-lg text-white/70 font-medium"
            animate={{
              opacity: [0.7, 0.9, 0.7]
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            I code, I caffeinate, I over-engineer... sometimes all at once! 🚀
          </motion.p>
        </motion.div>

        {/* Know More Button */}
        <motion.div variants={itemVariants} className="mb-8">
          <motion.button
            onClick={() => window.open(resumeLink, '_blank')}
            className="group relative px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-2xl font-semibold text-white text-lg shadow-2xl shadow-indigo-500/25 overflow-hidden"
            whileHover={{ 
              scale: 1.05, 
              boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)"
            }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <span className="relative z-10 flex items-center gap-2 justify-center">
              <HiOutlineDocument className="h-5 w-5" />
              Know More
            </span>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-pink-400/0 group-hover:from-cyan-400/20 group-hover:to-pink-400/20"
              transition={{ duration: 0.3 }}
            />
          </motion.button>
        </motion.div>

        {/* Social Icons */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center space-x-6"
        >
          {socialLinks.map((social, index) => {
            const Icon = social.icon;
            return (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white shadow-lg hover:bg-white/20 transition-all duration-300"
                whileHover={{ 
                  scale: 1.1,
                  y: -2,
                  boxShadow: "0 20px 40px -12px rgba(255,255,255,0.1)"
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  delay: 1 + index * 0.1,
                  type: "spring",
                  stiffness: 200,
                  damping: 15
                }}
              >
                <Icon className="h-6 w-6" />
              </motion.a>
            );
          })}
        </motion.div>
      </motion.div>
    </div>
  );
}