import React, { useEffect, useState } from 'react';

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const city = "Leicester";
  
  // You should replace this with your actual API key
  const API_KEY = '74f4c65fa40120881e93ed2e2e832c7d';

  useEffect(() => {
    // Actual API call to OpenWeatherMap
    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${API_KEY}`)
      .then(res => {
        if (!res.ok) {
          throw new Error('Weather data not available');
        }
        return res.json();
      })
      .then(data => {
        setWeather({
          temp: data.main.temp,
          condition: data.weather[0].main,
          icon: data.weather[0].icon
        });
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching weather data:', error);
        setLoading(false);
      });
  }, [city, API_KEY]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: '2rem',
        width: '100%',
        height: '200px'
      }}>
        <div style={{ 
          width: '3rem', 
          height: '3rem', 
          borderRadius: '50%', 
          border: '6px solid #e5e7eb',
          borderTopColor: '#3b82f6',
          animation: 'spin 1s linear infinite'
        }} />
        <span style={{ marginLeft: '1.5rem', color: '#9ca3af', fontSize: '1.75rem' }}>Loading weather...</span>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '36rem', 
      width: '100%',
      background: 'transparent', 
      padding: '1rem', 
      display: 'flex', 
      alignItems: 'top' 
    }}>
      <img
        src={`https://openweathermap.org/img/wn/${weather?.icon}@4x.png`}
        alt={weather?.condition}
        style={{ width: '5rem', height: '5rem', marginRight: '1rem' }}
      />
      <div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#9ca3af' }}>{city}</div>
        <div style={{ fontSize: '1.5rem', color: '#9ca3af' }}>
          {weather?.temp}°C – {weather?.condition}
        </div>
      </div>
    </div>
  );
}