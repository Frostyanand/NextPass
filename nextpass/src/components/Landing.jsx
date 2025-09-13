"use client";
import NavBar from "./Navbar";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { 
  HiBell, 
  HiSparkles, 
  HiOutlineClipboard,
  HiOutlineQrCode,
  HiOutlineUserGroup,
  HiOutlineGlobeAlt,
  HiOutlineEnvelope
} from 'react-icons/hi2';

// TODO: Replace with your actual video URL
const VIDEO_PLAYLIST = [
  "https://videos.pexels.com/video-files/7578555/7578555-hd_1920_1080_30fps.mp4",      
  "https://videos.pexels.com/video-files/7578536/7578536-hd_1920_1080_30fps.mp4",
  "https://www.pexels.com/download/video/2890196",
  "https://www.pexels.com/download/video/3199978"  

];

// Floating aurora blob component
function AuroraBlob({ delay = 0, color = "indigo", size = "large" }) {
  const [animationProps, setAnimationProps] = useState(null);

  useEffect(() => {
    setAnimationProps({
      x: [
        Math.random() * 400 - 200,
        Math.random() * 600 - 300,
        Math.random() * 400 - 200
      ],
      y: [
        Math.random() * 400 - 200,
        Math.random() * 500 - 250,
        Math.random() * 400 - 200
      ],
      scale: [0.5, 0.8, 0.6, 0.9, 0.5],
      opacity: [0, 0.6, 0.8, 0.4, 0.7],
      transition: {
        duration: 20 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }
    });
  }, [delay]);

  const sizeClasses = {
    small: "w-64 h-64",
    medium: "w-96 h-96",
    large: "w-[32rem] h-[32rem]",
    xlarge: "w-[40rem] h-[40rem]"
  };

  const colorClasses = {
    indigo: "bg-gradient-to-br from-indigo-400/30 to-purple-500/20",
    cyan: "bg-gradient-to-br from-cyan-400/25 to-blue-500/20",
    pink: "bg-gradient-to-br from-pink-400/30 to-rose-500/20",
    violet: "bg-gradient-to-br from-violet-400/25 to-indigo-500/20"
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

// Hero Component
function Hero({ setActiveTab }) {
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0);

    const handleVideoEnd = () => {
        setCurrentVideoIndex((prevIndex) => (prevIndex + 1) % VIDEO_PLAYLIST.length);
    };
    
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2, delayChildren: 0.3 }
        }
    };
    
    const itemVariants = {
        hidden: { y: 60, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring", stiffness: 100, damping: 12 }
        }
    };

    const handleCTA = (action) => {
        if (setActiveTab) {
            setActiveTab(action === 'explore' ? 'explore' : 'organise');
        }
    };

    return (
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 z-0">
                <AnimatePresence>
                    <motion.video
                        key={currentVideoIndex}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        autoPlay
                        muted
                        onEnded={handleVideoEnd}
                        playsInline
                        className="w-full h-full object-cover"
                    >
                        <source src={VIDEO_PLAYLIST[currentVideoIndex]} type="video/mp4" />
                    </motion.video>
                </AnimatePresence>
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/20 via-indigo-900/10 to-cyan-900/20" />
            </div>

            <div className="absolute inset-0 z-10 overflow-hidden">
                <AuroraBlob delay={0} color="indigo" size="xlarge" />
                <AuroraBlob delay={2} color="cyan" size="large" />
                <AuroraBlob delay={4} color="pink" size="medium" />
                <AuroraBlob delay={6} color="violet" size="large" />
            </div>

            <div className="absolute inset-0 z-20" />

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative z-30 max-w-6xl mx-auto px-6 text-center"
            >
                <motion.h1
                    variants={itemVariants}
                    className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 leading-tight"
                >
                    <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">Orchestrate Events</span>
                    <br />
                    <span className="bg-gradient-to-r from-cyan-200 via-pink-200 to-white bg-clip-text text-transparent drop-shadow-2xl">with Effortless</span>
                    <br />
                    <motion.span
                        className="bg-gradient-to-r from-pink-200 via-indigo-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl inline-block"
                        style={{ backgroundSize: '200% 200%' }}
                        animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                    >
                        Elegance
                    </motion.span>
                </motion.h1>

                <motion.p
                    variants={itemVariants}
                    className="text-xl md:text-2xl text-white/80 mb-12 max-w-4xl mx-auto leading-relaxed font-light"
                >
                    The ultimate platform for seamless event registration, attendance tracking, and participant engagement. All in one fluid experience.
                </motion.p>
                
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col sm:flex-row gap-6 justify-center items-center"
                >
                    <motion.button
                        onClick={() => handleCTA('explore')}
                        className="group relative px-12 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 rounded-2xl font-semibold text-white text-lg shadow-2xl shadow-indigo-500/25 overflow-hidden"
                        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <span className="relative z-10">Explore Events</span>
                    </motion.button>
                    
                    <motion.button
                        onClick={() => handleCTA('organise')}
                        className="group relative px-12 py-4 bg-white/10 backdrop-blur-xl border-2 border-white/20 rounded-2xl font-semibold text-white text-lg hover:bg-white/20 hover:border-white/30 transition-all duration-300 overflow-hidden"
                        whileHover={{ scale: 1.05, boxShadow: "0 25px 50px -12px rgba(255, 255, 255, 0.1)" }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                        <span className="relative z-10">Organise Now</span>
                    </motion.button>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 2, duration: 1 }}
                    className="absolute bottom-[-10vh] left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="inline-block text-white/50 text-sm"
                    >
                        Scroll to discover more ↓
                    </motion.div>
                </motion.div>
            </motion.div>
        </section>
    );
}

