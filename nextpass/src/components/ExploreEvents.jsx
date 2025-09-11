/**
 * NextPass Explore Events Component
 * A stunning events browsing page with glassmorphism design and smooth animations
 * Dependencies: react, framer-motion, react-icons
 */
import Logo from './Logo';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiCalendarDays, 
  HiMapPin, 
  HiUser, 
  HiClock,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiSparkles,
  HiArrowRight
} from 'react-icons/hi2';

// Reusable Aurora Blob Component (matching Landing page)
function AuroraBlob({ delay = 0, color = "indigo", size = "large" }) {
  const sizeClasses = {
    small: "w-64 h-64",
    medium: "w-96 h-96", 
    large: "w-[32rem] h-[32rem]",
    xlarge: "w-[40rem] h-[40rem]"
  };

  const colorClasses = {
    indigo: "bg-gradient-to-br from-indigo-400/20 to-purple-500/15",
    cyan: "bg-gradient-to-br from-cyan-400/20 to-blue-500/15",
    pink: "bg-gradient-to-br from-pink-400/20 to-rose-500/15",
    violet: "bg-gradient-to-br from-violet-400/20 to-indigo-500/15"
  };

  return (
    <motion.div
      className={`fixed rounded-full blur-3xl ${sizeClasses[size]} ${colorClasses[color]} pointer-events-none`}
      initial={{ 
        x: Math.random() * 800,
        y: Math.random() * 600,
        scale: 0.5,
        opacity: 0
      }}
      animate={{ 
        x: [
          Math.random() * 800,
          Math.random() * 900,
          Math.random() * 700
        ],
        y: [
          Math.random() * 600,
          Math.random() * 500,
          Math.random() * 700
        ],
        scale: [0.5, 0.8, 0.6, 0.9, 0.5],
        opacity: [0, 0.6, 0.8, 0.4, 0.7]
      }}
      transition={{
        duration: 25 + Math.random() * 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: delay
      }}
    />
  );
}

// Loading Component
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <motion.div
        className="relative"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-16 h-16 border-4 border-white/20 border-t-indigo-400 rounded-full"></div>
        <motion.div
          className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-full"
          animate={{ rotate: -360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </div>
  );
}

