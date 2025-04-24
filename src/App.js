import React, { useState, useEffect } from 'react';
import NowPlaying from './nowplaying';
import Calendar from './Calendar';
import bgImage from './assets/bg.png';
import './global.css';
import './SearchBar.css';
import './Calendar.css';
import AddEventForm from './AddEventForm';

function App() {
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
  };

  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch('http://localhost:3001/add-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
  
      if (!response.ok) {
        throw new Error('Failed to add event');
      }
  
      console.log('Event added successfully');
      // Optional: you could trigger a re-fetch of the calendar component here
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    const targets = [document.documentElement, document.body, document.getElementById('root')];
    targets.forEach(el => {
      if (!el) return;
      el.style.margin = '0';
      el.style.padding = '0';
      el.style.height = '100%';
      el.style.fontFamily = 'Inter, sans-serif';
      el.style.background = 'transparent';
    });
  }, []);

  return (
    <div
      style={{
        background: `url(${bgImage}) no-repeat center center`,
        backgroundSize: 'cover',
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        color: '#fff',
      }}
    >
      {/* Search Bar - Top Center */}
      <form
        className="search-form"
        onSubmit={handleSearchSubmit}
        style={{
          position: 'absolute',
          top: '10rem',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <input
          className="search-input"
          type="text"
          placeholder="Search Google..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </form>

      {/* Now Playing - Bottom Left */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          transform: 'translateY(-50%)',
          width: '600px',
        }}
      >
        <NowPlaying />
      </div>

      {/* Calendar - Bottom Right */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '20%',
          transform: 'translateY(-50%)',
          width: '600px',
        }}
      >
        <Calendar />
        <AddEventForm onAddEvent={handleAddEvent} />
      </div>
    </div>
  );
}

export default App;
