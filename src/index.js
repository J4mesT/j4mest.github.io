// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';      // ← note the '/client'
import App from './App';
import 'bootstrap/dist/css/bootstrap.min.css';
const { Children } = React;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
