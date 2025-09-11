/**
 * NextPass Organise Events Component
 * A stunning event management dashboard with glassmorphism design and smooth animations
 * Dependencies: react, framer-motion, react-icons
 */
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Html5Qrcode } from "html5-qrcode";
import Logo from './Logo';

import { 
  HiPlus, 
  HiCalendarDays, 
  HiUser, 
  HiClock,
  HiXMark,
  HiCheckCircle,
  HiExclamationTriangle,
  HiSparkles,
  HiArrowRight,
  HiPencilSquare,
  HiQrCode,
  HiTableCells,
  HiArrowDownTray,
  HiArrowPath,
  HiEye,
  HiVideoCamera,
  HiUserGroup
} from 'react-icons/hi2';


// Reusable Aurora Blob Component
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

// Toast Notification Component
function Toast({ message, type, isVisible, onClose }) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -50, scale: 0.9 }}
          className={`fixed top-4 right-4 z-50 max-w-sm p-4 rounded-xl backdrop-blur-xl border ${
            type === 'success' 
              ? 'bg-green-500/20 border-green-500/30 text-green-100' 
              : 'bg-red-500/20 border-red-500/30 text-red-100'
          }`}
        >
          <div className="flex items-center space-x-2">
            {type === 'success' ? (
              <HiCheckCircle className="h-5 w-5" />
            ) : (
              <HiExclamationTriangle className="h-5 w-5" />
            )}
            <span className="font-medium">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// Event Card Component
