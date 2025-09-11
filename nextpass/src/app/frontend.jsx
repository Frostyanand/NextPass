// // Version 2 :

// /*
// NextPass - Complete Event Management Frontend

// INSTALLATION:
// npm install framer-motion @zxing/browser react-icons

// OPTIONAL (for Tailwind):
// npm install tailwindcss postcss autoprefixer
// npx tailwindcss init

// USAGE:
// 1. Place this file as app/page.jsx or app/frontend.jsx in your Next.js app
// 2. Replace the placeholder video URL below with your actual video
// 3. Pass userEmail prop: <NextPassFrontend userEmail="user@example.com" />

// REPLACE THIS:
// - VIDEO_URL: Update the hero background video URL
// - API_BASE: Update if your API is not same-origin
// */

// "use client";

// import React, { useState, useEffect, useRef } from 'react';
// import { motion, AnimatePresence, useAnimation, useInView } from 'framer-motion';
// import { BrowserMultiFormatReader } from '@zxing/browser';
// import { 
//   FiHome, FiCalendar, FiPlus, FiUser, FiInfo, FiCamera, FiDownload, 
//   FiEdit, FiRefreshCw, FiX, FiCheck, FiStar, FiMapPin, FiClock,
//   FiUsers, FiMail, FiPhone, FiZap, FiTrendingUp, FiAward
// } from 'react-icons/fi';

// // =================== CONFIGURATION ===================
// const API_BASE = ''; // Empty for same-origin, or 'https://your-domain.com'
// const VIDEO_URL = 'https://cdn.pixabay.com/vimeo/394375633/tech-40344.mp4'; // TODO: Replace with your video
// const PRIMARY_COLOR = '#6C63FF';
// const SECONDARY_COLOR = '#00C2FF';

// // =================== MAIN COMPONENT ===================
// export default function NextPassFrontend({ userEmail }) {
//   const [currentPage, setCurrentPage] = useState('home');
//   const [loading, setLoading] = useState(false);
//   const [showModal, setShowModal] = useState(null);
//   const [events, setEvents] = useState([]);
//   const [userRegistrations, setUserRegistrations] = useState([]);
//   const [organiserEvents, setOrganiserEvents] = useState([]);
//   const [selectedEvent, setSelectedEvent] = useState(null);
//   const [participants, setParticipants] = useState([]);
//   const [liveRefresh, setLiveRefresh] = useState(false);
//   const [toast, setToast] = useState(null);
//   const [qrScanner, setQrScanner] = useState(false);
//   const [scannerReader, setScannerReader] = useState(null);
//   const videoRef = useRef(null);
//   const intervalRef = useRef(null);

//   // Auth check
//   if (!userEmail) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
//         <motion.div
//           initial={{ scale: 0.8, opacity: 0 }}
//           animate={{ scale: 1, opacity: 1 }}
//           className="text-white text-2xl font-bold backdrop-blur-lg bg-white/10 p-8 rounded-3xl border border-white/20"
//         >
//           Please sign in with Google first.
//         </motion.div>
//       </div>
//     );
//   }

//   // =================== API FUNCTIONS ===================
//   const apiCall = async (endpoint, options = {}) => {
//     try {
//       setLoading(true);
//       const response = await fetch(`${API_BASE}/api/${endpoint}`, {
//         headers: { 'Content-Type': 'application/json' },
//         ...options,
//       });
      
//       if (endpoint === 'exportAttendance' && response.headers.get('content-type')?.includes('spreadsheet')) {
//         return response.blob();
//       }
      
//       const data = await response.json();
//       if (!response.ok) throw new Error(data.error || data.message || 'API Error');
//       return data;
//     } catch (error) {
//       showToast(error.message, 'error');
//       throw error;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const showToast = (message, type = 'success') => {
//     setToast({ message, type });
//     setTimeout(() => setToast(null), 4000);
//   };

//   // =================== DATA FETCHERS ===================
//   const fetchAvailableEvents = async () => {
//     try {
//       const data = await apiCall('getAvailableEvents');
//       setEvents(data.events || []);
//     } catch (error) {
//       console.error('Failed to fetch events:', error);
//     }
//   };

//   const fetchUserRegistrations = async () => {
//     try {
//       const data = await apiCall('getUserRegistrations', {
//         method: 'POST',
//         body: JSON.stringify({ userEmail }),
//       });
//       setUserRegistrations(data.registrations || []);
//     } catch (error) {
//       console.error('Failed to fetch user registrations:', error);
//     }
//   };

//   const fetchOrganiserEvents = async () => {
//     try {
//       const data = await apiCall('getEventsByOrganiser', {
//         method: 'POST',
//         body: JSON.stringify({ organiserEmail: userEmail }),
//       });
//       setOrganiserEvents(data.events || []);
//     } catch (error) {
//       console.error('Failed to fetch organiser events:', error);
//     }
//   };

//   const fetchParticipants = async (eventId) => {
//     try {
//       const data = await apiCall(`getParticipants?eventId=${eventId}`);
//       setParticipants(data.participants || []);
//     } catch (error) {
//       console.error('Failed to fetch participants:', error);
//     }
//   };

//   // =================== EVENT HANDLERS ===================
//   const handleRegisterParticipant = async (eventId, participantData) => {
//     try {
//       await apiCall('registerParticipant', {
//         method: 'POST',
//         body: JSON.stringify({ eventId, participantData }),
//       });
//       showToast('Registration successful! Check your email for details.', 'success');
//       setShowModal(null);
//       fetchUserRegistrations();
//     } catch (error) {
//       console.error('Registration failed:', error);
//     }
//   };

//   const handleCreateEvent = async (eventData) => {
//     try {
//       await apiCall('createEvent', {
//         method: 'POST',
//         body: JSON.stringify({ organiserEmail: userEmail, eventData }),
//       });
//       showToast('Event created successfully!', 'success');
//       setShowModal(null);
//       fetchOrganiserEvents();
//     } catch (error) {
//       console.error('Event creation failed:', error);
//     }
//   };

//   const handleUpdateEvent = async (eventId, updatedFields) => {
//     try {
//       await apiCall('updateEvent', {
//         method: 'POST',
//         body: JSON.stringify({ eventId, updatedFields }),
//       });
//       showToast('Event updated successfully!', 'success');
//       setShowModal(null);
//       fetchOrganiserEvents();
//     } catch (error) {
//       console.error('Event update failed:', error);
//     }
//   };

//   const handleCheckIn = async (eventId, participantId) => {
//     try {
//       const data = await apiCall('checkIn', {
//         method: 'POST',
//         body: JSON.stringify({ eventId, participantId }),
//       });
//       if (data.success) {
//         showToast('Check-in successful!', 'success');
//         fetchParticipants(eventId);
//       } else {
//         showToast(data.message, 'warning');
//       }
//     } catch (error) {
//       console.error('Check-in failed:', error);
//     }
//   };

//   const handleExportAttendance = async (eventId) => {
//     try {
//       const blob = await apiCall('exportAttendance', {
//         method: 'POST',
//         body: JSON.stringify({ eventId }),
//       });
//       const url = URL.createObjectURL(blob);
//       const a = document.createElement('a');
//       a.href = url;
//       a.download = `${eventId}_attendance.xlsx`;
//       a.click();
//       URL.revokeObjectURL(url);
//       showToast('Attendance exported successfully!', 'success');
//     } catch (error) {
//       console.error('Export failed:', error);
//     }
//   };

//   // =================== QR SCANNER ===================
//   const startQRScanner = async (eventId) => {
//     setQrScanner(true);
//     try {
//       const reader = new BrowserMultiFormatReader();
//       setScannerReader(reader);
      
//       const videoElement = videoRef.current;
//       if (videoElement) {
//         await reader.decodeFromVideoDevice(null, videoElement, (result) => {
//           if (result) {
//             const participantId = result.getText();
//             handleCheckIn(eventId, participantId);
//             stopQRScanner();
//           }
//         });
//       }
//     } catch (error) {
//       showToast('Camera access denied or not available', 'error');
//       setQrScanner(false);
//     }
//   };

//   const stopQRScanner = () => {
//     if (scannerReader) {
//       scannerReader.reset();
//     }
//     setQrScanner(false);
//     setScannerReader(null);
//   };

//   // =================== EFFECTS ===================
//   useEffect(() => {
//     if (currentPage === 'browse') fetchAvailableEvents();
//     if (currentPage === 'registrations') fetchUserRegistrations();
//     if (currentPage === 'organise') fetchOrganiserEvents();
//   }, [currentPage]);

//   useEffect(() => {
//     if (liveRefresh && selectedEvent) {
//       intervalRef.current = setInterval(() => {
//         fetchParticipants(selectedEvent.id);
//       }, 10000);
//     } else if (intervalRef.current) {
//       clearInterval(intervalRef.current);
//     }
    
