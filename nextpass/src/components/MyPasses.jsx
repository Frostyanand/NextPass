"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
// import Logo from './Logo';

import { 
  HiSparkles, 
  HiTicket, 
  HiArrowRight, 
  HiXMark,
  HiArrowDownTray,
  HiCalendar,
  HiMapPin,
  HiClock
} from 'react-icons/hi2';


// Aurora Blob Component (consistent with landing page)
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

// Robust date formatting helper function
function formatDate(dateValue) {
  if (!dateValue) return "Date not available";

  let date;
  // Handle Firestore timestamp objects specifically
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    // Convert from seconds to milliseconds for the Date constructor
    date = new Date(dateValue._seconds * 1000);
  } else {
    // Fallback for regular date strings or Date objects
    date = new Date(dateValue);
  }

  // Check if the created date is valid
  if (isNaN(date.getTime())) {
    return "Invalid Date";
  }

  // Format the date precisely for your timezone
  return date.toLocaleString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata'
  });
}

// Registration Detail Modal Component
function RegistrationDetailModal({ selectedRegistration, onClose, userEmail }) {
  const [eventDetails, setEventDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (selectedRegistration?.eventId) {
      fetchEventDetails();
    }
  }, [selectedRegistration]);

  const fetchEventDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/getEventDetails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ eventId: selectedRegistration.eventId }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch event details');
      }

      const data = await response.json();
      setEventDetails(data.event);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserQrCode = () => {
    if (!eventDetails?.participants || !userEmail) return null;
    
    const userParticipant = eventDetails.participants.find(
      participant => participant.email === userEmail
    );
    
    return userParticipant?.qrCodeUrl || null;
  };

  const qrCodeUrl = getUserQrCode();

  return (
    <AnimatePresence>
      {selectedRegistration && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1, rotate: 90 }}
              whileTap={{ scale: 0.9 }}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full transition-all duration-200"
            >
              <HiXMark className="h-5 w-5 text-white" />
            </motion.button>

            {/* Event Info */}
            <div className="mb-8">
              <h3 className="text-2xl font-bold text-white mb-2">
                {selectedRegistration.eventName}
              </h3>
              <div className="flex items-center space-x-2 text-white/70 mb-1">
                <HiCalendar className="h-4 w-4" />
                <span className="text-sm">
                  {formatDate(selectedRegistration.eventDate)}
                </span>
              </div>
              <div className="flex items-center space-x-2 text-white/60">
                <HiClock className="h-4 w-4" />
                <span className="text-sm">
                  Registered on {formatDate(selectedRegistration.regDate)}
                </span>
              </div>
            </div>

            {/* QR Code Section */}
            <div className="text-center">
              {loading ? (
                <div className="flex flex-col items-center space-y-4 py-12">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full"
                  />
                  <p className="text-white/70">Loading your pass...</p>
                </div>
              ) : error ? (
                <div className="py-12 text-center">
                  <p className="text-red-400 mb-4">Failed to load pass</p>
                  <motion.button
                    onClick={fetchEventDetails}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2 bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-sm hover:bg-indigo-600/30 transition-colors"
                  >
                    Try Again
                  </motion.button>
                </div>
              ) : qrCodeUrl ? (
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-6"
                >
                  {/* QR Code Image */}
                  <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <motion.img
                      src={qrCodeUrl}
                      alt="Event Pass QR Code"
                      className="w-full max-w-[200px] mx-auto rounded-xl"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    />
                    <p className="text-white/60 text-sm mt-4">
                      Show this QR code at the event entrance
                    </p>
                  </div>

                  {/* Download Button */}
                  <motion.a
                    href={qrCodeUrl}
                    download="event-pass.png"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-cyan-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-cyan-700 transition-all duration-200 shadow-lg shadow-indigo-500/25"
                  >
                    <HiArrowDownTray className="h-5 w-5" />
                    <span>Download Pass</span>
                  </motion.a>
                </motion.div>
              ) : (
                <div className="py-12 text-center">
                  <HiTicket className="h-12 w-12 text-white/30 mx-auto mb-4" />
                  <p className="text-white/60">QR code not available</p>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Registration Card Component
function RegistrationCard({ registration, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02, 
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.3)" 
      }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 cursor-pointer hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            {registration.eventName}
          </h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-white/70">
              <HiCalendar className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                {formatDate(registration.eventDate)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-white/60">
              <HiClock className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm">
                Registered on {formatDate(registration.regDate)}
              </span>
            </div>
          </div>
        </div>
        <motion.div
          whileHover={{ x: 5 }}
          className="flex-shrink-0 p-2 bg-white/10 rounded-full group-hover:bg-indigo-500/20 transition-colors"
        >
          <HiArrowRight className="h-5 w-5 text-white/70 group-hover:text-indigo-300" />
        </motion.div>
      </div>
      
      <div className="pt-4 border-t border-white/10">
        <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-300 text-xs font-medium rounded-full">
          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
          Registered
        </span>
      </div>
    </motion.div>
  );
}

// Empty State Component
function EmptyState({ setActiveTab }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="text-center py-16"
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
        className="mb-8"
      >
        <HiTicket className="h-24 w-24 text-white/20 mx-auto" />
      </motion.div>
      
      <motion.h3
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="text-3xl font-bold text-white mb-4"
      >
        No Passes Yet
      </motion.h3>
      
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-white/60 mb-8 max-w-md mx-auto leading-relaxed"
      >
        You haven't registered for any events. Why not explore some amazing events happening around you?
      </motion.p>
      
      <motion.button
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 1 }}
        onClick={() => setActiveTab('explore')}
        whileHover={{ 
          scale: 1.05, 
          boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.4)" 
        }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-semibold rounded-2xl shadow-2xl shadow-indigo-500/25 hover:shadow-indigo-500/40 transition-all duration-300"
      >
        <HiSparkles className="h-5 w-5" />
        <span>Explore Events</span>
        <HiArrowRight className="h-5 w-5" />
      </motion.button>
    </motion.div>
  );
}