// Event Card Component
function EventCard({ event, onRegisterClick }) {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString('en', { month: 'short' }),
      time: date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const dateInfo = formatDate(event.eventDate);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 60, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        boxShadow: "0 25px 50px -12px rgba(99, 102, 241, 0.3)"
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
      onClick={() => onRegisterClick(event)}
    >
      {/* Gradient Overlay on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        initial={false}
      />

       {/* Content */}
    <div className="relative z-10">
      {/* NEW: Flex container for header */}
      <div className="flex justify-between items-start mb-3">
        {/* Event Title (with pr-4 and mb-3 removed) */}
        <h3 className="flex-grow pr-4 text-xl md:text-2xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
          {event.eventName}
        </h3>

        {/* Date Badge (with absolute positioning removed) */}
        <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{dateInfo.day}</div>
            <div className="text-xs text-white/60 uppercase tracking-wide">{dateInfo.month}</div>
          </div>
        </div>
      </div>
        {/* Organizer */}
        <div className="flex items-center mb-2 text-white/60">
          <HiUser className="h-4 w-4 mr-2 text-indigo-400" />
          <span className="text-sm">by {event.organiserEmail}</span>
        </div>

        {/* Time */}
        <div className="flex items-center mb-4 text-white/60">
          <HiClock className="h-4 w-4 mr-2 text-cyan-400" />
          <span className="text-sm">{dateInfo.time}</span>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm mb-6 line-clamp-3 leading-relaxed">
          {event.remarks || "Join us for an amazing event experience!"}
        </p>

        {/* CTA Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full mt-auto bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onRegisterClick(event);
          }}
        >
          <span>Register Now</span>
          <HiArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Registration Modal Component
function RegistrationModal({ event, isOpen, onClose, onRegister }) {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // null, 'success', 'error'
  const [errorMessage, setErrorMessage] = useState('');

  const resetForm = () => {
    setFormData({ name: '', email: '' });
    setSubmitStatus(null);
    setErrorMessage('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.email.trim()) {
      setErrorMessage('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/registerParticipant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          participantData: {
            name: formData.name.trim(),
            email: formData.email.trim()
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setSubmitStatus('success');
        onRegister && onRegister(event.id, formData);
        setTimeout(() => handleClose(), 2000);
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error || 'Registration failed');
      }
    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  if (!event) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
              {/* Close Button */}
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HiXMark className="h-6 w-6 text-white/60 hover:text-white" />
              </button>

              {/* Success State */}
              {submitStatus === 'success' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="text-center py-8"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 0.5 }}
                  >
                    <HiCheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                  </motion.div>
                  <h3 className="text-2xl font-bold text-white mb-2">Registration Successful!</h3>
                  <p className="text-white/70">Check your email for the QR code and event details.</p>
                </motion.div>
              )}

              {/* Form State */}
              {submitStatus !== 'success' && (
                <>
                  {/* Header */}
                  <div className="mb-6">
                    <h2 className="text-2xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                      Register for Event
                    </h2>
                    <h3 className="text-xl text-white/80 mb-1">{event.eventName}</h3>
                    <p className="text-white/60 text-sm">by {event.organiserEmail}</p>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-4">
                    {/* Name Field */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Enter your full name"
                      />
                    </div>

                    {/* Email Field */}
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        onKeyPress={handleKeyPress}
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                        placeholder="Enter your email"
                      />
                    </div>

                    {/* Error Message */}
                    {(submitStatus === 'error' || errorMessage) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                      >
                        <HiExclamationTriangle className="h-4 w-4 flex-shrink-0" />
                        <span>{errorMessage}</span>
                      </motion.div>
                    )}

                    {/* Submit Button */}
                    <motion.button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-indigo-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center space-x-2"
                    >
                      {isSubmitting ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                          />
                          <span>Registering...</span>
                        </>
                      ) : (
                        <>
                          <HiSparkles className="h-5 w-5" />
                          <span>Complete Registration</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Main Explore Events Component
export default function ExploreEvents({ setActiveTab }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

//   // Sample data for demo purposes
//   useEffect(() => {
//     // Simulate API call
//     setTimeout(() => {
//       setEvents([
//         {
//           id: '1',
//           eventName: 'Tech Conference 2024',
//           organiserEmail: 'organizer@techconf.com',
//           eventDate: '2024-12-15T10:00:00.000Z',
//           regDeadline: '2024-12-10T23:59:59.000Z',
//           remarks: 'Join industry leaders for cutting-edge technology discussions and networking opportunities.'
//         },
//         {
//           id: '2',
//           eventName: 'Design Workshop',
//           organiserEmail: 'hello@designstudio.com',
//           eventDate: '2024-12-20T14:00:00.000Z',
//           regDeadline: '2024-12-18T23:59:59.000Z',
//           remarks: 'Learn the latest design trends and tools in this hands-on workshop.'
//         },
//         {
//           id: '3',
//           eventName: 'Startup Pitch Night',
//           organiserEmail: 'events@startup.hub',
//           eventDate: '2024-12-22T18:30:00.000Z',
//           regDeadline: '2024-12-20T23:59:59.000Z',
//           remarks: 'Watch amazing startups pitch their ideas to investors and industry experts.'
//         }
//       ]);
//       setLoading(false);
//     }, 1500);
//   }, []);

  // Uncomment this for real API integration
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getAvailableEvents');
      const result = await response.json();
      
      if (result.success) {
        setEvents(result.events || []);
      } else {
        console.error('Failed to fetch events:', result.error);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleRegistrationComplete = (eventId, userData) => {
    console.log('Registration completed for event:', eventId, userData);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const headerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 relative overflow-hidden">
        {/* Floating Logo - click to go home */}
        <div className="fixed top-6 left-6 z-50">
        <Logo onClick={() => setActiveTab('home')} />
        </div>

      {/* Aurora Background */}
      <AuroraBlob delay={0} color="indigo" size="xlarge" />
      <AuroraBlob delay={3} color="cyan" size="large" />
      <AuroraBlob delay={6} color="pink" size="medium" />
      <AuroraBlob delay={9} color="violet" size="large" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-6 py-20">
        {/* Header */}
        <motion.div
          variants={headerVariants}
          initial="hidden"
          animate="visible"
          className="text-center mb-16"
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
            Discover Amazing
            <br />
            <span className="bg-gradient-to-r from-cyan-200 via-pink-200 to-white bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            Browse upcoming events and register instantly. Your next amazing experience awaits.
          </p>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <HiSparkles className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white/60 mb-2">No Events Available</h3>
              <p className="text-white/40">Check back soon for exciting new events!</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {events.map((event, index) => (
                <motion.div
                  key={event.id}
                  custom={index}
                  variants={{
                    hidden: { opacity: 0, y: 60, scale: 0.9 },
                    visible: {
                      opacity: 1,
                      y: 0,
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 12,
                        delay: index * 0.1
                      }
                    }
                  }}
                >
                  <EventCard 
                    event={event} 
                    onRegisterClick={handleRegisterClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Registration Modal */}
      <RegistrationModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onRegister={handleRegistrationComplete}
      />
    </div>
  );
}