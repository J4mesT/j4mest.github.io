import React, { useEffect, useState } from 'react';

// Directly embedding your OpenWeatherMap API key
const API_KEY = '74f4c65fa40120881e93ed2e2e832c7d';
const CITY = 'Leicester';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchWeather() {
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&units=metric&appid=${API_KEY}`
        );
        if (!res.ok) {
          throw new Error(`Error ${res.status}: ${res.statusText}`);
        }
        const data = await res.json();
        setWeather({
          temp: Math.round(data.main.temp),
          condition: data.weather[0].description,
          icon: data.weather[0].icon,
        });
      } catch (err) {
        console.error('Weather fetch failed', err);
        setError(err.message || 'Failed to load weather');
      } finally {
        setLoading(false);
      }
    }

    fetchWeather();
  }, []);

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.spinner}></div>
        <span style={styles.text}>Loading weather...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ ...styles.container, color: 'red' }}>
        {error}
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <img
        src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
        alt={weather.condition}
        style={styles.icon}
      />
      <div>
        <div style={styles.city}>{CITY}</div>
        <div style={styles.text}>{weather.temp}°C – {weather.condition}</div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: '1rem',
    left: '50%',
    transform: 'translateX(-50%)',
    display: 'flex',
    alignItems: 'center',
    padding: '1rem',
    backgroundColor: 'transparent',
    color: '#ccc',
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '4px solid #ccc',
    borderTop: '4px solid #3498db',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  text: {
    marginLeft: '0.75rem',
    fontSize: '1.25rem',
  },
  city: {
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  icon: {
    width: '64px',
    height: '64px',
    marginRight: '1rem',
  },
};