//     return () => {
//       if (intervalRef.current) clearInterval(intervalRef.current);
//     };
//   }, [liveRefresh, selectedEvent]);

//   // =================== PARTICLE BACKGROUND ===================
//   const ParticleBackground = () => {
//     const particles = Array.from({ length: 50 }, (_, i) => (
//       <motion.div
//         key={i}
//         className="absolute w-2 h-2 bg-white/20 rounded-full"
//         animate={{
//           x: [0, Math.random() * 1000, 0],
//           y: [0, Math.random() * 800, 0],
//         }}
//         transition={{
//           duration: Math.random() * 20 + 10,
//           repeat: Infinity,
//           ease: "linear",
//         }}
//         style={{
//           left: Math.random() * 100 + '%',
//           top: Math.random() * 100 + '%',
//         }}
//       />
//     ));

//     return (
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         {particles}
//       </div>
//     );
//   };

//   // =================== NAVBAR ===================
//   const Navbar = () => {
//     const navItems = [
//       { key: 'home', label: 'Home', icon: FiHome },
//       { key: 'browse', label: 'Discover Events', icon: FiCalendar },
//       { key: 'organise', label: 'Create & Manage', icon: FiPlus },
//       { key: 'registrations', label: 'My Events', icon: FiUser },
//       { key: 'about', label: 'About', icon: FiInfo },
//     ];

//     return (
//       <motion.nav 
//         initial={{ y: -100 }}
//         animate={{ y: 0 }}
//         className="fixed top-0 left-0 right-0 z-50 backdrop-blur-lg bg-white/10 border-b border-white/20"
//       >
//         <div className="max-w-7xl mx-auto px-6 py-4">
//           <div className="flex items-center justify-between">
//             <motion.div 
//               className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
//               whileHover={{ scale: 1.05 }}
//             >
//               NextPass ✨
//             </motion.div>
            
//             <div className="hidden md:flex space-x-1">
//               {navItems.map((item) => (
//                 <motion.button
//                   key={item.key}
//                   onClick={() => setCurrentPage(item.key)}
//                   className={`px-6 py-3 rounded-full flex items-center space-x-2 transition-all duration-300 ${
//                     currentPage === item.key 
//                       ? 'bg-white/20 text-white shadow-lg' 
//                       : 'text-white/70 hover:text-white hover:bg-white/10'
//                   }`}
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                 >
//                   <item.icon size={18} />
//                   <span>{item.label}</span>
//                 </motion.button>
//               ))}
//             </div>

//             <div className="md:hidden">
//               <motion.button
//                 whileTap={{ scale: 0.9 }}
//                 className="p-2 rounded-full bg-white/10 text-white"
//               >
//                 ☰
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       </motion.nav>
//     );
//   };

//   // =================== HERO SECTION ===================
//   const HeroSection = () => {
//     return (
//       <motion.section 
//         className="relative h-screen flex items-center justify-center overflow-hidden"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         {/* Background Video */}
//         <div className="absolute inset-0">
//           <video
//             autoPlay
//             muted
//             loop
//             playsInline
//             className="w-full h-full object-cover opacity-30"
//           >
//             <source src={VIDEO_URL} type="video/mp4" />
//           </video>
//           <div className="absolute inset-0 bg-gradient-to-br from-purple-900/50 via-pink-900/50 to-indigo-900/50" />
//         </div>

//         <ParticleBackground />

//         <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-6">
//           <motion.h1 
//             className="text-6xl md:text-8xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent"
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.2 }}
//           >
//             NextPass
//           </motion.h1>
          
//           <motion.p 
//             className="text-xl md:text-2xl mb-8 text-white/80"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.4 }}
//           >
//             The Future of Event Management is Here
//           </motion.p>
          
//           <motion.p 
//             className="text-lg mb-12 text-white/60 max-w-2xl mx-auto"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.6 }}
//           >
//             Seamlessly create, manage, and attend events with cutting-edge QR technology, 
//             real-time analytics, and stunning user experiences.
//           </motion.p>

//           <motion.div 
//             className="flex flex-col sm:flex-row gap-6 justify-center"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 0.8 }}
//           >
//             <motion.button
//               onClick={() => setCurrentPage('browse')}
//               className="px-12 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold text-lg shadow-2xl border border-white/20"
//               whileHover={{ scale: 1.05, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <span className="flex items-center space-x-2">
//                 <FiZap />
//                 <span>Discover Events</span>
//               </span>
//             </motion.button>
            
//             <motion.button
//               onClick={() => setCurrentPage('organise')}
//               className="px-12 py-4 bg-white/10 backdrop-blur-sm rounded-full text-white font-semibold text-lg border border-white/30 hover:bg-white/20 transition-all duration-300"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <span className="flex items-center space-x-2">
//                 <FiPlus />
//                 <span>Create Event</span>
//               </span>
//             </motion.button>
//           </motion.div>

//           {/* Feature highlights */}
//           <motion.div 
//             className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8"
//             initial={{ y: 50, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//             transition={{ delay: 1.2 }}
//           >
//             {[
//               { icon: FiTrendingUp, title: 'Real-time Analytics', desc: 'Live attendance tracking' },
//               { icon: FiCamera, title: 'QR Check-ins', desc: 'Instant participant verification' },
//               { icon: FiAward, title: 'Premium Experience', desc: 'Beautiful, intuitive interface' }
//             ].map((feature, index) => (
//               <motion.div
//                 key={index}
//                 className="backdrop-blur-lg bg-white/5 p-6 rounded-2xl border border-white/10"
//                 whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
//               >
//                 <feature.icon className="w-8 h-8 text-purple-300 mb-4 mx-auto" />
//                 <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
//                 <p className="text-white/60">{feature.desc}</p>
//               </motion.div>
//             ))}
//           </motion.div>
//         </div>
//       </motion.section>
//     );
//   };

//   // =================== EVENT CARD ===================
//   const EventCard = ({ event, onRegister, showRegisterButton = true, onEventClick = null }) => {
//     return (
//       <motion.div
//         className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300 cursor-pointer group overflow-hidden relative"
//         initial={{ opacity: 0, y: 20 }}
//         animate={{ opacity: 1, y: 0 }}
//         whileHover={{ 
//           scale: 1.03, 
//           rotateY: 5,
//           boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.3)' 
//         }}
//         onClick={() => onEventClick && onEventClick(event)}
//         style={{ transformStyle: 'preserve-3d' }}
//       >
//         {/* Gradient overlay */}
//         <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
//         <div className="relative z-10">
//           <div className="flex justify-between items-start mb-4">
//             <motion.h3 
//               className="text-xl font-bold text-white group-hover:text-purple-200 transition-colors duration-300"
//               layoutId={`title-${event.id}`}
//             >
//               {event.eventName}
//             </motion.h3>
//             <motion.div 
//               className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400"
//               animate={{ scale: [1, 1.2, 1] }}
//               transition={{ duration: 2, repeat: Infinity }}
//             />
//           </div>
          
//           <div className="space-y-3 mb-6">
//             <div className="flex items-center text-white/70">
//               <FiCalendar className="mr-2" />
//               <span>{new Date(event.eventDate).toLocaleDateString()}</span>
//             </div>
//             <div className="flex items-center text-white/70">
//               <FiClock className="mr-2" />
//               <span>Registration until: {new Date(event.regDeadline).toLocaleDateString()}</span>
//             </div>
//             {event.remarks && (
//               <div className="flex items-start text-white/60">
//                 <FiInfo className="mr-2 mt-1 flex-shrink-0" />
//                 <span className="text-sm">{event.remarks}</span>
//               </div>
//             )}
//           </div>

//           {showRegisterButton && (
//             <motion.button
//               onClick={(e) => {
//                 e.stopPropagation();
//                 onRegister(event);
//               }}
//               className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//             >
//               Register Now
//             </motion.button>
//           )}
//         </div>
//       </motion.div>
//     );
//   };

//   // =================== MODAL COMPONENTS ===================
//   const Modal = ({ isOpen, onClose, title, children, size = 'md' }) => {
//     const sizes = {
//       sm: 'max-w-md',
//       md: 'max-w-2xl',
//       lg: 'max-w-4xl',
//       xl: 'max-w-6xl'
//     };

//     return (
//       <AnimatePresence>
//         {isOpen && (
//           <motion.div
//             className="fixed inset-0 z-50 flex items-center justify-center p-4"
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//           >
//             <motion.div
//               className="absolute inset-0 bg-black/50 backdrop-blur-sm"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//               exit={{ opacity: 0 }}
//               onClick={onClose}
//             />
            
