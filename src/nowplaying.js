import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorThief from 'colorthief';
import './NowPlaying.css';

const CLIENT_ID = 'fa95a427198e4d4790c0be1b9a5d994c';
const REDIRECT_URI = 'https://0578-2a06-5906-42d-7c00-a462-9f6a-698e-6529.ngrok-free.app';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';
const SCOPES = ['user-read-currently-playing'];

const generateVerifier = () => {
  const array = new Uint8Array(56);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sha256 = (plain) => window.crypto.subtle.digest('SHA-256', new TextEncoder().encode(plain));
const base64Url = (buffer) =>
  btoa(String.fromCharCode(...new Uint8Array(buffer)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
const createChallenge = async (verifier) => base64Url(await sha256(verifier));

function NowPlaying() {
  const [token, setToken] = useState(null);
  const [track, setTrack] = useState(null);
  const [color, setColor] = useState('#000');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authHandled = useRef(false);

  useEffect(() => {
    // Ensure this runs only once (even in React Strict Mode)
    if (authHandled.current) return;
    authHandled.current = true;

    const handleAuth = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      const stored = localStorage.getItem('spotify_token');
      const expiry = Number(localStorage.getItem('spotify_token_expiry'));

      if (!code && stored && expiry && Date.now() < expiry) {
        setToken(stored);
        setLoading(false);
        return;
      }
      if (!code) {
        setLoading(false);
        return;
      }

      const codeVerifier = localStorage.getItem('pkce_verifier');
      if (!codeVerifier) {
        setError('Missing PKCE verifier.');
        setLoading(false);
        return;
      }

      // Helper to request a token
      const fetchToken = async () => {
        const body = new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: codeVerifier
        });

        const res = await fetch(TOKEN_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body
        });

        const data = await res.json();
        if (data.error) {
          throw new Error(data.error_description || data.error);
        }
        return data;
      };

      // Try once, then retry once on failure
      try {
        let data;
        try {
          data = await fetchToken();
        } catch (firstErr) {
          console.warn('First token fetch failed, retrying…', firstErr);
          data = await fetchToken();
        }

        const tokenExpiry = Date.now() + data.expires_in * 1000;
        localStorage.setItem('spotify_token', data.access_token);
        localStorage.setItem('spotify_token_expiry', tokenExpiry.toString());
        setToken(data.access_token);
        // Only clear the URL after successful token exchange
        window.history.replaceState(null, null, window.location.pathname);
      } catch (err) {
        console.error('Token exchange failed:', err);
        setError(`Could not obtain access token: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    handleAuth();
  }, []);

  useEffect(() => {
    if (!token) return;

    const fetchTrack = async () => {
      try {
        const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 204 || res.status >= 400) {
          setTrack(null);
          return;
        }

        const data = await res.json();
        if (!data?.is_playing || !data.item) {
          setTrack(null);
          return;
        }

        const img = new Image();
        img.crossOrigin = 'Anonymous';
        img.src = data.item.album.images[0]?.url;
        img.onload = () => {
          const [r, g, b] = new ColorThief().getColor(img);
          setColor(`rgb(${r}, ${g}, ${b})`);
        };

        setTrack({
          name: data.item.name,
          artists: data.item.artists.map(a => a.name).join(', '),
          albumArt: data.item.album.images[0]?.url,
          id: data.item.id
        });
      } catch (err) {
        console.error('Fetch error', err);
        setError('Failed to fetch currently playing track.');
        setTrack(null);
      }
    };

    fetchTrack();
    const id = setInterval(fetchTrack, 5000);
    return () => clearInterval(id);
  }, [token]);

  const handleLogin = async () => {
    setError(null);
    const verifier = generateVerifier();
    const challenge = await createChallenge(verifier);
    localStorage.setItem('pkce_verifier', verifier);
    const authUrl = `${AUTH_ENDPOINT}` +
      `?response_type=code` +
      `&client_id=${CLIENT_ID}` +
      `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
      `&scope=${encodeURIComponent(SCOPES.join(' '))}` +
      `&code_challenge_method=S256` +
      `&code_challenge=${challenge}`;
    window.location.assign(authUrl);
  };

  if (loading) return <div className="message">Loading...</div>;
  if (error) return (
    <div className="message">
      <p>{error}</p>
      <button className="login-button" onClick={handleLogin}>Retry Login</button>
    </div>
  );
  if (!token) return <button className="login-button" onClick={handleLogin}>Login</button>;
  if (!track) return (
    <motion.div
      key="nothing"
      className="nothing-playing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      Nothing is Playing.
    </motion.div>
  );

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={track.id}
        className="now-playing-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="album-art-wrapper">
          <motion.div
            className="album-art-bg"
            style={{ background: color }}
            initial={{ x: '20%', opacity: 0.3 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-20%', opacity: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeInOut' }}
          >
            <img src={track.albumArt} alt="Album Art" className="album-art" />
          </motion.div>
        </div>
        <motion.div
          className="track-info"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <p className="track-name">{track.name}</p>
          <p className="track-artists">{track.artists}</p>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default NowPlaying;
