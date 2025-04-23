import React from 'react';
import NowPlaying from './NowPlaying';
import Weather from './Weather';
import SearchBar from './SearchBar';
import ICSCalendar from './ICSCalendar'; // assuming you fixed the path

export default function App() {
  return (
    <div
      style={{
        position: 'relative',
        width: '100vw',
        height: '100vh',
        overflow: 'hidden',
        backgroundImage: "url('/fonts/background.png')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Google Font Link */}
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600&display=swap"
        rel="stylesheet"
      />

      <style>
        {`
          .component-container {
            background: none; /* No background */
            border-radius: 12px;
            padding: 12px 20px;
          }

          .ok-brotato-text {
            font-size: 5rem;
            font-weight: 600;
            color: #ffffffcc;
            font-family: 'Outfit', sans-serif;
            text-shadow: 2px 2px 20px rgba(0, 0, 0, 0.5);
          }

          .spotify-container {
            background: rgba(255, 255, 255, 0); /* Transparent background with a hint of white */
            backdrop-filter: blur(12px); /* Blur effect */
            border-radius: 12px;
            padding: 12px 20px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3); /* Slight shadow around the component */
          }
        `}
      </style>

      {/* Search Bar (center bottom) */}
      <div
        style={{
          position: 'absolute',
          top: '90%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
        className="component-container"
      >
        <SearchBar />
      </div>

      {/* Now Playing (left center) with blur effect */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '20%',
          transform: 'translateY(-50%)',
        }}
        className="spotify-container"
      >
        <NowPlaying />
      </div>

      {/* Calendar (bottom right) using ICSCalendar */}
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '1%',
          maxWidth: 600,
          overflowY: 'auto',
        }}
        className="spotify-container"
      >
        <ICSCalendar maxEvents={6} />
      </div>

      {/* "ok brotato" Text (middle right) */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          right: '25%',
          transform: 'translateY(-50%)',
        }}
      >
        <div className="ok-brotato-text">brotato</div>
      </div>

      {/* Weather (top right) */}
      <div
        style={{
          position: 'absolute',
          top: 16,
          right: '50%',
        }}
        className="component-container"
      >
        <Weather />
      </div>
    </div>
  );
}