// Main MyRegistrations Component
export default function MyPasses({ setActiveTab, userEmail }) {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegistration, setSelectedRegistration] = useState(null);

  useEffect(() => {
    fetchUserRegistrations();
  }, [userEmail]);

  const fetchUserRegistrations = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/getUserRegistrations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userEmail }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch registrations');
      }

      const data = await response.json();
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setRegistrations([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <AuroraBlob delay={0} color="indigo" size="xlarge" />
        <AuroraBlob delay={3} color="cyan" size="large" />
        <AuroraBlob delay={6} color="pink" size="medium" />
        <AuroraBlob delay={9} color="violet" size="large" />
      </div>

      {/* Logo */}
      {/* <div className="fixed top-6 left-6 z-50">
        <div className="relative z-10 container mx-auto px-6 pb-20">

      </div> */}

      {/* Main Content */}
      <div className="relative z-10 pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center mt-12 mb-16"
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-black mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.8 }}
            >
              <span className="bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent drop-shadow-2xl">
                Your Event Passes
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              All your registered events in one place. Click on a pass to view your QR code.
            </motion.p>
          </motion.div>

          {/* Content Area */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-3 border-white/30 border-t-white rounded-full mb-4"
              />
              <p className="text-white/70 text-lg">Loading your passes...</p>
            </div>
          ) : registrations.length === 0 ? (
            <EmptyState setActiveTab={setActiveTab} />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, staggerChildren: 0.1 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {registrations.map((registration, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                >
                  <RegistrationCard
                    registration={registration}
                    onClick={() => setSelectedRegistration(registration)}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Modal */}
      <RegistrationDetailModal
        selectedRegistration={selectedRegistration}
        onClose={() => setSelectedRegistration(null)}
        userEmail={userEmail}
      />
    </div>
  );
}