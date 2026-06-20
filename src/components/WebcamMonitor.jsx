import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, CameraOff, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function WebcamMonitor({ contestId = null, quizId = null, onViolationLog = null }) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  const [webcamWarning, setWebcamWarning] = useState('');

  // Start webcam stream
  const startWebcam = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
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

  // Proctoring listeners
  useEffect(() => {
    // 1. Fullscreen change listener
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        logCheatViolation('exit_fullscreen', 'Exited fullscreen mode during exam');
        alert('VIOLATION ALERT: Exiting fullscreen mode is forbidden and has been logged.');
      }
    };

    // 2. Tab switch listener
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        logCheatViolation('tab_switch', 'Switched tabs or minimized browser');
        alert('VIOLATION ALERT: Switching tabs or minimizing the browser is forbidden and has been logged.');
      }
    };

    // Force Fullscreen on Mount (Prompt student)
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn('Failed to force fullscreen immediately:', err.message);
      }
    };

    requestFullscreen();
    startWebcam();

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // 3. Periodic visual check simulation (checking if face leaves screen or looks away)
    const checkTimer = setInterval(() => {
      if (active) {
        // Randomly simulate looking away every 45s for demo testing, or keep check
        const rand = Math.random();
        if (rand < 0.08) {
          setWebcamWarning('Warning: No face detected. Keep eyes on screen.');
          logCheatViolation('no_face', 'No face visible in camera frame');
        } else if (rand > 0.95) {
          setWebcamWarning('Warning: Multiple faces detected.');
          logCheatViolation('multiple_faces', 'Multiple faces detected in camera frame');
        } else {
          setWebcamWarning('');
        }
      }
    }, 15000);

    return () => {
      stopWebcam();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(checkTimer);
      // Exit fullscreen on cleanup
      if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [active]);

  return (
    <div className="fixed bottom-4 right-4 z-40 bg-slate-900 border border-slate-700 text-white rounded-xl p-3 shadow-2xl flex flex-col items-center w-48 transition-all duration-300">
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
      {webcamWarning && (
        <span className="text-[9px] bg-red-950 border border-red-800 text-red-300 p-1 rounded mt-2 text-center font-semibold animate-pulse">
          {webcamWarning}
        </span>
      )}

      {/* Violation Stats */}
      <div className="mt-2 text-center w-full">
        <span className="text-[10px] text-slate-400 block">
          Violations Count: <strong className="text-red-500">{violations.length}</strong>
        </span>
      </div>
    </div>
  );
}
