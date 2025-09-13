"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HiSparkles, HiArrowRightOnRectangle, HiBars3, HiXMark } from "react-icons/hi2";
import { MdOutlineRocketLaunch } from "react-icons/md";
import { useAuth } from "../context/AuthContext";

export default function NavBar({ setActiveTab }) {
  const { currentUser, signOutUser } = useAuth();

  const [activeNavItem, setActiveNavItem] = useState("Home");
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = ["Explore", "Organise", "My Passes", "About"];

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu when clicking outside or on scroll
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu-container')) {
        setIsMobileMenuOpen(false);
      }
    };
    
    const handleScroll = () => {
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('click', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isMobileMenuOpen]);

  const handleNavClick = (item) => {
    setActiveNavItem(item);
    setIsMobileMenuOpen(false); // Close mobile menu when item is selected

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
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 ${
          isScrolled
            ? "backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-indigo-500/10"
            : "backdrop-blur-md bg-white/5 border border-white/10 shadow-xl"
        } rounded-2xl px-4 md:px-8 py-4`}
      >
        <div className="flex items-center justify-between w-[90vw] max-w-7xl">
          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 rounded-lg bg-white/10 border border-white/20 hover:bg-white/20 transition-all duration-200"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <motion.div
              animate={{ rotate: isMobileMenuOpen ? 90 : 0 }}
              transition={{ duration: 0.3 }}
            >
              {isMobileMenuOpen ? (
                <HiXMark className="h-5 w-5 text-white" />
              ) : (
                <HiBars3 className="h-5 w-5 text-white" />
              )}
            </motion.div>
          </motion.button>

          {/* Logo */}
          <motion.div
            className="flex items-center space-x-2 cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            onClick={() => handleNavClick("Home")}
          >
            <div className="relative">
              <HiSparkles className="h-6 w-6 md:h-8 md:w-8 text-indigo-400" />
              <motion.div
                className="absolute inset-0 rounded-full bg-indigo-400/20"
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
            <span className="text-xl md:text-2xl font-bold bg-gradient-to-r from-indigo-400 via-cyan-400 to-pink-400 bg-clip-text text-transparent">
              NextPass
            </span>
          </motion.div>

          {/* Desktop Nav items */}
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
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* User email - hidden on small screens */}
            <div className="hidden sm:flex items-center space-x-3 px-3 md:px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs md:text-sm text-white/90 max-w-20 md:max-w-32 truncate">
                {currentUser?.email}
              </span>
            </div>

            {/* Fun rocket icon */}
            <motion.button
              whileHover={{ scale: 1.2, rotate: [0, 15, -10, 0] }}
              whileTap={{ scale: 0.9, rotate: 0 }}
              className="relative p-2 md:p-3 bg-gradient-to-r from-indigo-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/20 rounded-full hover:from-indigo-500/30 hover:to-cyan-500/30 transition-all duration-200"
              title="Blast off!"
            >
              <MdOutlineRocketLaunch className="h-4 w-4 md:h-5 md:w-5 text-white" />
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 md:w-3 md:h-3 bg-pink-500 rounded-full"
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
              className="p-2 md:p-3 bg-red-500/20 backdrop-blur-sm border border-red-500/30 rounded-full hover:bg-red-500/30 transition-all"
            >
              <HiArrowRightOnRectangle className="h-4 w-4 md:h-5 md:w-5 text-red-300" />
            </motion.button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="mobile-menu-container fixed top-20 left-1/2 transform -translate-x-1/2 z-40 md:hidden"
          >
            <div className="backdrop-blur-xl bg-white/10 border border-white/20 shadow-2xl shadow-indigo-500/10 rounded-2xl px-4 py-6 w-[90vw] max-w-sm">
              {/* Mobile nav items */}
              <div className="space-y-3">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    onClick={() => handleNavClick(item)}
                    className={`relative w-full text-left px-4 py-3 rounded-xl transition-all duration-200 ${
                      activeNavItem === item
                        ? "bg-gradient-to-r from-indigo-500/30 to-cyan-500/30 border border-white/20 text-white"
                        : "text-white/70 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <motion.span
                      className="block text-sm font-medium"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      {item}
                    </motion.span>
                  </motion.button>
                ))}
              </div>

              {/* Mobile user info */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="mt-6 pt-4 border-t border-white/10"
              >
                <div className="flex items-center justify-center space-x-3 px-4 py-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-white/90 truncate max-w-40">
                    {currentUser?.email}
                  </span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-30 md:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </AnimatePresence>
    </>
  );
}