//             <motion.div
//               className={`relative w-full ${sizes[size]} max-h-[90vh] overflow-auto backdrop-blur-xl bg-white/10 rounded-3xl border border-white/20 shadow-2xl`}
//               initial={{ scale: 0.9, opacity: 0, y: 20 }}
//               animate={{ scale: 1, opacity: 1, y: 0 }}
//               exit={{ scale: 0.9, opacity: 0, y: 20 }}
//             >
//               <div className="p-6">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-2xl font-bold text-white">{title}</h2>
//                   <motion.button
//                     onClick={onClose}
//                     className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
//                     whileHover={{ scale: 1.1, rotate: 90 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <FiX size={20} />
//                   </motion.button>
//                 </div>
//                 {children}
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     );
//   };

//   const RegistrationForm = ({ event, onSubmit, onClose }) => {
//     const [formData, setFormData] = useState({ name: '', email: userEmail });
    
//     const handleSubmit = (e) => {
//       e.preventDefault();
//       onSubmit(event.id, formData);
//     };

//     return (
//       <motion.form
//         onSubmit={handleSubmit}
//         className="space-y-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="text-center mb-6">
//           <h3 className="text-xl font-semibold text-white mb-2">{event.eventName}</h3>
//           <p className="text-white/60">{new Date(event.eventDate).toLocaleDateString()}</p>
//         </div>

//         <div className="space-y-4">
//           <div>
//             <label className="block text-white/70 mb-2">Full Name</label>
//             <input
//               type="text"
//               required
//               value={formData.name}
//               onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//               placeholder="Enter your full name"
//             />
//           </div>
          
//           <div>
//             <label className="block text-white/70 mb-2">Email Address</label>
//             <input
//               type="email"
//               required
//               value={formData.email}
//               onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//               placeholder="Enter your email"
//             />
//           </div>
//         </div>

//         <div className="flex space-x-4">
//           <motion.button
//             type="button"
//             onClick={onClose}
//             className="flex-1 py-3 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             Cancel
//           </motion.button>
//           <motion.button
//             type="submit"
//             disabled={loading}
//             className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
//             whileHover={{ scale: loading ? 1 : 1.02 }}
//             whileTap={{ scale: loading ? 1 : 0.98 }}
//           >
//             {loading ? 'Registering...' : 'Register'}
//           </motion.button>
//         </div>
//       </motion.form>
//     );
//   };

//   const EventForm = ({ event = null, onSubmit, onClose }) => {
//     const [formData, setFormData] = useState({
//       eventName: event?.eventName || '',
//       eventDate: event?.eventDate ? new Date(event.eventDate).toISOString().slice(0, 16) : '',
//       regDeadline: event?.regDeadline ? new Date(event.regDeadline).toISOString().slice(0, 16) : '',
//       remarks: event?.remarks || '',
//     });

//     const handleSubmit = (e) => {
//       e.preventDefault();
//       const data = {
//         ...formData,
//         eventDate: new Date(formData.eventDate).toISOString(),
//         regDeadline: new Date(formData.regDeadline).toISOString(),
//       };
      
//       if (event) {
//         onSubmit(event.id, data);
//       } else {
//         onSubmit(data);
//       }
//     };

//     return (
//       <motion.form
//         onSubmit={handleSubmit}
//         className="space-y-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-white/70 mb-2">Event Name</label>
//             <input
//               type="text"
//               required
//               value={formData.eventName}
//               onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//               placeholder="Enter event name"
//             />
//           </div>
          
//           <div>
//             <label className="block text-white/70 mb-2">Event Date & Time</label>
//             <input
//               type="datetime-local"
//               required
//               value={formData.eventDate}
//               onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//             />
//           </div>
          
//           <div>
//             <label className="block text-white/70 mb-2">Registration Deadline</label>
//             <input
//               type="datetime-local"
//               required
//               value={formData.regDeadline}
//               onChange={(e) => setFormData({ ...formData, regDeadline: e.target.value })}
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//             />
//           </div>
          
//           <div>
//             <label className="block text-white/70 mb-2">Event Description</label>
//             <textarea
//               value={formData.remarks}
//               onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
//               rows="4"
//               className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300 resize-none"
//               placeholder="Describe your event..."
//             />
//           </div>
//         </div>

//         <div className="flex space-x-4">
//           <motion.button
//             type="button"
//             onClick={onClose}
//             className="flex-1 py-3 rounded-2xl bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all duration-300"
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//           >
//             Cancel
//           </motion.button>
//           <motion.button
//             type="submit"
//             disabled={loading}
//             className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold hover:from-purple-600 hover:to-pink-600 transition-all duration-300 disabled:opacity-50"
//             whileHover={{ scale: loading ? 1 : 1.02 }}
//             whileTap={{ scale: loading ? 1 : 0.98 }}
//           >
//             {loading ? 'Saving...' : (event ? 'Update Event' : 'Create Event')}
//           </motion.button>
//         </div>
//       </motion.form>
//     );
//   };

//   // =================== QR SCANNER MODAL ===================
//   const QRScannerModal = ({ eventId, onClose }) => {
//     const [manualId, setManualId] = useState('');

//     const handleManualCheckIn = () => {
//       if (manualId.trim()) {
//         handleCheckIn(eventId, manualId.trim());
//         setManualId('');
//         onClose();
//       }
//     };

//     return (
//       <Modal isOpen={true} onClose={onClose} title="Scan QR Code" size="lg">
//         <div className="space-y-6">
//           {qrScanner ? (
//             <div className="relative">
//               <video
//                 ref={videoRef}
//                 className="w-full max-w-md mx-auto rounded-2xl bg-black"
//                 autoPlay
//                 muted
//                 playsInline
//               />
//               <div className="absolute inset-0 border-4 border-purple-400 rounded-2xl pointer-events-none">
//                 <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-4 border-white/50 rounded-2xl">
//                   <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-lg"></div>
//                   <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-lg"></div>
//                   <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-lg"></div>
//                   <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-lg"></div>
//                 </div>
//               </div>
//               <p className="text-center text-white/70 mt-4">Position QR code within the frame</p>
//               <motion.button
//                 onClick={stopQRScanner}
//                 className="mt-4 w-full py-3 bg-red-500 rounded-2xl text-white font-semibold"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 Stop Scanner
//               </motion.button>
//             </div>
//           ) : (
//             <div className="text-center space-y-4">
//               <motion.button
//                 onClick={() => startQRScanner(eventId)}
//                 className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white font-semibold text-lg flex items-center justify-center space-x-2"
//                 whileHover={{ scale: 1.02 }}
//                 whileTap={{ scale: 0.98 }}
//               >
//                 <FiCamera size={24} />
//                 <span>Start Camera Scanner</span>
//               </motion.button>
              
//               <div className="relative">
//                 <div className="absolute inset-0 flex items-center">
//                   <div className="w-full border-t border-white/20"></div>
//                 </div>
//                 <div className="relative flex justify-center text-sm">
//                   <span className="px-2 bg-transparent text-white/60">OR</span>
//                 </div>
//               </div>
              
//               <div className="space-y-4">
//                 <input
//                   type="text"
//                   value={manualId}
//                   onChange={(e) => setManualId(e.target.value)}
//                   placeholder="Paste participant ID manually"
//                   className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:border-purple-400 focus:ring-2 focus:ring-purple-400/20 transition-all duration-300"
//                 />
//                 <motion.button
//                   onClick={handleManualCheckIn}
//                   disabled={!manualId.trim()}
//                   className="w-full py-3 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl text-white font-semibold disabled:opacity-50"
//                   whileHover={{ scale: manualId.trim() ? 1.02 : 1 }}
//                   whileTap={{ scale: manualId.trim() ? 0.98 : 1 }}
//                 >
//                   Check In Manually
//                 </motion.button>
//               </div>
//             </div>
//           )}
//         </div>
//       </Modal>
//     );
//   };

//   // =================== EVENT DASHBOARD ===================
//   const EventDashboard = ({ event, onClose }) => {
//     const [refreshing, setRefreshing] = useState(false);

//     const handleRefresh = async () => {
//       setRefreshing(true);
//       await fetchParticipants(event.id);
//       setRefreshing(false);
//     };

//     useEffect(() => {
//       fetchParticipants(event.id);
//     }, [event.id]);

