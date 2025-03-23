import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css'; // Asumiendo que configurarás TailwindCSS

/**
 * Punto de entrada principal de la aplicación
 */
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);