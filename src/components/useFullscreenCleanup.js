import { useEffect, useRef } from 'react';
import { exitFullscreen } from '../services/fullscreen.js';

export default function useFullscreenCleanup() {
  const exitTimer = useRef(null);
  useEffect(() => {
    clearTimeout(exitTimer.current);
    return () => {
      // React StrictMode replays effects; only exit when the page stays unmounted.
      exitTimer.current = setTimeout(() => { exitFullscreen(); }, 0);
    };
  }, []);
}