//     return (
//       <Modal isOpen={true} onClose={onClose} title={`Dashboard: ${event.eventName}`} size="xl">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
//           {/* Event Details */}
//           <div className="space-y-6">
//             <div className="backdrop-blur-lg bg-white/5 rounded-3xl p-6 border border-white/20">
//               <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
//                 <FiInfo className="mr-2" />
//                 Event Details
//               </h3>
//               <div className="space-y-3 text-white/70">
//                 <div><strong>Date:</strong> {new Date(event.eventDate).toLocaleString()}</div>
//                 <div><strong>Registration Deadline:</strong> {new Date(event.regDeadline).toLocaleString()}</div>
//                 <div><strong>Organiser:</strong> {event.organiserEmail}</div>
//                 {event.remarks && <div><strong>Description:</strong> {event.remarks}</div>}
//               </div>
//               <div className="flex space-x-3 mt-6">
//                 <motion.button
//                   onClick={() => setShowModal({ type: 'updateEvent', data: event })}
//                   className="flex-1 py-2 px-4 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl text-white text-sm font-semibold flex items-center justify-center space-x-1"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <FiEdit size={16} />
//                   <span>Update</span>
//                 </motion.button>
//                 <motion.button
//                   onClick={() => setShowModal({ type: 'qrScanner', data: event.id })}
//                   className="flex-1 py-2 px-4 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl text-white text-sm font-semibold flex items-center justify-center space-x-1"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <FiCamera size={16} />
//                   <span>Check-in</span>
//                 </motion.button>
//                 <motion.button
//                   onClick={() => handleExportAttendance(event.id)}
//                   className="flex-1 py-2 px-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl text-white text-sm font-semibold flex items-center justify-center space-x-1"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   <FiDownload size={16} />
//                   <span>Export</span>
//                 </motion.button>
//               </div>
//             </div>
//           </div>

//           {/* Attendance Table */}
//           <div className="space-y-6">
//             <div className="backdrop-blur-lg bg-white/5 rounded-3xl p-6 border border-white/20">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="text-xl font-semibold text-white flex items-center">
//                   <FiUsers className="mr-2" />
//                   Attendance ({participants.length})
//                 </h3>
//                 <div className="flex items-center space-x-3">
//                   <label className="flex items-center space-x-2 text-white/70">
//                     <input
//                       type="checkbox"
//                       checked={liveRefresh}
//                       onChange={(e) => setLiveRefresh(e.target.checked)}
//                       className="rounded"
//                     />
//                     <span>Live</span>
//                   </label>
//                   <motion.button
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     className="p-2 bg-white/10 rounded-full text-white hover:bg-white/20 transition-all duration-300"
//                     whileHover={{ scale: 1.1, rotate: 180 }}
//                     whileTap={{ scale: 0.9 }}
//                   >
//                     <FiRefreshCw className={refreshing ? 'animate-spin' : ''} />
//                   </motion.button>
//                 </div>
//               </div>
              
//               <div className="max-h-96 overflow-auto">
//                 <div className="space-y-2">
//                   {participants.map((participant, index) => (
//                     <motion.div
//                       key={participant.id}
//                       initial={{ opacity: 0, x: -20 }}
//                       animate={{ opacity: 1, x: 0 }}
//                       transition={{ delay: index * 0.05 }}
//                       className={`p-3 rounded-2xl border backdrop-blur-sm transition-all duration-300 ${
//                         participant.attendance 
//                           ? 'bg-green-500/10 border-green-400/30 text-green-200' 
//                           : 'bg-white/5 border-white/20 text-white/70'
//                       }`}
//                     >
//                       <div className="flex items-center justify-between">
//                         <div>
//                           <div className="font-semibold">{participant.name}</div>
//                           <div className="text-sm opacity-70">{participant.email}</div>
//                         </div>
//                         <div className="text-right">
//                           <div className="flex items-center space-x-2">
//                             {participant.attendance ? (
//                               <>
//                                 <FiCheck className="text-green-400" />
//                                 <span className="text-sm">
//                                   {participant.checkInTime ? new Date(participant.checkInTime).toLocaleTimeString() : 'Checked In'}
//                                 </span>
//                               </>
//                             ) : (
//                               <span className="text-sm text-white/40">Not checked in</span>
//                             )}
//                           </div>
//                         </div>
//                       </div>
//                     </motion.div>
//                   ))}
//                   {participants.length === 0 && (
//                     <div className="text-center text-white/40 py-8">
//                       No participants registered yet
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </Modal>
//     );
//   };

