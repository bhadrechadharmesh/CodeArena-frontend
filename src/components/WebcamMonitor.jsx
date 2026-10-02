import React, { useRef, useEffect, useState } from 'react';
import axios from 'axios';
import { Camera, CameraOff, AlertTriangle, GripVertical, Minus, Maximize2 } from 'lucide-react';

export default function WebcamMonitor({ contestId = null, quizId = null, challengeId = null, onViolationLog = null }) {
  const videoRef = useRef(null);
  const widgetRef = useRef(null);
  const dragRef = useRef(null);
  const streamRef = useRef(null);
  const generationRef = useRef(0);
  const toastTimerRef = useRef(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [position, setPosition] = useState(() => ({ x: Math.max(8, window.innerWidth - 208), y: Math.max(8, window.innerHeight - 210) }));

  const clampPosition = (x, y) => {
    const bounds = widgetRef.current?.getBoundingClientRect();
    return {
      x: Math.max(8, Math.min(x, window.innerWidth - (bounds?.width || 192) - 8)),
      y: Math.max(8, Math.min(y, window.innerHeight - (bounds?.height || 190) - 8)),
    };
  };
  useEffect(() => {
    const keepVisible = () => setPosition(previous => clampPosition(previous.x, previous.y));
    const observer = new ResizeObserver(keepVisible);
    if (widgetRef.current) observer.observe(widgetRef.current);
    window.addEventListener('resize', keepVisible);
    return () => { observer.disconnect(); window.removeEventListener('resize', keepVisible); };
  }, []);

  const startDrag = event => {
    if (event.button !== 0) return;
    const bounds = widgetRef.current.getBoundingClientRect();
    dragRef.current = { x: event.clientX - bounds.left, y: event.clientY - bounds.top };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDragging(true);
  };
  const moveDrag = event => {
    if (!dragRef.current) return;
    setPosition(clampPosition(event.clientX - dragRef.current.x, event.clientY - dragRef.current.y));
  };
  const endDrag = () => { dragRef.current = null; setDragging(false); };
  const moveWithKeyboard = event => {
    const movement = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[event.key];
    if (!movement) return;
    event.preventDefault();
    const step = event.shiftKey ? 40 : 10;
    setPosition(previous => clampPosition(previous.x + movement[0] * step, previous.y + movement[1] * step));
  };
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [violations, setViolations] = useState([]);
  
  // Custom non-blocking notification toast
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    // Clear toast automatically after 4 seconds
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setToast('');
    }, 4000);
  };

  // Start webcam stream
  const startWebcam = async (generation) => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { width: 160, height: 120 } });
      if (generation !== generationRef.current) { mediaStream.getTracks().forEach(track => track.stop()); return; }
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setActive(true);
      setError('');
    } catch (err) {
      if (generation !== generationRef.current) return;
      setError('Webcam access denied. Proctoring requires camera access.');
      logCheatViolation('no_face', 'Camera access blocked by candidate');
    }
  };

  // Stop webcam stream
  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    streamRef.current = null;
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

    const generation = ++generationRef.current;
    startWebcam(generation);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      generationRef.current++;
      clearTimeout(toastTimerRef.current);
      stopWebcam();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, []);

  return (
    <>
      {/* Toast Notification Overlay */}
      {toast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[999] bg-red-600 border border-red-700 text-white font-bold text-xs sm:text-sm px-6 py-3 rounded-md shadow-2xl flex items-center gap-2 animate-bounce">
          <AlertTriangle className="h-4 w-4 shrink-0 animate-pulse" />
          <span>{toast}</span>
        </div>
      )}

      <section ref={widgetRef} aria-label="Camera preview" className={'camera-widget ' + (dragging ? 'is-dragging' : '')} style={{ left: position.x, top: position.y }}>
        <header className="camera-widget-header">
          <button type="button" className="camera-drag-handle" aria-label="Move camera preview" aria-describedby="camera-move-help" title="Drag to move · Arrow keys to reposition" onPointerDown={startDrag} onPointerMove={moveDrag} onPointerUp={endDrag} onPointerCancel={endDrag} onLostPointerCapture={endDrag} onKeyDown={moveWithKeyboard}>
            <GripVertical size={15}/><span className={active ? 'camera-status active' : 'camera-status'}/><span>Camera {active ? 'on' : 'off'}</span>
          </button>
          <button type="button" className="camera-collapse" onClick={() => setCollapsed(previous => !previous)} aria-expanded={!collapsed} aria-controls="camera-preview-body" aria-label={collapsed ? 'Expand camera preview' : 'Minimize camera preview'} title={collapsed ? 'Expand preview' : 'Minimize preview'}>{collapsed ? <Maximize2 size={14}/> : <Minus size={16}/>}</button>
        </header>
        <span id="camera-move-help" className="sr-only">Drag this handle or use arrow keys to move the preview. Hold Shift to move faster.</span>
        <div id="camera-preview-body" hidden={collapsed}>
          <div className="camera-video">{active ? <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover scale-x-[-1]"/> : <div className="camera-unavailable"><CameraOff size={22}/><span>Camera unavailable</span></div>}</div>
          {error && <p className="camera-error">{error}</p>}
          <div className="camera-widget-footer"><span>Session monitoring</span><span>{violations.length} events</span></div>
        </div>
        {collapsed && error && <p className="camera-error">{error}</p>}
      </section>
    </>
  );
}
