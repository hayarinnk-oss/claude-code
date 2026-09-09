import { useEffect, useState } from 'react';

let loadPromise = null;

function loadGoogleMapsScript(apiKey) {
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&loading=async`;
    script.async = true;
    script.onerror = () => reject(new Error('Google Maps JavaScript API の読み込みに失敗しました。'));
    script.onload = () => resolve(window.google.maps);
    document.head.appendChild(script);
  });
  return loadPromise;
}

export function useGoogleMaps() {
  const [maps, setMaps] = useState(window.google?.maps || null);
  const [error, setError] = useState(null);
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_BROWSER_API_KEY;

  useEffect(() => {
    if (maps) return;
    if (!apiKey) {
      setError('VITE_GOOGLE_MAPS_BROWSER_API_KEY が設定されていません。');
      return;
    }
    loadGoogleMapsScript(apiKey)
      .then(setMaps)
      .catch((e) => setError(e.message));
  }, [apiKey, maps]);

  return { maps, error };
}
