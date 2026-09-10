// @ts-nocheck
import React from 'react';
import { 
  Clock, 
  Play, 
  Pause, 
  Square, 
  Check, 
  Sparkles, 
  Layers, 
  AlertCircle, 
  X, 
  CheckSquare, 
  Square as SquareIcon,
  ChevronRight,
  Eye
} from 'lucide-react';

interface AutoFramesModalProps {
  isOpen: boolean;
  onClose: () => void;
  delaySeconds: number;
  setDelaySeconds: (s: number) => void;
  applyOnlySelected: boolean;
  setApplyOnlySelected: (val: boolean) => void;
  status: 'idle' | 'countdown' | 'recording' | 'paused';
  countdownValue: number;
  timeRemaining: number;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  selectedObjectId: string | null;
  selectedObjectName: string | null;
  currentFrameIndex: number;
  totalFrames: number;
}

const DELAY_OPTIONS = [2, 3, 5, 10, 15];

export default function AutoFramesModal({
  isOpen,
  onClose,
  delaySeconds,
  setDelaySeconds,
  applyOnlySelected,
  setApplyOnlySelected,
  status,
  countdownValue,
  timeRemaining,
  onStart,
  onPause,
  onResume,
  onStop,
  selectedObjectId,
  selectedObjectName,
  currentFrameIndex,
  totalFrames
}: AutoFramesModalProps) {
  if (!isOpen && status === 'idle') return null;

  // Floating HUD when recording or paused or countdown
  if (status !== 'idle') {
    return (
      <>
        {/* Big Countdown Overlay */}
        {status === 'countdown' && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none select-none">
            <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-200">
              <span className="text-amber-400 text-xs font-black uppercase tracking-widest bg-amber-500/20 px-4 py-1.5 rounded-full border border-amber-500/40">
                Get Ready To Perform
              </span>
              <div className="text-8xl font-black text-amber-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.6)]">
                {countdownValue}
              </div>
              <p className="text-neutral-300 text-sm font-semibold mt-2">
                Move or transform your drawing on canvas...
              </p>
            </div>
          </div>
        )}

        {/* Live Recording Floating HUD */}
        {(status === 'recording' || status === 'paused') && (
          <div className="fixed top-16 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-neutral-900/95 border border-amber-500/50 shadow-2xl shadow-black/80 rounded-2xl px-4 py-2.5 backdrop-blur-md select-none">
            {/* Status indicator */}
            <div className="flex items-center gap-2 pr-3 border-r border-neutral-800">
              {status === 'recording' ? (
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
                  </span>
                  <span className="text-xs font-black text-rose-400 tracking-wider">REC</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-amber-400"></span>
                  <span className="text-xs font-black text-amber-400 tracking-wider">PAUSED</span>
                </div>
              )}
            </div>

            {/* Frame info & Timer */}
            <div className="flex flex-col min-w-[130px]">
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span className="text-neutral-400">Frame {currentFrameIndex + 1}</span>
                <span className="text-amber-400 font-mono font-black">
                  {status === 'recording' ? `${timeRemaining.toFixed(1)}s` : 'Paused'}
                </span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mt-1">
                <div 
                  className="h-full bg-amber-500 transition-all duration-100 ease-linear rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(0, (timeRemaining / delaySeconds) * 100))}%`
                  }}
                />
              </div>
            </div>

            {/* Target indicator */}
            <div className="hidden sm:flex flex-col pl-2 border-l border-neutral-800 text-[10px]">
              <span className="text-neutral-500 font-bold uppercase">Target</span>
              <span className="text-neutral-200 font-bold max-w-[100px] truncate">
                {applyOnlySelected ? (selectedObjectName || 'Selected Item') : 'Full Canvas'}
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-1.5 pl-2 border-l border-neutral-800">
              {status === 'recording' ? (
                <button
                  onClick={onPause}
                  className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-amber-400 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  title="Pause Recording"
                >
                  <Pause className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">PAUSE</span>
                </button>
              ) : (
                <button
                  onClick={onResume}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
                  title="Resume Recording"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">RESUME</span>
                </button>
              )}

              <button
                onClick={onStop}
                className="px-2.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow"
                title="Stop Auto Frames Recording"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>STOP</span>
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Settings Configuration Modal when idle
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-neutral-900 border border-neutral-750 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-850">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                Auto Frames
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  Speed Animation
                </span>
              </h2>
              <p className="text-[11px] text-neutral-400 font-medium">
                Transform drawings on canvas; frames are automatically recorded!
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5">
          {/* Step 1: Capture Delay Setting */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-neutral-300 mb-2">
              Frame Capture Delay (Seconds)
            </label>
            <p className="text-[11px] text-neutral-400 mb-3">
              Gives you time to prepare and smoothly transform your drawing before the next frame is saved.
            </p>
            <div className="grid grid-cols-5 gap-2">
              {DELAY_OPTIONS.map((sec) => (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setDelaySeconds(sec)}
                  className={`py-2 px-1 rounded-xl text-xs font-black transition-all cursor-pointer flex flex-col items-center justify-center border ${
                    delaySeconds === sec
                      ? 'bg-amber-500 text-neutral-950 border-amber-400 shadow-md shadow-amber-500/20 scale-[1.02]'
                      : 'bg-neutral-800 text-neutral-300 border-neutral-700 hover:border-neutral-600 hover:bg-neutral-750'
                  }`}
                >
                  <span className="text-sm font-black">{sec}s</span>
                  <span className="text-[9px] opacity-75 font-semibold">delay</span>
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Apply Only Selected Toggle */}
          <div className="bg-neutral-850 border border-neutral-800 rounded-xl p-3.5">
            <button
              type="button"
              onClick={() => setApplyOnlySelected(!applyOnlySelected)}
              className="w-full flex items-start gap-3 text-left cursor-pointer select-none"
            >
              <div className="mt-0.5 text-amber-400">
                {applyOnlySelected ? (
                  <CheckSquare className="w-4 h-4" />
                ) : (
                  <SquareIcon className="w-4 h-4 text-neutral-500" />
                )}
              </div>
              <div className="flex-1">
                <span className="text-xs font-black text-white block">
                  Apply Only To Selected Drawing
                </span>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Only the selected drawing (e.g. bouncing ball) is duplicated and animated into new frames. Background elements (ground, trees, sky) remain static!
                </p>
                <div className="mt-2 text-[10px] font-bold text-neutral-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                  Current Selection:{' '}
                  <span className="text-amber-300">
                    {selectedObjectId ? (selectedObjectName || 'Drawing selected') : 'None (Full Canvas mode)'}
                  </span>
                </div>
              </div>
            </button>
          </div>

          {/* Onion Skin Note */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs">
            <Eye className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>Onion skinning automatically displays your motion path as you work.</span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-4 border-t border-neutral-800 bg-neutral-850 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-neutral-400 hover:text-white font-bold text-xs hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={() => {
              onStart();
            }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-neutral-950 font-black text-xs uppercase tracking-wider transition-all cursor-pointer shadow-lg shadow-amber-500/20"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Recording</span>
          </button>
        </div>
      </div>
    </div>
  );
}