function EventCard({ event, onClick }) {
  // Old code in OrganiseEvents.js -> EventCard
// FIXED: This function now correctly handles Firestore's date objects
const formatDate = (dateValue) => {
  let date;
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return { day: '--', month: '---', time: '--:--', full: 'Invalid Date' };
  }

  return {
    day: date.getDate(),
    month: date.toLocaleDateString('en', { month: 'short' }),
    time: date.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    full: date.toLocaleDateString('en', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  };
};

  const dateInfo = formatDate(event.eventDate);
  const regDeadlineInfo = formatDate(event.regDeadline);

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
      className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer overflow-hidden"
      onClick={() => onClick(event)}
    >
      {/* Gradient Overlay on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
        initial={false}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <h3 className="flex-grow pr-4 text-xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent leading-tight">
            {event.eventName}
          </h3>
          <div className="flex-shrink-0 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-2">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{dateInfo.day}</div>
              <div className="text-xs text-white/60 uppercase tracking-wide">{dateInfo.month}</div>
            </div>
          </div>
        </div>

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-white/60">
            <HiCalendarDays className="h-4 w-4 mr-2 text-indigo-400" />
            <span className="text-sm">{dateInfo.full} at {dateInfo.time}</span>
          </div>
          <div className="flex items-center text-white/60">
            <HiClock className="h-4 w-4 mr-2 text-cyan-400" />
            <span className="text-sm">Registration deadline: {regDeadlineInfo.full}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-white/70 text-sm mb-6 line-clamp-3 leading-relaxed">
          {event.remarks || "Manage your event and track attendance."}
        </p>

        {/* Action Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200 flex items-center justify-center space-x-2 group/btn"
          onClick={(e) => {
            e.stopPropagation();
            onClick(event);
          }}
        >
          <HiEye className="h-4 w-4" />
          <span>Manage Event</span>
          <HiArrowRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform duration-200" />
        </motion.button>
      </div>
    </motion.div>
  );
}

// Create Event Modal
function CreateEventModal({ isOpen, onClose, onCreate, organiserEmail }) {
  const [formData, setFormData] = useState({
    eventName: '',
    eventDate: '',
    regDeadline: '',
    remarks: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setFormData({
      eventName: '',
      eventDate: '',
      regDeadline: '',
      remarks: ''
    });
    setError('');
    setIsSubmitting(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async () => {
    if (!formData.eventName.trim() || !formData.eventDate || !formData.regDeadline) {
      setError('Please fill in all required fields');
      return;
    }

    if (new Date(formData.regDeadline) >= new Date(formData.eventDate)) {
      setError('Registration deadline must be before the event date');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/createEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          organiserEmail,
          eventData: {
            eventName: formData.eventName.trim(),
            eventDate: new Date(formData.eventDate).toISOString(),
            regDeadline: new Date(formData.regDeadline).toISOString(),
            remarks: formData.remarks.trim()
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        onCreate();
        handleClose();
      } else {
        setError(result.error || 'Failed to create event');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-slate-900/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-8 max-w-lg w-full mx-4 shadow-2xl">
              <button
                onClick={handleClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <HiXMark className="h-6 w-6 text-white/60 hover:text-white" />
              </button>

              <div className="mb-6">
                <h2 className="text-2xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                  Create New Event
                </h2>
                <p className="text-white/60 text-sm">Set up your event details and start collecting registrations</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Event Name *
                  </label>
                  <input
                    type="text"
                    value={formData.eventName}
                    onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="Enter event name"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Event Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Registration Deadline *
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.regDeadline}
                    onChange={(e) => setFormData({ ...formData, regDeadline: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Event Description
                  </label>
                  <textarea
                    value={formData.remarks}
                    onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                    rows={3}
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm resize-none"
                    placeholder="Describe your event..."
                  />
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                  >
                    <HiExclamationTriangle className="h-4 w-4 flex-shrink-0" />
                    <span>{error}</span>
                  </motion.div>
                )}

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
                      <span>Creating Event...</span>
                    </>
                  ) : (
                    <>
                      <HiPlus className="h-5 w-5" />
                      <span>Create Event</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// QR Scanner Component

// FULLY FUNCTIONAL QR SCANNER COMPONENT (PASTE THIS)
function QRScanner({ isOpen, onClose, onScan, eventId }) {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    // This is the ID of the div we'll render the scanner in
    const readerContainerId = "qr-reader-container";

    const html5QrCode = new Html5Qrcode(readerContainerId);

    const onScanSuccess = (decodedText, decodedResult) => {
      // decodedText contains the participantId from the QR code
      html5QrCode.stop().then(() => {
        handleScan(decodedText); // Call the check-in function with the real participantId
      }).catch(err => console.error("Failed to stop scanner", err));
    };

    const onScanFailure = (error) => {
      // This will fire continuously, so we don't set an error state here
      // unless you want to display a constant "no QR code found" message.
    };

    // Configuration for the scanner
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    // Start the camera and scanner
    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess, onScanFailure)
      .catch(err => {
        setError('Camera access denied. Please allow camera permissions in your browser.');
        console.error("Camera start error:", err);
      });

    // Cleanup function to stop the camera when the modal closes
    return () => {
      html5QrCode.stop().catch(err => console.error("Failed to stop scanner on cleanup", err));
    };

  }, [isOpen]); // This effect runs only when the modal is opened or closed

  const handleScan = async (participantId) => {
    try {
      const response = await fetch('/api/checkIn', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId, participantId })
      });

      const result = await response.json();
      onScan(result); // Pass the API result back to the parent component
    } catch (error) {
      onScan({ success: false, message: 'Network error during check-in' });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="relative bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl p-6 max-w-md w-full mx-4 shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
              >
                <HiXMark className="h-6 w-6 text-white/60 hover:text-white" />
              </button>

              <div className="text-center mb-4">
                <h3 className="text-2xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                  QR Code Check-In
                </h3>
                <p className="text-white/60 text-sm">Position the QR code within the frame</p>
              </div>

              {error ? (
                <div className="text-center text-red-400 p-8">
                  <HiExclamationTriangle className="h-12 w-12 mx-auto mb-2" />
                  <p>{error}</p>
                </div>
              ) : (
                <div id="qr-reader-container" className="w-full rounded-xl overflow-hidden" />
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
// Event Detail Modal
function EventDetailModal({ event, isOpen, onClose, onUpdate, onRefresh }) {
    console.log("Raw event data received in modal:", event);
  const [activeTab, setActiveTab] = useState('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [participants, setParticipants] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [checkInResult, setCheckInResult] = useState(null);
// FIXED: This function correctly formats dates for the edit form
const formatDateForInput = (dateValue) => {
  if (!dateValue) return '';
  let date;
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
};
  // ADD THIS NEW HELPER FUNCTION
const formatCheckInTime = (dateValue) => {
  if (!dateValue) return '-'; // Return a dash if no time is set

  let date;
  // Handle the Firestore timestamp object from the server
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else {
    // Fallback for regular date strings
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return 'Invalid';
  }

  // Format it specifically for the table
  return date.toLocaleString('en-IN', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
};
  useEffect(() => {
  if (event && isOpen) {
    setEditData({
      eventName: event.eventName || '',
      eventDate: formatDateForInput(event.eventDate),
      regDeadline: formatDateForInput(event.regDeadline),
      remarks: event.remarks || ''
    });
    fetchParticipants();
  }
}, [event, isOpen]);

  const fetchParticipants = async () => {
    if (!event?.id) return;

    try {
      const response = await fetch(`/api/getParticipants?eventId=${event.id}`);
      const result = await response.json();
      
      if (result.success) {
        setParticipants(result.participants || []);
      }
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  };

  const handleUpdate = async () => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/updateEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId: event.id,
          updatedFields: {
            eventName: editData.eventName.trim(),
            eventDate: new Date(editData.eventDate).toISOString(),
            regDeadline: new Date(editData.regDeadline).toISOString(),
            remarks: editData.remarks.trim()
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setIsEditing(false);
        onUpdate();
      }
    } catch (error) {
      console.error('Error updating event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch('/api/exportAttendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: event.id })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${event.id}_attendance.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting attendance:', error);
    }
  };

  const handleQRScan = (result) => {
    setCheckInResult(result);
    setShowQRScanner(false);
    fetchParticipants(); // Refresh participants
    
    // Clear result after 3 seconds
    setTimeout(() => setCheckInResult(null), 3000);
  };

  if (!event) return null;

  // FIXED: This function correctly displays dates in the modal's detail view
const formatDate = (dateValue) => {
  if (!dateValue) return 'Not set';
  let date;
  if (dateValue && typeof dateValue === 'object' && dateValue._seconds) {
    date = new Date(dateValue._seconds * 1000);
  } else {
    date = new Date(dateValue);
  }

  if (isNaN(date.getTime())) {
    return 'Invalid Date';
  }

  return date.toLocaleString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Kolkata'
  });
};
  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={onClose}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="fixed inset-0 z-40 flex items-center justify-center p-4"
            >
              <div className="relative bg-slate-900/95 backdrop-blur-2xl border border-white/20 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors z-10"
                >
                  <HiXMark className="h-6 w-6 text-white/60 hover:text-white" />
                </button>

                {/* Header */}
                <div className="p-6 border-b border-white/10">
                  <h2 className="text-3xl font-black bg-gradient-to-r from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent mb-2">
                    {event.eventName}
                  </h2>
                  <p className="text-white/60">Manage your event details and track attendance</p>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-white/10">
                  {[
                    { id: 'details', label: 'Event Details', icon: HiPencilSquare },
                    { id: 'checkin', label: 'Check-In', icon: HiQrCode },
                    { id: 'attendance', label: 'Attendance', icon: HiTableCells }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center space-x-2 px-6 py-4 font-medium transition-all ${
                        activeTab === tab.id
                          ? 'bg-white/10 border-b-2 border-indigo-400 text-white'
                          : 'text-white/60 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <tab.icon className="h-5 w-5" />
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[60vh]">
                  {/* Event Details Tab */}
                  {activeTab === 'details' && (
                    <div className="space-y-6">
                      {!isEditing ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="bg-white/5 rounded-xl p-4">
                              <h4 className="text-white/80 font-medium mb-2">Event Date</h4>
                              <p className="text-white">{formatDate(event.eventDate)}</p>
                            </div>
                            <div className="bg-white/5 rounded-xl p-4">
                              <h4 className="text-white/80 font-medium mb-2">Registration Deadline</h4>
                              <p className="text-white">{formatDate(event.regDeadline)}</p>
                            </div>
                          </div>
                          
                          <div className="bg-white/5 rounded-xl p-4">
                            <h4 className="text-white/80 font-medium mb-2">Description</h4>
                            <p className="text-white">{event.remarks || 'No description provided'}</p>
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setIsEditing(true)}
                            className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200 flex items-center space-x-2"
                          >
                            <HiPencilSquare className="h-5 w-5" />
                            <span>Edit Event</span>
                          </motion.button>
                        </>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Event Name
                            </label>
                            <input
                              type="text"
                              value={editData.eventName}
                              onChange={(e) => setEditData({ ...editData, eventName: e.target.value })}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-white/80 text-sm font-medium mb-2">
                                Event Date & Time
                              </label>
                              <input
                                type="datetime-local"
                                value={editData.eventDate}
                                onChange={(e) => setEditData({ ...editData, eventDate: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                              />
                            </div>

                            <div>
                              <label className="block text-white/80 text-sm font-medium mb-2">
                                Registration Deadline
                              </label>
                              <input
                                type="datetime-local"
                                value={editData.regDeadline}
                                onChange={(e) => setEditData({ ...editData, regDeadline: e.target.value })}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Description
                            </label>
                            <textarea
                              value={editData.remarks}
                              onChange={(e) => setEditData({ ...editData, remarks: e.target.value })}
                              rows={3}
                              className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent backdrop-blur-sm resize-none"
                            />
                          </div>

                          <div className="flex space-x-4">
                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={handleUpdate}
                              disabled={isSubmitting}
                              className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-green-500 hover:to-emerald-500 disabled:opacity-50 transition-all duration-200 flex items-center justify-center space-x-2"
                            >
                              {isSubmitting ? (
                                <>
                                  <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                                  />
                                  <span>Saving...</span>
                                </>
                              ) : (
                                <>
                                  <HiCheckCircle className="h-5 w-5" />
                                  <span>Save Changes</span>
                                </>
                              )}
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              onClick={() => setIsEditing(false)}
                              className="flex-1 bg-white/10 text-white font-semibold py-3 px-6 rounded-xl hover:bg-white/20 transition-all duration-200"
                            >
                              Cancel
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Check-In Tab */}
                  {activeTab === 'checkin' && (
                    <div className="space-y-6 text-center">
                      <div>
                        <HiVideoCamera className="h-16 w-16 text-indigo-400 mx-auto mb-4" />
                        <h3 className="text-2xl font-bold text-white mb-2">QR Code Check-In</h3>
                        <p className="text-white/70 mb-6">
                          Use your camera to scan participant QR codes for instant check-in
                        </p>
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setShowQRScanner(true)}
                        className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-4 px-8 rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200 flex items-center justify-center space-x-2 mx-auto"
                      >
                        <HiQrCode className="h-6 w-6" />
                        <span>Start Check-In Scanner</span>
                      </motion.button>

                      {checkInResult && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`p-4 rounded-xl border ${
                            checkInResult.success 
                              ? 'bg-green-500/20 border-green-500/30 text-green-100'
                              : 'bg-red-500/20 border-red-500/30 text-red-100'
                          }`}
                        >
                          <div className="flex items-center justify-center space-x-2">
                            {checkInResult.success ? (
                              <HiCheckCircle className="h-6 w-6" />
                            ) : (
                              <HiExclamationTriangle className="h-6 w-6" />
                            )}
                            <span className="font-medium">{checkInResult.message}</span>
                          </div>
                          {checkInResult.participant && (
                            <p className="text-sm mt-2 opacity-80">
                              {checkInResult.participant.name} ({checkInResult.participant.email})
                            </p>
                          )}
                        </motion.div>
                      )}
                    </div>
                  )}

                  {/* Attendance Tab */}
                  {activeTab === 'attendance' && (
                    <div className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-1">Attendance Overview</h3>
                          <p className="text-white/60">
                            {participants.filter(p => p.attendance).length} / {participants.length} checked in
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={fetchParticipants}
                            className="bg-white/10 text-white font-semibold py-2 px-4 rounded-xl hover:bg-white/20 transition-all duration-200 flex items-center space-x-2"
                          >
                            <HiArrowPath className="h-4 w-4" />
                            <span>Refresh</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleExport}
                            className="bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold py-2 px-4 rounded-xl hover:from-green-500 hover:to-emerald-500 transition-all duration-200 flex items-center space-x-2"
                          >
                            <HiArrowDownTray className="h-4 w-4" />
                            <span>Export Excel</span>
                          </motion.button>
                        </div>
                      </div>

                      {participants.length === 0 ? (
                        <div className="text-center py-12">
                          <HiUserGroup className="h-16 w-16 text-white/30 mx-auto mb-4" />
                          <h4 className="text-xl font-bold text-white/60 mb-2">No Registrations Yet</h4>
                          <p className="text-white/40">Participants will appear here once they register</p>
                        </div>
                      ) : (
                        <div className="bg-white/5 rounded-xl overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-white/10">
                                <tr>
                                  <th className="text-left py-3 px-4 text-white/80 font-medium">Name</th>
                                  <th className="text-left py-3 px-4 text-white/80 font-medium">Email</th>
                                  <th className="text-left py-3 px-4 text-white/80 font-medium">ID</th>
                                  <th className="text-center py-3 px-4 text-white/80 font-medium">Status</th>
                                  <th className="text-left py-3 px-4 text-white/80 font-medium">Check-In Time</th>
                                </tr>
                              </thead>
                              <tbody>
                                {participants.map((participant, index) => (
                                  <motion.tr
                                    key={participant.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`border-t border-white/10 hover:bg-white/5 transition-colors ${
                                      participant.attendance ? 'bg-green-500/10' : ''
                                    }`}
                                  >
                                    <td className="py-3 px-4 text-white">{participant.name}</td>
                                    <td className="py-3 px-4 text-white/70">{participant.email}</td>
                                    <td className="py-3 px-4 text-white/50 font-mono text-xs">
                                      {participant.id.slice(-8)}
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                      {participant.attendance ? (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-300 border border-green-500/30">
                                          <HiCheckCircle className="h-3 w-3 mr-1" />
                                          Checked In
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white/10 text-white/60 border border-white/20">
                                          Pending
                                        </span>
                                      )}
                                    </td>
                                    <td className="py-3 px-4 text-white/70 text-sm">
                                      {formatCheckInTime(participant.checkInTime)}
                                    </td>
                                  </motion.tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={() => setShowQRScanner(false)}
        onScan={handleQRScan}
        eventId={event.id}
      />
    </>
  );
}

// Main Organise Events Component
export default function OrganiseEvents({ setActiveTab, organiserEmail = "organizer@example.com" }) {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '', visible: false });

  useEffect(() => {
    fetchEvents();
  }, [organiserEmail]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/getEventsByOrganiser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organiserEmail })
      });

      const result = await response.json();
      
      if (result.success) {
        setEvents(result.events || []);
      } else {
        showToast('Failed to fetch events', 'error');
      }
    } catch (error) {
      showToast('Network error while fetching events', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message, type) => {
    setToast({ message, type, visible: true });
  };

  const hideToast = () => {
    setToast({ ...toast, visible: false });
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleEventCreate = () => {
    showToast('Event created successfully!', 'success');
    fetchEvents();
  };

  const handleEventUpdate = () => {
    showToast('Event updated successfully!', 'success');
    fetchEvents();
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
      {/* Floating Logo */}
      <div className="fixed top-6 left-6 z-50">
        <Logo onClick={() => setActiveTab('home')} />
      </div>

      {/* Aurora Background */}
      <AuroraBlob delay={0} color="indigo" size="xlarge" />
      <AuroraBlob delay={3} color="cyan" size="large" />
      <AuroraBlob delay={6} color="pink" size="medium" />
      <AuroraBlob delay={9} color="violet" size="large" />

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={hideToast}
      />

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
            Organise Your
            <br />
            <span className="bg-gradient-to-r from-cyan-200 via-pink-200 to-white bg-clip-text text-transparent">
              Events
            </span>
          </h1>
          <p className="text-xl text-white/70 max-w-2xl mx-auto leading-relaxed mb-8">
            Create, manage, and track attendance for your events with powerful tools and real-time insights.
          </p>

          {/* Create Event Button */}
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCreateModalOpen(true)}
            className="bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-600 text-white font-bold py-4 px-8 rounded-2xl hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 transition-all duration-300 flex items-center space-x-3 mx-auto shadow-lg"
          >
            <HiPlus className="h-6 w-6" />
            <span className="text-lg">Create New Event</span>
            <HiSparkles className="h-5 w-5" />
          </motion.button>
        </motion.div>

        {/* Events Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {loading ? (
            <LoadingSpinner />
          ) : events.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-20"
            >
              <HiCalendarDays className="h-16 w-16 text-white/30 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white/60 mb-2">No Events Yet</h3>
              <p className="text-white/40 mb-6">Create your first event to get started!</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setCreateModalOpen(true)}
                className="bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-indigo-500 hover:to-cyan-500 transition-all duration-200 flex items-center space-x-2 mx-auto"
              >
                <HiPlus className="h-5 w-5" />
                <span>Create Event</span>
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                    onClick={handleEventClick}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Modals */}
      <CreateEventModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleEventCreate}
        organiserEmail={organiserEmail}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onUpdate={handleEventUpdate}
        onRefresh={fetchEvents}
      />
    </div>
  );
}