//   // =================== PAGE COMPONENTS ===================
//   const BrowseEventsPage = () => {
//     return (
//       <motion.div
//         className="min-h-screen pt-24 pb-16 px-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//               Discover Amazing Events
//             </h1>
//             <p className="text-xl text-white/60 max-w-2xl mx-auto">
//               Find and register for events that match your interests
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {events.map((event, index) => (
//               <motion.div
//                 key={event.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <EventCard
//                   event={event}
//                   onRegister={(event) => setShowModal({ type: 'register', data: event })}
//                 />
//               </motion.div>
//             ))}
//           </div>

//           {events.length === 0 && (
//             <motion.div
//               className="text-center text-white/60 py-16"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             >
//               <FiCalendar size={64} className="mx-auto mb-4 opacity-50" />
//               <p className="text-xl">No events available at the moment</p>
//               <p>Check back later for exciting new events!</p>
//             </motion.div>
//           )}
//         </div>
//       </motion.div>
//     );
//   };

//   const OrganisePage = () => {
//     return (
//       <motion.div
//         className="min-h-screen pt-24 pb-16 px-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             className="flex justify-between items-center mb-12"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <div>
//               <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//                 Event Management
//               </h1>
//               <p className="text-xl text-white/60">
//                 Create and manage your events with ease
//               </p>
//             </div>
//             <motion.button
//               onClick={() => setShowModal({ type: 'createEvent' })}
//               className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold text-lg shadow-2xl flex items-center space-x-2"
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//             >
//               <FiPlus />
//               <span>Create New Event</span>
//             </motion.button>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {organiserEvents.map((event, index) => (
//               <motion.div
//                 key={event.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//               >
//                 <EventCard
//                   event={event}
//                   showRegisterButton={false}
//                   onEventClick={(event) => {
//                     setSelectedEvent(event);
//                     setShowModal({ type: 'dashboard', data: event });
//                   }}
//                 />
//               </motion.div>
//             ))}
//           </div>

//           {organiserEvents.length === 0 && (
//             <motion.div
//               className="text-center text-white/60 py-16"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             >
//               <FiPlus size={64} className="mx-auto mb-4 opacity-50" />
//               <p className="text-xl mb-4">You haven't created any events yet</p>
//               <motion.button
//                 onClick={() => setShowModal({ type: 'createEvent' })}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Create Your First Event
//               </motion.button>
//             </motion.div>
//           )}
//         </div>
//       </motion.div>
//     );
//   };

//   const MyRegistrationsPage = () => {
//     return (
//       <motion.div
//         className="min-h-screen pt-24 pb-16 px-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="max-w-7xl mx-auto">
//           <motion.div
//             className="text-center mb-16"
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//               My Registrations
//             </h1>
//             <p className="text-xl text-white/60">
//               View all your registered events
//             </p>
//           </motion.div>

//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {userRegistrations.map((registration, index) => (
//               <motion.div
//                 key={registration.eventId}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.1 }}
//                 className="backdrop-blur-lg bg-white/10 rounded-3xl p-6 border border-white/20 hover:border-white/40 transition-all duration-300"
//                 whileHover={{ scale: 1.02 }}
//               >
//                 <div className="flex justify-between items-start mb-4">
//                   <h3 className="text-xl font-bold text-white">{registration.eventName}</h3>
//                   <motion.div 
//                     className="w-3 h-3 rounded-full bg-gradient-to-r from-green-400 to-blue-400"
//                     animate={{ scale: [1, 1.2, 1] }}
//                     transition={{ duration: 2, repeat: Infinity }}
//                   />
//                 </div>
                
//                 <div className="space-y-3 mb-6">
//                   <div className="flex items-center text-white/70">
//                     <FiCalendar className="mr-2" />
//                     <span>{new Date(registration.eventDate).toLocaleDateString()}</span>
//                   </div>
//                   <div className="flex items-center text-white/70">
//                     <FiClock className="mr-2" />
//                     <span>Registered: {new Date(registration.regDate).toLocaleDateString()}</span>
//                   </div>
//                   {registration.remarks && (
//                     <div className="flex items-start text-white/60">
//                       <FiInfo className="mr-2 mt-1 flex-shrink-0" />
//                       <span className="text-sm">{registration.remarks}</span>
//                     </div>
//                   )}
//                 </div>

//                 <motion.button
//                   onClick={async () => {
//                     try {
//                       const data = await apiCall('getEventDetails', {
//                         method: 'POST',
//                         body: JSON.stringify({ eventId: registration.eventId }),
//                       });
//                       setShowModal({ type: 'eventDetails', data: data.event });
//                     } catch (error) {
//                       console.error('Failed to fetch event details:', error);
//                     }
//                   }}
//                   className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full text-white font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                 >
//                   View Details
//                 </motion.button>
//               </motion.div>
//             ))}
//           </div>

//           {userRegistrations.length === 0 && (
//             <motion.div
//               className="text-center text-white/60 py-16"
//               initial={{ opacity: 0 }}
//               animate={{ opacity: 1 }}
//             >
//               <FiUser size={64} className="mx-auto mb-4 opacity-50" />
//               <p className="text-xl mb-4">You haven't registered for any events yet</p>
//               <motion.button
//                 onClick={() => setCurrentPage('browse')}
//                 className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-semibold"
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//               >
//                 Browse Events
//               </motion.button>
//             </motion.div>
//           )}
//         </div>
//       </motion.div>
//     );
//   };

//   const AboutPage = () => {
//     return (
//       <motion.div
//         className="min-h-screen pt-24 pb-16 px-6"
//         initial={{ opacity: 0 }}
//         animate={{ opacity: 1 }}
//       >
//         <div className="max-w-4xl mx-auto text-center">
//           <motion.div
//             initial={{ y: 30, opacity: 0 }}
//             animate={{ y: 0, opacity: 1 }}
//           >
//             <h1 className="text-5xl font-bold text-white mb-8 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
//               About NextPass
//             </h1>
//             <div className="backdrop-blur-lg bg-white/10 rounded-3xl p-12 border border-white/20 text-white/70 text-lg leading-relaxed">
//               <p className="mb-6">
//                 NextPass is the next generation of event management, bringing together cutting-edge technology 
//                 with beautiful design to create seamless experiences for both organisers and attendees.
//               </p>
//               <p className="mb-6">
//                 With features like real-time QR code check-ins, live attendance tracking, and automated 
//                 email notifications, we're revolutionizing how events are managed and experienced.
//               </p>
//               <p>
//                 Built with love using React, Framer Motion, and modern web technologies to deliver 
//                 the smoothest, most engaging event management platform available.
//               </p>
//             </div>
//           </motion.div>
//         </div>
//       </motion.div>
//     );
//   };

//   // =================== TOAST NOTIFICATION ===================
//   const ToastNotification = () => {
//     if (!toast) return null;

//     const bgColor = {
//       success: 'from-green-500 to-emerald-500',
//       error: 'from-red-500 to-rose-500',
//       warning: 'from-yellow-500 to-orange-500'
//     }[toast.type] || 'from-blue-500 to-cyan-500';

//     return (
//       <motion.div
//         className="fixed top-24 right-6 z-50"
//         initial={{ x: 400, opacity: 0 }}
//         animate={{ x: 0, opacity: 1 }}
//         exit={{ x: 400, opacity: 0 }}
//       >
//         <div className={`px-6 py-4 bg-gradient-to-r ${bgColor} rounded-2xl text-white font-semibold shadow-2xl border border-white/20 backdrop-blur-lg max-w-sm`}>
//           <div className="flex items-center space-x-2">
//             <FiCheck size={20} />
//             <span>{toast.message}</span>
//           </div>
//         </div>
//       </motion.div>
//     );
//   };

//   // =================== BACKGROUND GRADIENT ===================
//   const BackgroundGradient = () => (
//     <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//       <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-pink-500/10 to-cyan-500/10" />
//       <div className="absolute inset-0">
//         {[...Array(3)].map((_, i) => (
//           <motion.div
//             key={i}
//             className="absolute rounded-full mix-blend-multiply filter blur-xl opacity-30"
//             style={{
//               background: `radial-gradient(circle, ${['#8B5CF6', '#EC4899', '#06B6D4'][i]} 0%, transparent 70%)`,
//               width: '40vw',
//               height: '40vw',
//               left: `${[20, 60, 40][i]}%`,
//               top: `${[20, 60, 80][i]}%`,
//             }}
//             animate={{
//               x: [0, 100, 0],
//               y: [0, -100, 0],
//             }}
//             transition={{
//               duration: 20 + i * 5,
//               repeat: Infinity,
//               ease: "linear",
//             }}
//           />
//         ))}
//       </div>
//     </div>
//   );

//   // =================== MAIN RENDER ===================
//   return (
//     <div className="min-h-screen relative overflow-x-hidden">
//       <BackgroundGradient />
//       <ParticleBackground />
      
//       <Navbar />
      
//       <AnimatePresence mode="wait">
//         {currentPage === 'home' && <HeroSection key="home" />}
//         {currentPage === 'browse' && <BrowseEventsPage key="browse" />}
//         {currentPage === 'organise' && <OrganisePage key="organise" />}
//         {currentPage === 'registrations' && <MyRegistrationsPage key="registrations" />}
//         {currentPage === 'about' && <AboutPage key="about" />}
//       </AnimatePresence>

//       {/* Modals */}
//       {showModal?.type === 'register' && (
//         <Modal
//           isOpen={true}
//           onClose={() => setShowModal(null)}
//           title="Register for Event"
//         >
//           <RegistrationForm
//             event={showModal.data}
//             onSubmit={handleRegisterParticipant}
//             onClose={() => setShowModal(null)}
//           />
//         </Modal>
//       )}

//       {showModal?.type === 'createEvent' && (
//         <Modal
//           isOpen={true}
//           onClose={() => setShowModal(null)}
//           title="Create New Event"
//         >
//           <EventForm
//             onSubmit={handleCreateEvent}
//             onClose={() => setShowModal(null)}
//           />
//         </Modal>
//       )}

//       {showModal?.type === 'updateEvent' && (
//         <Modal
//           isOpen={true}
//           onClose={() => setShowModal(null)}
//           title="Update Event"
//         >
//           <EventForm
//             event={showModal.data}
//             onSubmit={handleUpdateEvent}
//             onClose={() => setShowModal(null)}
//           />
//         </Modal>
//       )}

//       {showModal?.type === 'dashboard' && (
//         <EventDashboard
//           event={showModal.data}
//           onClose={() => setShowModal(null)}
//         />
//       )}

//       {showModal?.type === 'qrScanner' && (
//         <QRScannerModal
//           eventId={showModal.data}
//           onClose={() => setShowModal(null)}
//         />
//       )}

//       {showModal?.type === 'eventDetails' && (
//         <Modal
//           isOpen={true}
//           onClose={() => setShowModal(null)}
//           title="Event Details"
//         >
//           <div className="space-y-4 text-white">
//             <h3 className="text-2xl font-bold">{showModal.data.eventName}</h3>
//             <div className="space-y-2 text-white/70">
//               <div><strong>Date:</strong> {new Date(showModal.data.eventDate).toLocaleString()}</div>
//               <div><strong>Organiser:</strong> {showModal.data.organiserEmail}</div>
//               <div><strong>Registration Deadline:</strong> {new Date(showModal.data.regDeadline).toLocaleString()}</div>
//               {showModal.data.remarks && (
//                 <div><strong>Description:</strong> {showModal.data.remarks}</div>
//               )}
//             </div>
//           </div>
//         </Modal>
//       )}

//       <ToastNotification />

//     </div>
//   );
// }

// Version 1 : 



/*
 * NextPass - Event Attendance & Registration Frontend
 * 
 * DEPENDENCIES:
 * npm i framer-motion @zxing/browser react-icons
 * npm i tailwindcss postcss autoprefixer (if Tailwind not already configured)
 * 
 * USAGE:
 * Place this file at: app/page.jsx or app/frontend.jsx
 * Import and use: <NextPassFrontend userEmail="user@example.com" />
 * 
 * CONFIGURATION:
 * - Replace HERO_VIDEO_URL with your actual video URL
 * - Update API_BASE_URL if backend is not on same domain
 * - Customize colors in THEME object if needed
 */
"use client";
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { 
  FiCalendar, FiClock, FiUsers, FiCamera, FiDownload, 
  FiEdit, FiEye, FiPlus, FiRefreshCw, FiX, FiCheck,
  FiMail, FiUser, FiMapPin, FiStar, FiActivity
} from 'react-icons/fi';

// ============ CONFIGURATION ============
const API_BASE_URL = ''; // Same origin
const HERO_VIDEO_URL = 'https://player.vimeo.com/external/371433846.sd.mp4?s=236da2f3c0fd273d2c6d9a064f3ae35579b2bbdf&profile_id=139&oauth2_token_id=57447761'; // TODO: Replace with your video
const THEME = {
  primary: '#6C63FF',
  secondary: '#00C2FF',
  accent: '#FF6B9D',
  glass: 'rgba(255, 255, 255, 0.1)',
  glassHover: 'rgba(255, 255, 255, 0.2)',
};

// Particle animation component
function FloatingParticles() {
    // 1. Start with an empty array of particles.
    const [particles, setParticles] = useState([]);

    // 2. useEffect runs only on the client, after the component mounts.
    useEffect(() => {
        const newParticles = Array.from({ length: 12 }).map(() => ({
            size: 10 + Math.random() * 20,
            x: Math.random() * 100,
            y: Math.random() * 100,
            duration: 5 + Math.random() * 10,
        }));
        setParticles(newParticles);
    }, []); // The empty dependency array [] ensures this runs only once.

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map((p, i) => (
                <motion.div
                    key={i}
                    className="absolute rounded-full bg-gradient-to-r from-purple-400 to-pink-400 opacity-20"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                    }}
                    animate={{
                        y: [0, Math.random() * 20 - 10, 0],
                        x: [0, Math.random() * 20 - 10, 0],
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    );
}

// Animated background gradients
const AnimatedBackground = () => (
  <div className="fixed inset-0 -z-10">
    <motion.div
      className="absolute inset-0 bg-gradient-to-br from-purple-400 via-pink-500 to-cyan-500"
      animate={{
        background: [
          "linear-gradient(to bottom right, #9f7aea, #ec4899, #06b6d4)",
          "linear-gradient(to bottom right, #06b6d4, #9f7aea, #ec4899)",
          "linear-gradient(to bottom right, #ec4899, #06b6d4, #9f7aea)",
        ],
      }}
      transition={{ duration: 8, repeat: Infinity }}
    />
    <div className="absolute inset-0 bg-black bg-opacity-20" />
  </div>
);

// Glass card component
const GlassCard = ({ children, className = "", hover = true, onClick, ...props }) => (
  <motion.div
    className={`backdrop-blur-lg bg-white bg-opacity-10 border border-white border-opacity-20 rounded-2xl shadow-2xl ${className}`}
    whileHover={hover ? { scale: 1.03, y: -5, boxShadow: "0 25px 50px rgba(0,0,0,0.3)" } : {}}
    whileTap={onClick ? { scale: 0.98 } : {}}
    onClick={onClick}
    {...props}
  >
    {children}
  </motion.div>
);

// Loading spinner
const LoadingSpinner = ({ size = "w-5 h-5" }) => (
  <motion.div
    className={`${size} border-2 border-white border-t-transparent rounded-full`}
    animate={{ rotate: 360 }}
    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
  />
);

// Toast notification
const Toast = ({ message, type, onClose }) => (
  <motion.div
    initial={{ opacity: 0, x: 300 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 300 }}
    className={`fixed top-4 right-4 z-50 p-4 rounded-lg backdrop-blur-md border ${
      type === 'success' ? 'bg-green-500 bg-opacity-20 border-green-400' : 'bg-red-500 bg-opacity-20 border-red-400'
    }`}
  >
    <div className="flex items-center space-x-2">
      {type === 'success' ? <FiCheck className="text-green-300" /> : <FiX className="text-red-300" />}
      <span className="text-white">{message}</span>
      <button onClick={onClose} className="text-white hover:text-gray-300">
        <FiX size={16} />
      </button>
    </div>
  </motion.div>
);

// Main NextPass Frontend Component
export default function NextPassFrontend({ userEmail }) {
  const [currentPage, setCurrentPage] = useState('home');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [events, setEvents] = useState([]);
  const [myEvents, setMyEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [formData, setFormData] = useState({});
  const [qrScanning, setQrScanning] = useState(false);
  const [liveRefresh, setLiveRefresh] = useState(false);
  
  const videoRef = useRef(null);
  const codeReader = useRef(new BrowserMultiFormatReader());

  // Show toast notification
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
        headers: { 'Content-Type': 'application/json' },
        ...options,
      });
      
      if (endpoint === '/exportAttendance') {
        if (response.headers.get('Content-Type')?.includes('spreadsheet')) {
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `${selectedEvent.id}_attendance.xlsx`;
          a.click();
          URL.revokeObjectURL(url);
          showToast('Attendance exported successfully!');
          return;
        }
      }
      
      const data = await response.json();
      if (!data.success) throw new Error(data.error || data.message);
      return data;
    } catch (error) {
      showToast(error.message || 'An error occurred', 'error');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch available events
  const fetchEvents = async () => {
    try {
      const data = await apiCall('/getAvailableEvents');
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  // Fetch organizer events
  const fetchMyEvents = async () => {
    if (!userEmail) return;
    try {
      const data = await apiCall('/getEventsByOrganiser', {
        method: 'POST',
        body: JSON.stringify({ organiserEmail: userEmail }),
      });
      setMyEvents(data.events || []);
    } catch (error) {
      console.error('Failed to fetch organizer events:', error);
    }
  };

  // Fetch user registrations
  const fetchRegistrations = async () => {
    if (!userEmail) return;
    try {
      const data = await apiCall('/getUserRegistrations', {
        method: 'POST',
        body: JSON.stringify({ userEmail }),
      });
      setRegistrations(data.registrations || []);
    } catch (error) {
      console.error('Failed to fetch registrations:', error);
    }
  };

  // Fetch participants for an event
  const fetchParticipants = async (eventId) => {
    try {
      const data = await apiCall(`/getParticipants?eventId=${eventId}`);
      setParticipants(data.participants || []);
    } catch (error) {
      console.error('Failed to fetch participants:', error);
    }
  };

  // Create event
  const createEvent = async (eventData) => {
    try {
      await apiCall('/createEvent', {
        method: 'POST',
        body: JSON.stringify({
          organiserEmail: userEmail,
          eventData,
        }),
      });
      showToast('Event created successfully!');
      setShowModal(false);
      fetchMyEvents();
    } catch (error) {
      console.error('Failed to create event:', error);
    }
  };

  // Register for event
  const registerForEvent = async (eventId, participantData) => {
    try {
      await apiCall('/registerParticipant', {
        method: 'POST',
        body: JSON.stringify({ eventId, participantData }),
      });
      showToast('Registration successful!');
      setShowModal(false);
      fetchEvents();
    } catch (error) {
      console.error('Failed to register:', error);
    }
  };

  // Update event
  const updateEvent = async (eventId, updatedFields) => {
    try {
      await apiCall('/updateEvent', {
        method: 'POST',
        body: JSON.stringify({ eventId, updatedFields }),
      });
      showToast('Event updated successfully!');
      setShowModal(false);
      fetchMyEvents();
    } catch (error) {
      console.error('Failed to update event:', error);
    }
  };

  // Check in participant
  const checkInParticipant = async (eventId, participantId) => {
    try {
      const data = await apiCall('/checkIn', {
        method: 'POST',
        body: JSON.stringify({ eventId, participantId }),
      });
      if (data.success) {
        showToast(`${data.participant.name} checked in successfully!`);
        fetchParticipants(eventId);
      } else {
        showToast(data.message, 'error');
      }
    } catch (error) {
      console.error('Failed to check in:', error);
    }
  };

  // Start QR scanning
  const startQRScanning = async () => {
    setQrScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        
        codeReader.current.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            const participantId = result.getText();
            checkInParticipant(selectedEvent.id, participantId);
            stopQRScanning();
          }
        });
      }
    } catch (error) {
      showToast('Camera access denied', 'error');
      setQrScanning(false);
    }
  };

  // Stop QR scanning
  const stopQRScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    codeReader.current.reset();
    setQrScanning(false);
  };

  // Auto refresh for live attendance
  useEffect(() => {
    let interval;
    if (liveRefresh && selectedEvent && currentPage === 'dashboard') {
      interval = setInterval(() => {
        fetchParticipants(selectedEvent.id);
      }, 10000);
    }
    return () => clearInterval(interval);
  }, [liveRefresh, selectedEvent, currentPage]);

  // Load data based on current page
  useEffect(() => {
    switch (currentPage) {
      case 'browse':
        fetchEvents();
        break;
      case 'organize':
        fetchMyEvents();
        break;
      case 'registrations':
        fetchRegistrations();
        break;
    }
  }, [currentPage, userEmail]);

  // Auth check
  if (!userEmail) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <AnimatedBackground />
        <GlassCard className="p-8 text-center">
          <motion.h2 
            className="text-2xl font-bold text-white mb-4"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            Please sign in with Google first.
          </motion.h2>
        </GlassCard>
      </div>
    );
  }

  // Navigation items
  const navItems = [
    { id: 'home', label: 'Home', icon: FiStar },
    { id: 'browse', label: 'Browse Events', icon: FiCalendar },
    { id: 'organize', label: 'Organize', icon: FiPlus },
    { id: 'registrations', label: 'My Registrations', icon: FiUser },
    { id: 'about', label: 'About Us', icon: FiActivity },
  ];

  // ============ RENDER METHODS ============
  
  // Navbar
  const renderNavbar = () => (
    <motion.nav 
      className="fixed top-0 w-full z-40 backdrop-blur-lg bg-white bg-opacity-10 border-b border-white border-opacity-20"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <motion.div 
            className="flex items-center space-x-2"
            whileHover={{ scale: 1.05 }}
          >
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg" />
            <span className="text-xl font-bold text-white">NextPass</span>
          </motion.div>
          
          <div className="hidden md:flex space-x-1">
            {navItems.map((item) => (
              <motion.button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === item.id 
                    ? 'bg-white bg-opacity-20 text-white' 
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <item.icon className="inline mr-2" size={16} />
                {item.label}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
    </motion.nav>
  );

  // Hero Section
  const renderHero = () => (
    <motion.section 
      className="relative h-screen flex items-center justify-center overflow-hidden"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <video
        autoPlay
        loop
        muted
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        src={HERO_VIDEO_URL}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-purple-900 to-pink-900 opacity-50" />
      <FloatingParticles />
      
      <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
        <motion.h1 
          className="text-6xl md:text-8xl font-bold text-white mb-6 leading-tight"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
        >
          Next<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Pass</span>
        </motion.h1>
        
        <motion.p 
          className="text-xl md:text-2xl text-gray-200 mb-8 leading-relaxed"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          Seamless event registration and attendance management
          <br />
          <span className="text-purple-300">Powered by innovation, designed for perfection</span>
        </motion.p>
        
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          <motion.button
            onClick={() => setCurrentPage('browse')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full text-lg shadow-2xl"
            whileHover={{ scale: 1.05, boxShadow: "0 20px 40px rgba(108, 99, 255, 0.4)" }}
            whileTap={{ scale: 0.95 }}
          >
            <FiCalendar className="inline mr-2" />
            Browse Events
          </motion.button>
          
          <motion.button
            onClick={() => setCurrentPage('organize')}
            className="px-8 py-4 border-2 border-white text-white font-bold rounded-full text-lg backdrop-blur-md bg-white bg-opacity-10"
            whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="inline mr-2" />
            Organize Event
          </motion.button>
        </motion.div>
      </div>
    </motion.section>
  );

  // Browse Events Page
  const renderBrowseEvents = () => (
    <motion.div 
      className="min-h-screen pt-24 pb-12"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl font-bold text-white text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Discover Amazing Events
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard 
                className="p-6 cursor-pointer h-full"
                onClick={() => {
                  setSelectedEvent(event);
                  setModalType('register');
                  setShowModal(true);
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-white" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300">Event Date</div>
                    <div className="text-sm text-white font-semibold">
                      {new Date(event.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{event.eventName}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.remarks}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <FiClock className="inline mr-1" />
                    Register by: {new Date(event.regDeadline).toLocaleDateString()}
                  </div>
                  <motion.div
                    className="text-purple-300 font-semibold"
                    whileHover={{ scale: 1.1 }}
                  >
                    Register →
                  </motion.div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Organize Page
  const renderOrganize = () => (
    <motion.div 
      className="min-h-screen pt-24 pb-12"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-white"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Your Events
          </motion.h1>
          
          <motion.button
            onClick={() => {
              setModalType('create');
              setShowModal(true);
              setFormData({});
            }}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-full shadow-2xl"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiPlus className="inline mr-2" />
            Create Event
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map((event, index) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                    <FiCalendar className="text-white" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300">Status</div>
                    <div className="text-sm text-green-400 font-semibold">Active</div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{event.eventName}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{event.remarks}</p>
                
                <div className="space-y-2">
                  <motion.button
                    onClick={() => {
                      setSelectedEvent(event);
                      setCurrentPage('dashboard');
                      fetchParticipants(event.id);
                    }}
                    className="w-full px-4 py-2 bg-purple-600 bg-opacity-50 text-white rounded-lg text-sm font-medium"
                    whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.7)" }}
                  >
                    <FiEye className="inline mr-2" />
                    Open Dashboard
                  </motion.button>
                  
                  <div className="flex space-x-2">
                    <motion.button
                      onClick={() => {
                        setSelectedEvent(event);
                        setModalType('update');
                        setShowModal(true);
                        setFormData(event);
                      }}
                      className="flex-1 px-3 py-2 bg-blue-600 bg-opacity-50 text-white rounded-lg text-xs"
                      whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.7)" }}
                    >
                      <FiEdit className="inline mr-1" />
                      Update
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        setSelectedEvent(event);
                        setQrScanning(true);
                      }}
                      className="flex-1 px-3 py-2 bg-green-600 bg-opacity-50 text-white rounded-lg text-xs"
                      whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.7)" }}
                    >
                      <FiCamera className="inline mr-1" />
                      Check-In
                    </motion.button>
                    
                    <motion.button
                      onClick={() => {
                        apiCall('/exportAttendance', {
                          method: 'POST',
                          body: JSON.stringify({ eventId: event.id }),
                        });
                      }}
                      className="flex-1 px-3 py-2 bg-orange-600 bg-opacity-50 text-white rounded-lg text-xs"
                      whileHover={{ backgroundColor: "rgba(234, 88, 12, 0.7)" }}
                    >
                      <FiDownload className="inline mr-1" />
                      Export
                    </motion.button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Dashboard Page
  const renderDashboard = () => (
    <motion.div 
      className="min-h-screen pt-24 pb-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            className="text-4xl font-bold text-white"
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
          >
            Event Dashboard
          </motion.h1>
          
          <motion.button
            onClick={() => setCurrentPage('organize')}
            className="px-4 py-2 bg-gray-600 bg-opacity-50 text-white rounded-lg"
            whileHover={{ backgroundColor: "rgba(75, 85, 99, 0.7)" }}
          >
            ← Back
          </motion.button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Event Details */}
          <div className="lg:col-span-1">
            <GlassCard className="p-6">
              <h2 className="text-2xl font-bold text-white mb-4">{selectedEvent?.eventName}</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center text-gray-300">
                  <FiCalendar className="mr-2" />
                  {new Date(selectedEvent?.eventDate).toLocaleString()}
                </div>
                <div className="flex items-center text-gray-300">
                  <FiClock className="mr-2" />
                  Reg. Deadline: {new Date(selectedEvent?.regDeadline).toLocaleString()}
                </div>
                <div className="flex items-center text-gray-300">
                  <FiUsers className="mr-2" />
                  {participants.length} Registered
                </div>
                <div className="flex items-center text-gray-300">
                  <FiCheck className="mr-2" />
                  {participants.filter(p => p.attendance).length} Checked In
                </div>
              </div>
              
              <div className="mt-6 space-y-2">
                <motion.button
                  onClick={() => {
                    setModalType('update');
                    setShowModal(true);
                    setFormData(selectedEvent);
                  }}
                  className="w-full px-4 py-2 bg-blue-600 bg-opacity-50 text-white rounded-lg"
                  whileHover={{ backgroundColor: "rgba(37, 99, 235, 0.7)" }}
                >
                  <FiEdit className="inline mr-2" />
                  Update Event
                </motion.button>
                
                <motion.button
                  onClick={() => setQrScanning(true)}
                  className="w-full px-4 py-2 bg-green-600 bg-opacity-50 text-white rounded-lg"
                  whileHover={{ backgroundColor: "rgba(34, 197, 94, 0.7)" }}
                >
                  <FiCamera className="inline mr-2" />
                  Start Check-In
                </motion.button>
              </div>
            </GlassCard>
          </div>
          
          {/* Attendance Table */}
          <div className="lg:col-span-2">
            <GlassCard className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-white">Attendance</h3>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => fetchParticipants(selectedEvent.id)}
                    className="px-3 py-1 bg-purple-600 bg-opacity-50 text-white rounded text-sm"
                    whileHover={{ backgroundColor: "rgba(147, 51, 234, 0.7)" }}
                  >
                    <FiRefreshCw className="inline mr-1" size={14} />
                    Refresh
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setLiveRefresh(!liveRefresh)}
                    className={`px-3 py-1 rounded text-sm ${
                      liveRefresh 
                        ? 'bg-green-600 bg-opacity-50 text-white' 
                        : 'bg-gray-600 bg-opacity-50 text-gray-300'
                    }`}
                    whileHover={{ backgroundColor: liveRefresh ? "rgba(34, 197, 94, 0.7)" : "rgba(75, 85, 99, 0.7)" }}
                  >
                    Live {liveRefresh ? 'ON' : 'OFF'}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => {
                      apiCall('/exportAttendance', {
                        method: 'POST',
                        body: JSON.stringify({ eventId: selectedEvent.id }),
                      });
                    }}
                    className="px-3 py-1 bg-orange-600 bg-opacity-50 text-white rounded text-sm"
                    whileHover={{ backgroundColor: "rgba(234, 88, 12, 0.7)" }}
                  >
                    <FiDownload className="inline mr-1" size={14} />
                    Export
                  </motion.button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white border-opacity-20">
                      <th className="text-left text-gray-300 py-2">Name</th>
                      <th className="text-left text-gray-300 py-2">Email</th>
                      <th className="text-left text-gray-300 py-2">Status</th>
                      <th className="text-left text-gray-300 py-2">Check-in Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant, index) => (
                      <motion.tr 
                        key={participant.id}
                        className="border-b border-white border-opacity-10"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="py-3 text-white">{participant.name}</td>
                        <td className="py-3 text-gray-300">{participant.email}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            participant.attendance 
                              ? 'bg-green-500 bg-opacity-30 text-green-300' 
                              : 'bg-yellow-500 bg-opacity-30 text-yellow-300'
                          }`}>
                            {participant.attendance ? 'Checked In' : 'Registered'}
                          </span>
                        </td>
                        <td className="py-3 text-gray-300">
                          {participant.checkInTime 
                            ? new Date(participant.checkInTime).toLocaleString()
                            : '-'
                          }
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    </motion.div>
  );

  // My Registrations Page
  const renderRegistrations = () => (
    <motion.div 
      className="min-h-screen pt-24 pb-12"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.h1 
          className="text-4xl font-bold text-white text-center mb-12"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          My Registrations
        </motion.h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registrations.map((registration, index) => (
            <motion.div
              key={registration.eventId}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-full flex items-center justify-center">
                    <FiCheck className="text-white" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-300">Registered</div>
                    <div className="text-sm text-white font-semibold">
                      {new Date(registration.regDate?.seconds * 1000 || registration.regDate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-white mb-2">{registration.eventName}</h3>
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{registration.remarks}</p>
                
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-400">
                    <FiCalendar className="inline mr-1" />
                    Event: {new Date(registration.eventDate?.seconds * 1000 || registration.eventDate).toLocaleDateString()}
                  </div>
                  <motion.button
                    onClick={() => {
                      // View event details
                      apiCall('/getEventDetails', {
                        method: 'POST',
                        body: JSON.stringify({ eventId: registration.eventId }),
                      }).then(data => {
                        setSelectedEvent(data.event);
                        setModalType('eventDetails');
                        setShowModal(true);
                      });
                    }}
                    className="text-purple-300 text-xs font-semibold hover:text-purple-200"
                    whileHover={{ scale: 1.05 }}
                  >
                    View Details →
                  </motion.button>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // About Page
  const renderAbout = () => (
    <motion.div 
      className="min-h-screen pt-24 pb-12 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="max-w-2xl mx-4 p-8 text-center">
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-white mb-6">About NextPass</h1>
          <p className="text-gray-300 text-lg leading-relaxed mb-6">
            NextPass is the future of event management - seamless, intuitive, and powerful. 
            We're revolutionizing how events are organized and attended with cutting-edge technology 
            and beautiful user experiences.
          </p>
          <motion.div
            className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-purple-300 italic">More content coming soon...</p>
        </motion.div>
      </GlassCard>
    </motion.div>
  );

  // Modals
  const renderModals = () => (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <motion.div
            className="max-w-md w-full"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
          >
            <GlassCard className="p-6" hover={false}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-white">
                  {modalType === 'create' && 'Create Event'}
                  {modalType === 'register' && 'Register for Event'}
                  {modalType === 'update' && 'Update Event'}
                  {modalType === 'eventDetails' && 'Event Details'}
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <FiX size={24} />
                </button>
              </div>

              {(modalType === 'create' || modalType === 'update') && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const eventData = {
                    eventName: formData.eventName,
                    eventDate: new Date(formData.eventDate).toISOString(),
                    regDeadline: new Date(formData.regDeadline).toISOString(),
                    remarks: formData.remarks || '',
                  };
                  
                  if (modalType === 'create') {
                    createEvent(eventData);
                  } else {
                    updateEvent(selectedEvent.id, eventData);
                  }
                }}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.eventName || ''}
                        onChange={(e) => setFormData({...formData, eventName: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        placeholder="Enter event name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Event Date & Time
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.eventDate?.slice(0, 16) || ''}
                        onChange={(e) => setFormData({...formData, eventDate: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Registration Deadline
                      </label>
                      <input
                        type="datetime-local"
                        required
                        value={formData.regDeadline?.slice(0, 16) || ''}
                        onChange={(e) => setFormData({...formData, regDeadline: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:border-purple-400"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Remarks (Optional)
                      </label>
                      <textarea
                        rows="3"
                        value={formData.remarks || ''}
                        onChange={(e) => setFormData({...formData, remarks: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        placeholder="Additional information about the event"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-400 text-gray-300 rounded-lg hover:bg-gray-600 hover:bg-opacity-20"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <LoadingSpinner /> : (modalType === 'create' ? 'Create Event' : 'Update Event')}
                    </motion.button>
                  </div>
                </form>
              )}

              {modalType === 'register' && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  registerForEvent(selectedEvent.id, {
                    name: formData.name,
                    email: formData.email,
                  });
                }}>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedEvent?.eventName}</h3>
                    <p className="text-gray-300 text-sm">{selectedEvent?.remarks}</p>
                    <div className="flex items-center text-gray-400 text-sm mt-2">
                      <FiCalendar className="mr-1" />
                      {new Date(selectedEvent?.eventDate).toLocaleString()}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name || ''}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        placeholder="Enter your full name"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email || userEmail}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-2 bg-white bg-opacity-10 border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                        placeholder="Enter your email"
                      />
                    </div>
                  </div>
                  
                  <div className="flex space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="flex-1 px-4 py-2 border border-gray-400 text-gray-300 rounded-lg hover:bg-gray-600 hover:bg-opacity-20"
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium flex items-center justify-center"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {loading ? <LoadingSpinner /> : 'Register Now'}
                    </motion.button>
                  </div>
                </form>
              )}

              {modalType === 'eventDetails' && selectedEvent && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{selectedEvent.eventName}</h3>
                    <p className="text-gray-300">{selectedEvent.remarks}</p>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center text-gray-300">
                      <FiCalendar className="mr-2" />
                      Event Date: {new Date(selectedEvent.eventDate).toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <FiClock className="mr-2" />
                      Registration Deadline: {new Date(selectedEvent.regDeadline).toLocaleString()}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <FiMail className="mr-2" />
                      Organizer: {selectedEvent.organiserEmail}
                    </div>
                    <div className="flex items-center text-gray-300">
                      <FiUsers className="mr-2" />
                      Participants: {selectedEvent.participants?.length || 0}
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setShowModal(false)}
                    className="w-full px-4 py-2 bg-purple-600 bg-opacity-50 text-white rounded-lg mt-4"
                  >
                    Close
                  </button>
                </div>
              )}
            </GlassCard>
          </motion.div>
        </motion.div>
      )}

      {/* QR Scanner Modal */}
      {qrScanning && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="max-w-md w-full mx-4">
            <GlassCard className="p-6" hover={false}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-white">QR Code Scanner</h2>
                <button onClick={stopQRScanning} className="text-gray-400 hover:text-white">
                  <FiX size={24} />
                </button>
              </div>
              
              <div className="relative">
                <video 
                  ref={videoRef} 
                  className="w-full h-64 bg-gray-800 rounded-lg object-cover"
                  autoPlay 
                  playsInline 
                />
                <div className="absolute inset-0 border-2 border-dashed border-purple-400 rounded-lg flex items-center justify-center pointer-events-none">
                  <div className="w-32 h-32 border-2 border-purple-400 rounded-lg"></div>
                </div>
              </div>
              
              <p className="text-center text-gray-300 text-sm mt-4">
                Position the QR code within the frame to check in the participant
              </p>
              
              <div className="flex space-x-3 mt-6">
                <button
                  onClick={stopQRScanning}
                  className="flex-1 px-4 py-2 border border-gray-400 text-gray-300 rounded-lg"
                >
                  Cancel
                </button>
                <motion.button
                  onClick={startQRScanning}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg"
                  whileHover={{ scale: 1.02 }}
                >
                  <FiCamera className="inline mr-2" />
                  Start Camera
                </motion.button>
              </div>
            </GlassCard>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ============ MAIN RENDER ============
  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground />
      {renderNavbar()}
      
      <AnimatePresence mode="wait">
        {currentPage === 'home' && <div key="home">{renderHero()}</div>}
        {currentPage === 'browse' && <div key="browse">{renderBrowseEvents()}</div>}
        {currentPage === 'organize' && <div key="organize">{renderOrganize()}</div>}
        {currentPage === 'dashboard' && <div key="dashboard">{renderDashboard()}</div>}
        {currentPage === 'registrations' && <div key="registrations">{renderRegistrations()}</div>}
        {currentPage === 'about' && <div key="about">{renderAbout()}</div>}
      </AnimatePresence>

      {renderModals()}
      
      {/* Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <Toast 
            key="toast"
            message={toast.message} 
            type={toast.type} 
            onClose={() => setToast(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <GlassCard className="p-6 flex items-center space-x-3">
              <LoadingSpinner size="w-6 h-6" />
              <span className="text-white">Loading...</span>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}



