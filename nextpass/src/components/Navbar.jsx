"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HiSparkles, HiArrowRightOnRectangle } from "react-icons/hi2";
import { MdOutlineRocketLaunch } from "react-icons/md"; // 🚀 fun rocket icon
import { useAuth } from "../context/AuthContext";

export default function NavBar({ setActiveTab }) {
  const { currentUser, signOutUser } = useAuth();

  const [activeNavItem, setActiveNavItem] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);

  const navItems = ["Explore", "Organise", "My Passes", "About"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavClick = (item) => {
    setActiveNavItem(item);

    const tabMap = {
      Home: "home",
      Explore: "explore",
      Organise: "organise",
      "My Passes": "mypass",
      About: "about",
    };

    const tabName = tabMap[item];
    if (setActiveTab && tabName) {
      setActiveTab(tabName);
    }
  };

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
        isScrolled
          ? "backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-indigo-500/10"
          : "backdrop-blur-md bg-white/5 border border-white/10 shadow-xl"
      } rounded-2xl px-8 py-4`}
    >
      <div className="flex items-center justify-between min-w-[90vw] max-w-7xl">
        {/* Logo */}
        <motion.div
          className="flex items-center space-x-2 cursor-pointer"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          onClick={() => handleNavClick("Home")}
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

        {/* Nav items */}
        <div className="hidden md:flex items-center space-x-8 relative">
          {navItems.map((item) => (
            <motion.button
              key={item}
              onClick={() => handleNavClick(item)}
              className={`relative px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                activeNavItem === item
                  ? "text-white"
                  : "text-white/70 hover:text-white"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {item}
              {activeNavItem === item && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 rounded-lg border border-white/20"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
            </motion.button>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* User email */}
          <div className="hidden sm:flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-white/90 max-w-32 truncate">
              {currentUser?.email}
            </span>
          </div>

          {/* Fun rocket icon */}
          <motion.button
            whileHover={{ scale: 1.2, rotate: [0, 15, -10, 0] }}
            whileTap={{ scale: 0.9, rotate: 0 }}
            className="relative p-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-full hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all duration-200"
            title="Blast off!"
          >
            <MdOutlineRocketLaunch className="h-5 w-5 text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"
              animate={{ scale: [1, 1.3, 1], rotate: [0, 20, -20, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Sign Out */}
          <motion.button
            onClick={signOutUser}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Sign Out"
            className="p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full hover:bg-red-500/30 transition-all"
          >
            <HiArrowRightOnRectangle className="h-5 w-5 text-red-300" />
          </motion.button>
        </div>
      </div>
    </motion.nav>
  );
}
