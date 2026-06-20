import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, CameraOff, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function WebcamMonitor({ contestId = null, quizId = null, challengeId = null, onViolationLog = null }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  
  // Custom non-blocking notification toast
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    // Clear toast automatically after 4 seconds
    setTimeout(() => {
      setToast('');
    }, 4000);
  };

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
      setStream(mediaStream);
      setActive(true);
      setError('');
    } catch (err) {
      setError('Webcam access denied. Proctoring requires camera access.');
      logCheatViolation('no_face', 'Camera access blocked by candidate');
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setActive(false);
  };

  // Log violation helper
  const logCheatViolation = async (violationType, details) => {
    try {
      const res = await axios.post('/api/violations', {
        contestId,
        quizId,
        challengeId,
        violationType,
        details
      });
      const newViolation = res.data.violation;
      setViolations((prev) => [newViolation, ...prev]);

      if (onViolationLog) {
        onViolationLog(newViolation);
      }
    } catch (err) {
      console.error('Failed to log violation:', err.message);
    }
  };

  // Assign stream to video element when DOM ref is loaded
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, active]);

  // Proctoring listeners
  useEffect(() => {
    // 1. Tab switch listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logCheatViolation('tab_switch', 'Switched tabs or minimized browser');
        showToast('VIOLATION WARNING: Switching tabs or leaving the exam browser is logged.');
      }
    };

    // 2. Window blur listener
    const handleWindowBlur = () => {
      logCheatViolation('tab_switch', 'Lost browser focus (window blurred)');
      showToast('VIOLATION WARNING: Leaving or unfocusing the exam window is logged.');
    };

    startWebcam();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      stopWebcam();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <>
      {/* Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] bg-red-600 border border-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      {/* Proctor Widget */}
      <div className="fixed top-24 right-4 z-40 bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-2xl flex flex-col items-center w-48 transition-all duration-300">
        <div className="flex items-center justify-between w-full mb-1">
          <span className="text-[10px] uppercase font-bold text-red-500 flex items-center gap-1 animate-pulse">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
            Live Proctor
          </span>
          {active ? (
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          ) : (
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          )}
        </div>

        {/* Video Box */}
        <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden border border-slate-800">
          {active ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover scale-x-[-1]"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs">
              <CameraOff className="h-6 w-6 mb-1" />
              <span>Camera Off</span>
            </div>
          )}
        </div>

        {error && <span className="text-[10px] text-red-400 mt-2 text-center">{error}</span>}

        {/* Violation Stats */}
        <div className="mt-2 text-center w-full border-t border-slate-800 pt-2">
          <span className="text-[10px] text-slate-400 block font-semibold">
            Violations Logged: <strong className="text-red-500">{violations.length}</strong>
          </span>
        </div>
      </div>
    </>
  );
}
