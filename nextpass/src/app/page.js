// src/app/page.js
'use client';

import React, { useState } from 'react';
import Landing from '../components/Landing';
import ExploreEvents from '../components/ExploreEvents';
import OrganiseEvents from '../components/OrganiseEvents';
// 1. Change this import to match your filename
import MyPasses from '../components/MyPasses'; 

export default function Page() {
  const [tab, setTab] = useState('home');
  const userEmail = "anuragsujit2005@gmail.com"; // Replace with real auth later

  return (
    <div>
      {tab === 'home' && (
        <Landing userEmail={userEmail} setActiveTab={setTab} />
      )}
      {tab === 'explore' && (
        <ExploreEvents setActiveTab={setTab} userEmail={userEmail} />
      )}
      {tab === 'organise' && (
        <OrganiseEvents setActiveTab={setTab} organiserEmail={userEmail} />
      )}
      {/* 2. Update the component name and the tab name to match your NavBar */}
      {tab === 'mypass' && (
        <MyPasses setActiveTab={setTab} userEmail={userEmail} />
      )}
    </div>
  );
}