'use client';

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import SignIn from '../components/SignIn';
import Landing from '../components/Landing';
import ExploreEvents from '../components/ExploreEvents';
import OrganiseEvents from '../components/OrganiseEvents';
import MyPasses from '../components/MyPasses';
import NavBar from '../components/Navbar'; // Assuming NavBar is a separate component now

// A simple loading spinner for the initial auth check
function FullScreenLoader() {
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-white/20 border-t-indigo-400 rounded-full animate-spin"></div>
    </div>
  )
}

export default function Page() {
  const [tab, setTab] = useState('home');
  const { currentUser, loading } = useAuth();

  // 1. While Firebase checks the auth state, show a loader.
  if (loading) {
    return <FullScreenLoader />;
  }

  // 2. If there is no logged-in user, show the SignIn page.
  if (!currentUser) {
    return <SignIn />;
  }

  // 3. If a user IS logged in, show the main application.
  // We no longer use a fake email. We use the real one from Google.
  return (
    <div>
      <NavBar setActiveTab={setTab} />

      {tab === 'home' && (
        <Landing userEmail={currentUser.email} setActiveTab={setTab} />
      )}
      {tab === 'explore' && (
        <ExploreEvents setActiveTab={setTab} userEmail={currentUser.email} />
      )}
      {tab === 'organise' && (
        <OrganiseEvents setActiveTab={setTab} organiserEmail={currentUser.email} />
      )}
      {tab === 'mypass' && (
        <MyPasses setActiveTab={setTab} userEmail={currentUser.email} />
      )}
    </div>
  );
}