// Features Section Component
function FeaturesSection() {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const features = [
        {
            icon: HiOutlineUserGroup,
            title: "Seamless Registration",
            description: "A frictionless, elegant registration flow for attendees. Get QR-coded passes instantly via email."
        },
        {
            icon: HiOutlineClipboard,
            title: "Powerful Organization",
            description: "Create and manage events effortlessly. Update details on the fly and track your attendees from one place."
        },
        {
            icon: HiOutlineQrCode,
            title: "Live Check-in",
            description: "Scan QR codes with any device for instant, secure check-ins. Monitor live attendance as it happens."
        }
    ];

    return (
        <section ref={ref} className="relative py-24 px-4 bg-slate-900/50 overflow-hidden">
            <div className="absolute inset-0 -z-10">
                <AuroraBlob color="violet" size="xlarge" />
            </div>
            <div className="max-w-7xl mx-auto">
                <motion.div 
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.7 }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                        <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
                            Everything You Need
                        </span>
                    </h2>
                    <p className="text-xl text-white/70 max-w-3xl mx-auto">
                        NextPass provides a complete toolkit for modern event management, designed for delight and engineered for performance.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 50 }}
                                animate={isInView ? { opacity: 1, y: 0 } : {}}
                                transition={{ duration: 0.5, delay: 0.2 * index }}
                                whileHover={{ y: -10, boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.2)" }}
                                className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center"
                            >
                                <div className="inline-block p-4 mb-6 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 rounded-xl">
                                    <Icon className="h-8 w-8 text-cyan-300" />
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-3">{feature.title}</h3>
                                <p className="text-white/60 leading-relaxed">{feature.description}</p>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

// Footer Component
function Footer() {
    return (
        <footer className="bg-slate-900 text-white/50 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center space-x-2">
                        <HiSparkles className="h-6 w-6 text-indigo-400" />
                        <span className="text-xl font-bold text-white/80">NextPass</span>
                    </div>
                    <div className="flex items-center space-x-6 text-sm">
                        <a href="#" className="hover:text-white transition-colors">Explore</a>
                        <a href="#" className="hover:text-white transition-colors">Organise</a>
                        <a href="#" className="hover:text-white transition-colors">About</a>
                    </div>
                    <div className="flex items-center space-x-4">
                        <a href="#" className="hover:text-white transition-colors"><HiOutlineGlobeAlt className="h-6 w-6" /></a>
                        <a href="#" className="hover:text-white transition-colors"><HiOutlineEnvelope className="h-6 w-6" /></a>
                    </div>
                </div>
                <div className="mt-8 pt-8 border-t border-white/10 text-center text-xs">
                    <p>&copy; {new Date().getFullYear()} NextPass. All rights reserved. The ultimate event experience platform.</p>
                </div>
            </div>
        </footer>
    );
}


// Main Landing Component
export default function Landing({ userEmail, setActiveTab }) {
  return (
    <div className="bg-slate-900">
      {/* The NavBar component is no longer rendered here */}
      <main>
        <Hero setActiveTab={setActiveTab} />
        <FeaturesSection />
      </main>
      <Footer />
    </div>
  );
}

