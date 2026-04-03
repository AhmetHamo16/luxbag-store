import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    const isLocalDev = ['localhost', '127.0.0.1'].includes(window.location.hostname);

    if (isLocalDev) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map((registration) => registration.unregister()));

        if ('caches' in window) {
          const keys = await window.caches.keys();
          await Promise.all(keys.map((key) => window.caches.delete(key)));
        }

        console.log('Local dev detected: service workers and caches cleared');
      } catch (err) {
        console.error('Failed to clear local service worker cache', err);
      }
      return;
    }

    navigator.serviceWorker.register('/sw.js').then(
      (reg) => console.log('SW registered', reg),
      (err) => console.error('SW Error', err)
    );
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
