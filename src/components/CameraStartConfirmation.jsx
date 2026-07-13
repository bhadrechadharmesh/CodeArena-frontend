import React, { useRef, useEffect, useState } from 'react';
import { Camera, CameraOff, AlertTriangle, ShieldCheck, CheckCircle2, Play } from 'lucide-react';

export default function CameraStartConfirmation({ 
  title = "Start Attempt", 
  subtitle = "Proctoring Setup",
  onConfirm, 
  onCancel 
}) {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [active, setActive] = useState(false);
  const [error, setError] = useState('');
  const [checkedRules, setCheckedRules] = useState({
    faceVisible: false,
    noTabs: false,
    wellLit: false
  });

  // Start webcam preview
  const startPreview = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 320, height: 240 } 
      });
      setStream(mediaStream);
      setActive(true);
      setError('');
    } catch (err) {
      setError('Webcam access was denied. Camera access is mandatory for proctored sessions.');
      setActive(false);
    }
  };

  // Stop webcam preview
  const stopPreview = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    setStream(null);
    setActive(false);
  };

  useEffect(() => {
    startPreview();
    return () => {
      stopPreview();
    };
  }, []);

  // Assign stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, active]);

  const allRulesChecked = active && checkedRules.faceVisible && checkedRules.noTabs && checkedRules.wellLit;

  const handleCheckboxChange = (rule) => {
    setCheckedRules((prev) => ({
      ...prev,
      [rule]: !prev[rule]
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-xl bg-slate-955/85">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl nm-card border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col md:flex-row">
        {/* Left Side: Video Preview */}
        <div className="w-full md:w-1/2 p-6 flex flex-col items-center justify-center bg-slate-950/40 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800/50">
          <span className="text-[10px] uppercase font-bold text-brand-600 dark:text-brand-400 tracking-wider mb-2">Camera Feed Preview</span>
          
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800 shadow-inner group">
            {active ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500 p-4 text-center">
                <CameraOff className="h-10 w-10 text-red-500 mb-2 animate-pulse" />
                <span className="text-xs font-semibold">{error || 'Initializing camera stream...'}</span>
                {!error && <span className="text-[10px] text-slate-400 mt-1">Please allow camera permissions if prompted</span>}
              </div>
            )}

            {/* Live Indicator overlay */}
            {active && (
              <div className="absolute top-3 left-3 bg-red-650/80 backdrop-blur-md px-2 py-0.5 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-ping"></span>
                <span className="text-[9px] uppercase font-bold text-white tracking-widest">Preview Active</span>
              </div>
            )}
          </div>

          {active && (
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/20 px-3 py-1.5 rounded-full border border-emerald-500/20">
              <ShieldCheck className="h-4 w-4" />
              <span>Camera verified and connected</span>
            </div>
          )}

          {error && (
            <button 
              onClick={startPreview}
              className="mt-4 nm-btn text-xs font-bold px-4 py-2 rounded-xl text-brand-600 flex items-center gap-1.5"
            >
              <Camera className="h-4.5 w-4.5" />
              Retry Connection
            </button>
          )}
        </div>

        {/* Right Side: Rules & Action */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h2 className="font-outfit font-extrabold text-2xl text-slate-900 dark:text-white leading-tight">{title}</h2>
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 tracking-wider block mt-1">{subtitle}</span>
            </div>

            {/* Checklist */}
            <div className="space-y-3.5 my-5">
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold uppercase tracking-wider">Please confirm compliance before starting:</p>
              
              {/* Rule 1 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={checkedRules.faceVisible}
                  onChange={() => handleCheckboxChange('faceVisible')}
                  disabled={!active}
                  className="mt-0.5 rounded border-slate-350 dark:border-slate-700 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
                />
                <div className="text-xs">
                  <span className={`font-semibold block ${checkedRules.faceVisible ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>My face is fully visible</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Ensure you are centered in the camera and no hats or sunglasses are worn.</span>
                </div>
              </label>

              {/* Rule 2 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={checkedRules.noTabs}
                  onChange={() => handleCheckboxChange('noTabs')}
                  disabled={!active}
                  className="mt-0.5 rounded border-slate-350 dark:border-slate-700 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
                />
                <div className="text-xs">
                  <span className={`font-semibold block ${checkedRules.noTabs ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>I will not leave the browser page</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Any tab switches or window blurs are automatically logged as violations. Exceeding 3 violations terminates the attempt.</span>
                </div>
              </label>

              {/* Rule 3 */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={checkedRules.wellLit}
                  onChange={() => handleCheckboxChange('wellLit')}
                  disabled={!active}
                  className="mt-0.5 rounded border-slate-350 dark:border-slate-700 text-brand-600 focus:ring-brand-500 disabled:opacity-40"
                />
                <div className="text-xs">
                  <span className={`font-semibold block ${checkedRules.wellLit ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}>Room lighting is sufficient</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">Avoid strong background lights. The monitor must clearly view your face.</span>
                </div>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
            <button
              onClick={onCancel}
              className="flex-grow nm-btn py-2.5 rounded-xl font-bold text-xs text-slate-700 dark:text-slate-200 text-center"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={!allRulesChecked}
              className={`flex-grow py-2.5 rounded-xl font-bold text-xs text-center flex items-center justify-center gap-1.5 transition-all ${
                allRulesChecked 
                  ? 'nm-btn-primary hover:opacity-95' 
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-slate-600 cursor-not-allowed border border-transparent'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Start Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
