import React, { useEffect, useState } from 'react';

// Ensure this module has a default export
export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={{ fontSize: '1.5rem', fontFamily: 'monospace' }}>
      {time.toLocaleTimeString()}
    </div>
  );
}