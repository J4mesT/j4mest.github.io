// src/SpotifyLogin.js
import React from 'react';

const CLIENT_ID = 'fa95a427198e4d4790c0be1b9a5d994c'; // Replace with your actual client ID
const REDIRECT_URI = 'https://j4mest.github.io/callback'; // Adjust for production
const SCOPES = 'user-read-playback-state user-read-currently-playing'; // You can modify these scopes based on what data you need

const SpotifyLogin = () => {
  const handleLogin = () => {
    const AUTH_URL = `https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES)}`;
    window.location = AUTH_URL; // Redirects the user to the Spotify login page
  };

  return <button onClick={handleLogin}>Login to Spotify</button>;
};

export default SpotifyLogin;
