import { useEffect, useState } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import axios from 'axios';
import SpotifyLogin from './SpotifyLogin';

const CLIENT_ID = 'fa95a427198e4d4790c0be1b9a5d994c'; // Replace with your actual client ID
const CLIENT_SECRET = '5d7b1705beb44d3bbe0f1734ce757416'; // Replace with your actual client secret
const REDIRECT_URI = 'https://j4mest.github.io/#/callback'; // Replace with your actual redirect URI

function App() {
  const [accessToken, setAccessToken] = useState(null);

  // Handle the Spotify callback route
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.hash.split('?')[1]);
    const code = queryParams.get('code');
    if (code) {
      // Exchange the authorization code for an access token
      axios
        .post(
          'https://accounts.spotify.com/api/token',
          new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
              Authorization: `Basic ${btoa(CLIENT_ID + ':' + CLIENT_SECRET)}`, // Base64 encode the client ID and secret
            },
          }
        )
        .then((response) => {
          setAccessToken(response.data.access_token); // Store the access token
          window.history.replaceState({}, document.title, '/'); // Remove the code from URL
        })
        .catch((error) => console.error('Error fetching access token:', error));
    }
  }, []);

  return (
    <Router>
      <div>
        <h1>Spotify Integration</h1>
        {!accessToken ? (
          <SpotifyLogin />
        ) : (
          <p>Logged in! Access Token: {accessToken}</p>
        )}

        <Routes>
          <Route path="/" element={<div>Welcome to the homepage!</div>} />
          <Route path="/callback" element={<div>Handling the Spotify callback...</div>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
