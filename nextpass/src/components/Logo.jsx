// components/Logo.jsx
import { motion } from "framer-motion";
import { HiSparkles } from "react-icons/hi2";

export default function Logo({ onClick }) {
  return (
    <motion.div 
      className="flex items-center space-x-2 cursor-pointer"
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
    >
      <div className="relative">
        <HiSparkles className="h-8 w-8 text-indigo-400" />
        <motion.div
          className="absolute inset-0 rounded-full bg-indigo-400/20"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
        NextPass
      </span>
    </motion.div>
  );
}
