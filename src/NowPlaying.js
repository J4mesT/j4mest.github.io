import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Spinner } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import ColorThief from 'color-thief-browser';

const CLIENT_ID = 'fa95a427198e4d4790c0be1b9a5d994c';
const REDIRECT_URI = 'https://f482-2a06-5906-42d-7c00-5c17-9be7-303a-ae21.ngrok-free.app';
const SCOPES = 'user-read-currently-playing user-read-playback-state';
const AUTH_ENDPOINT = 'https://accounts.spotify.com/authorize';
const TOKEN_ENDPOINT = 'https://accounts.spotify.com/api/token';

function generateCodeVerifier() {
  const array = new Uint8Array(64);
  window.crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(verifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return btoa(String.fromCharCode(...new Uint8Array(digest))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export default function NowPlaying() {
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [track, setTrack] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [glowColor, setGlowColor] = useState('rgba(0,0,0,0.5)');
  const [currentProgress, setCurrentProgress] = useState(0);
  const lastTrackId = useRef(null);
  const [slideDirection, setSlideDirection] = useState(1);

  // Auth Code + Token Handling
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const savedAccess = localStorage.getItem('access_token');
    const savedRefresh = localStorage.getItem('refresh_token');

    if (code) {
      const verifier = localStorage.getItem('pkce_verifier');
      fetch(TOKEN_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: REDIRECT_URI,
          client_id: CLIENT_ID,
          code_verifier: verifier,
        }),
      })
        .then(res => res.json())
        .then(data => {
          if (!data.error) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);
            window.history.replaceState({}, document.title, window.location.pathname);
          }
        })
        .catch(console.error);
    } else if (savedAccess) {
      setToken(savedAccess);
      setRefreshToken(savedRefresh);
    }
  }, []);

  // Refresh Access Token
  const refreshAccessToken = useCallback(() => {
    if (!refreshToken) return;
  
    fetch(TOKEN_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: CLIENT_ID,
      }),
    })
      .then(async res => {
        const data = await res.json();
  
        if (data.error) {
          console.error('Token refresh error:', data);
          if (data.error === 'invalid_grant' && data.error_description.includes('revoked')) {
            // Refresh token is no longer valid → force full re-login
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            localStorage.removeItem('pkce_verifier');
            setToken(null);
            setRefreshToken(null);
            // Optionally: window.location.reload();
          }
          return;
        }
  
        // If OK, store new access token and continue
        setToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
      })
      .catch(console.error);
  }, [refreshToken]);

  // Auto-refresh token every 55 minutes
  useEffect(() => {
    if (!refreshToken) return;
    const interval = setInterval(() => {
      refreshAccessToken();
    }, 55 * 60 * 1000);
    return () => clearInterval(interval);
  }, [refreshToken, refreshAccessToken]);

  // Fetch Track Info
  const fetchTrack = useCallback(async (initial = false) => {
    if (initial) setInitialLoading(true);
    try {
      const res = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.status === 401) {
        refreshAccessToken();
        return;
      }

      if (res.status === 204 || !res.ok) {
        setTrack(null);
        lastTrackId.current = null;
      } else {
        const data = await res.json();
        if (data.is_playing && data.item) {
          if (lastTrackId.current && lastTrackId.current !== data.item.id) {
            setSlideDirection(prev => prev * -1);
          }
          setTrack({
            id: data.item.id,
            title: data.item.name,
            artists: data.item.artists.map(a => a.name).join(', '),
            albumArt: data.item.album.images[0].url,
            progress_ms: data.progress_ms,
            duration_ms: data.item.duration_ms,
            timestamp: data.timestamp,
            is_playing: data.is_playing,
          });
          lastTrackId.current = data.item.id;
        } else {
          setTrack(null);
          lastTrackId.current = null;
        }
      }
    } catch (err) {
      console.error(err);
      setTrack(null);
    } finally {
      if (initial) setInitialLoading(false);
    }
  }, [token, refreshAccessToken]);

  useEffect(() => {
    if (!token) return;
    fetchTrack(true);
    const interval = setInterval(() => fetchTrack(false), 5000);
    return () => clearInterval(interval);
  }, [token, fetchTrack]);

  useEffect(() => {
    if (!track || !track.is_playing) {
      setCurrentProgress(track ? track.progress_ms : 0);
      return;
    }
    const interval = setInterval(() => {
      const newProgress = track.progress_ms + (Date.now() - track.timestamp);
      if (newProgress >= track.duration_ms) {
        fetchTrack();
      } else {
        setCurrentProgress(newProgress);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [track, fetchTrack]);

  useEffect(() => {
    if (track?.albumArt) {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = track.albumArt;
      img.onload = () => {
        try {
          const color = ColorThief.getColor(img);
          setGlowColor(`rgba(${color[0]},${color[1]},${color[2]},0.6)`);
        } catch {}
      };
    }
  }, [track]);

  // UI
  if (!token) {
    return (
      <button
        onClick={async () => {
          const verifier = generateCodeVerifier();
          const challenge = await generateCodeChallenge(verifier);
          localStorage.setItem('pkce_verifier', verifier);
          window.location = `${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&response_type=code&redirect_uri=${encodeURIComponent(
            REDIRECT_URI
          )}&scope=${encodeURIComponent(SCOPES)}&code_challenge_method=S256&code_challenge=${challenge}`;
        }}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'inherit',
          cursor: 'pointer',
          padding: 0,
          margin: 0,
        }}
      >
        Log in
      </button>
    );
  }

  if (initialLoading)
    return <Spinner animation="border" size="sm" variant="light" style={{ backgroundColor: 'transparent' }} />;

  if (!track)
    return <div style={{ color: '#CCC', backgroundColor: 'transparent', padding: 0, margin: 0 }}>Nothing playing</div>;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 0,
        overflow: 'hidden',
        backgroundColor: 'transparent',
        padding: 0,
        margin: 0,
      }}
    >
      <style>{`@font-face{font-family:'Myriad Pro';src:url('/fonts/MyriadPro-Regular.woff2') format('woff2'),url('/fonts/MyriadPro-Regular.woff') format('woff');font-weight:normal;font-style:normal;}`}</style>
      <AnimatePresence mode="wait">
        <motion.img
          key={track.id}
          src={track.albumArt}
          alt={track.title}
          initial={{ x: 300, opacity: 0, scale: 1 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          exit={{ x: -300, opacity: 0, scale: 1 }}
          transition={{
            x: { type: 'tween', duration: 0.8, ease: 'easeInOut' },
            opacity: { duration: 0.4 },
            scale: { type: 'tween', duration: 0.8, ease: 'easeInOut' },
          }}
          style={{
            width: '600px',
            height: '600px',
            borderRadius: '20px',
            boxShadow: `0 0 0px ${glowColor}`,
            backgroundColor: 'transparent',
            margin: 0,
          }}
        />
      </AnimatePresence>
      <motion.div
        key={`info-${track.id}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        style={{ backgroundColor: 'transparent', width: '600px', textAlign: 'left', padding: 0, margin: 0 }}
      >
        <div
          style={{
            fontSize: '3rem',
            fontWeight: 'normal',
            fontFamily: '"Myriad Pro"',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
            color: '#D3D3D3',
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: '1.5rem',
            color: '#ADADAD',
            fontFamily: '"Myriad Pro", sans-serif',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            backgroundColor: 'transparent',
            padding: 0,
            margin: 0,
          }}
        >
          {track.artists}
        </div>
      </motion.div>
    </div>
  );
}
