// @ts-nocheck
import React, { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  Square, 
  Repeat, 
  Plus, 
  Trash2, 
  Copy, 
  FileText, 
  Settings, 
  Eye, 
  EyeOff,
  GitPullRequest,
  Maximize,
  Sparkles,
  Clock
} from 'lucide-react';
import CustomSelect from './CustomSelect';

interface TimelineProps {
  frames: any[];
  currentFrameIndex: number;
  setCurrentFrameIndex: React.Dispatch<React.SetStateAction<number>>;
  addFrame: () => void;
  deleteFrame: (idx: number) => void;
  duplicateFrame: (idx: number) => void;
  copyFrame: (idx: number) => void;
  pasteFrame: (idx: number) => void;
  onionSkinEnabled: boolean;
  setOnionSkinEnabled: (enabled: boolean) => void;
  showBones: boolean;
  setShowBones: (enabled: boolean) => void;
  batchAddFrames: (count: number) => void;
  fps: number;
  setFps: (fps: number) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  isRecording?: boolean;
  autoTween: boolean;
  setAutoTween: (enabled: boolean) => void;
  showCanvasSizePanel?: boolean;
  setShowCanvasSizePanel?: (show: boolean) => void;
  autoFramesActive?: boolean;
  onToggleAutoFrames?: () => void;
  autoFramesStatus?: 'idle' | 'countdown' | 'recording' | 'paused';
  autoFramesDelay?: number;
  setAutoFramesDelay?: (seconds: number) => void;
  autoFramesCountdown?: number;
  autoFramesTimeRemaining?: number;
  onStartAutoFrames?: () => void;
  onPauseAutoFrames?: () => void;
  onResumeAutoFrames?: () => void;
  onStopAutoFrames?: () => void;
  style?: React.CSSProperties;
}

function Timeline({
  frames,
  currentFrameIndex,
  setCurrentFrameIndex,
  addFrame,
  deleteFrame,
  duplicateFrame,
  copyFrame,
  pasteFrame,
  onionSkinEnabled,
  setOnionSkinEnabled,
  showBones,
  setShowBones,
  batchAddFrames,
  fps,
  setFps,
  isPlaying,
  setIsPlaying,
  isRecording = false,
  autoTween = false,
  setAutoTween,
  showCanvasSizePanel = false,
  setShowCanvasSizePanel,
  autoFramesActive = false,
  onToggleAutoFrames,
  autoFramesStatus = 'idle',
  autoFramesDelay = 3,
  setAutoFramesDelay,
  autoFramesCountdown = 3,
  autoFramesTimeRemaining = 3,
  onStartAutoFrames,
  onPauseAutoFrames,
  onResumeAutoFrames,
  onStopAutoFrames,
  style,
}: TimelineProps) {
  const [loopEnabled, setLoopEnabled] = useState(true);
  const [copiedFrameIndex, setCopiedFrameIndex] = useState<number | null>(null);
  const [onionConfigOpen, setOnionConfigOpen] = useState(false);
  const [onionPrev, setOnionPrev] = useState(1);
  const [onionNext, setOnionNext] = useState(0);
  const [batchCount, setBatchCount] = useState<number>(20);

  const playbackTimerRef = useRef<any>(null);
  const currentFrameIndexRef = useRef(currentFrameIndex);
  currentFrameIndexRef.current = currentFrameIndex;

  // Playback timer handling
  useEffect(() => {
    if (!isPlaying) {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
      return;
    }

    const intervalMs = 1000 / fps;
    playbackTimerRef.current = setInterval(() => {
      try {
        const curr = currentFrameIndexRef.current;
        if (curr >= frames.length - 1) {
          if (loopEnabled && !isRecording) {
            setCurrentFrameIndex(0);
          } else {
            if (playbackTimerRef.current) {
              clearInterval(playbackTimerRef.current);
              playbackTimerRef.current = null;
            }
            setIsPlaying(false);
          }
        } else {
          setCurrentFrameIndex(curr + 1);
        }
      } catch (err) {
        console.error("Playback loop error caught safely:", err);
        if (playbackTimerRef.current) {
          clearInterval(playbackTimerRef.current);
          playbackTimerRef.current = null;
        }
        setIsPlaying(false);
      }
    }, intervalMs);

    return () => {
      if (playbackTimerRef.current) {
        clearInterval(playbackTimerRef.current);
        playbackTimerRef.current = null;
      }
    };
  }, [isPlaying, fps, frames.length, loopEnabled, isRecording, setCurrentFrameIndex, setIsPlaying]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentFrameIndex(0);
  };

  const handleCopy = (idx: number) => {
    copyFrame(idx);
    setCopiedFrameIndex(idx);
  };

  const handlePaste = (idx: number) => {
    pasteFrame(idx);
  };

  return (
    <div style={style} className="bg-neutral-950 border-t-2 border-neutral-800 p-3 shrink-0 flex flex-col gap-3 font-bold select-none overflow-y-auto">
      {/* Playback Controls & Frame Rate Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Playback Buttons */}
        <div className="flex items-center gap-2 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
          <button
            onClick={handlePlayPause}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${
              isPlaying 
                ? 'bg-amber-500 text-neutral-950 hover:bg-amber-400 shadow-md scale-105' 
                : 'hover:bg-neutral-800 text-neutral-200 hover:text-white'
            }`}
            title={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause className="w-5 h-5 fill-current stroke-[2.5]" /> : <Play className="w-5 h-5 fill-current stroke-[2.5]" />}
          </button>
          <button
            onClick={handleStop}
            className="p-2.5 rounded-xl hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors cursor-pointer"
            title="Stop & Reset to First Frame"
          >
            <Square className="w-5 h-5 fill-current stroke-[2.5]" />
          </button>
          <div className="w-[2px] h-7 bg-neutral-800 mx-1"></div>
          <button
            onClick={() => setLoopEnabled(!loopEnabled)}
            className={`p-2.5 rounded-xl transition-colors cursor-pointer border-2 ${
              loopEnabled 
                ? 'text-amber-300 bg-amber-500/20 border-amber-400/60 shadow-sm' 
                : 'text-neutral-400 hover:bg-neutral-800 hover:text-neutral-200 border-transparent'
            }`}
            title="Toggle Loop"
          >
            <Repeat className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Frame Actions (Copy, Paste, Duplicate, Delete) */}
        <div className="flex items-center gap-2 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
          <span className="text-xs text-amber-400 font-black tracking-wider uppercase px-2 font-mono">#{currentFrameIndex + 1}</span>
          <div className="w-[2px] h-7 bg-neutral-800 mx-1"></div>
          <button
            type="button"
            onClick={() => handleCopy(currentFrameIndex)}
            className="px-3 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 hover:text-white transition-all text-xs flex items-center gap-2 cursor-pointer font-black border border-neutral-700/60"
            title="Copy current frame nodes"
          >
            <Copy className="w-4.5 h-4.5 stroke-[2.4]" />
            <span className="text-xs font-black inline">Copy</span>
          </button>
          <button
            type="button"
            onClick={() => handlePaste(currentFrameIndex)}
            disabled={copiedFrameIndex === null}
            className={`px-3 py-2 rounded-xl hover:bg-neutral-800 text-neutral-200 hover:text-white transition-all text-xs flex items-center gap-2 cursor-pointer font-black border border-neutral-700/60 ${
              copiedFrameIndex === null ? 'opacity-30 cursor-not-allowed' : ''
            }`}
            title="Paste copied nodes into current frame"
          >
            <FileText className="w-4.5 h-4.5 stroke-[2.4]" />
            <span className="text-xs font-black inline">Paste</span>
          </button>
          <button
            type="button"
            onClick={() => duplicateFrame(currentFrameIndex)}
            className="px-3.5 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 hover:text-amber-200 transition-all text-xs flex items-center gap-2 cursor-pointer font-black border-2 border-amber-500/40"
            title="Duplicate current frame"
          >
            <Plus className="w-5 h-5 stroke-[2.6]" />
            <span className="text-xs font-black inline">Duplicate</span>
          </button>
          {frames.length > 1 && (
            <button
              type="button"
              onClick={() => deleteFrame(currentFrameIndex)}
              className="px-3 py-2 rounded-xl hover:bg-rose-950/60 text-rose-400 hover:text-rose-300 transition-all text-xs flex items-center gap-2 cursor-pointer font-black border border-rose-500/30"
              title="Delete current frame"
            >
              <Trash2 className="w-4.5 h-4.5 stroke-[2.4]" />
              <span className="text-xs font-black inline">Delete</span>
            </button>
          )}
        </div>

        {/* Center: Onion Skinning, Bones, Auto-Tween & AutoFrames */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <div className="flex items-center gap-1.5 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => setOnionSkinEnabled(!onionSkinEnabled)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border-2 ${
                onionSkinEnabled 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60' 
                  : 'text-neutral-300 hover:bg-neutral-800 border-transparent'
              }`}
            >
              {onionSkinEnabled ? <Eye className="w-4.5 h-4.5 shrink-0 stroke-[2.4]" /> : <EyeOff className="w-4.5 h-4.5 shrink-0 stroke-[2.4]" />}
              <span className="text-xs font-black">ONION SKIN</span>
            </button>
            <button
              onClick={() => setOnionConfigOpen(!onionConfigOpen)}
              className={`p-2 rounded-xl hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors cursor-pointer ${
                onionConfigOpen ? 'text-amber-400 bg-neutral-800' : ''
              }`}
              title="Onion Skin Config"
            >
              <Settings className="w-4.5 h-4.5 stroke-[2.4]" />
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => setAutoTween(!autoTween)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border-2 ${
                autoTween 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                  : 'text-neutral-300 hover:bg-neutral-800 border-transparent'
              }`}
              title="Toggle real-time automatic tweening interpolation between keyframes"
            >
              <Sparkles className="w-4.5 h-4.5 shrink-0 stroke-[2.4]" />
              <span className="text-xs font-black">AUTO-TWEEN</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => setShowBones(!showBones)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border-2 ${
                showBones 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                  : 'text-neutral-300 hover:bg-neutral-800 border-transparent'
              }`}
              title="Show or hide rigged bones skeleton overlay on canvas"
            >
              <GitPullRequest className="w-4.5 h-4.5 shrink-0 stroke-[2.4]" />
              <span className="text-xs font-black">{showBones ? 'HIDE BONES' : 'SHOW BONES'}</span>
            </button>
          </div>

          {/* AUTO FRAMES BUTTON */}
          <div className="flex items-center bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => onToggleAutoFrames?.()}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-black transition-all cursor-pointer border-2 ${
                autoFramesActive || autoFramesStatus !== 'idle'
                  ? 'bg-amber-500 text-neutral-950 border-amber-200 shadow-[0_0_24px_rgba(245,158,11,0.7)] ring-2 ring-amber-400/80 scale-[1.04]' 
                  : 'text-neutral-200 hover:text-white hover:bg-neutral-800 border-transparent'
              }`}
              title="Auto Frames: Automatically add frames at timed intervals as you transform drawings on canvas"
            >
              <Clock className={`w-5 h-5 shrink-0 stroke-[2.6] ${autoFramesActive || autoFramesStatus !== 'idle' ? 'text-neutral-950' : 'text-amber-400'}`} />
              <span className="text-sm tracking-wider font-black">AUTO FRAMES</span>
              {autoFramesStatus === 'recording' && (
                <span className="relative flex h-3.5 w-3.5 ml-1">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-rose-600 ring-2 ring-white"></span>
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border-2 border-neutral-750 p-1.5 rounded-2xl shadow-md">
            <button
              onClick={() => setShowCanvasSizePanel?.(!showCanvasSizePanel)}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-black transition-colors cursor-pointer border-2 ${
                showCanvasSizePanel 
                  ? 'bg-amber-500/20 text-amber-300 border-amber-400/60' 
                  : 'text-neutral-300 hover:bg-neutral-800 border-transparent'
              }`}
              title="Set custom canvas width and height"
            >
              <Maximize className="w-4.5 h-4.5 shrink-0 stroke-[2.4] text-amber-400" />
              <span className="text-xs font-black">CANVAS SIZE</span>
            </button>
          </div>

          {/* Quick Onion Overlay */}
          {onionConfigOpen && (
            <div className="absolute bottom-32 left-1/2 -translate-x-1/2 bg-neutral-900 border-2 border-neutral-700 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-5 text-xs text-neutral-300 animate-fade-in">
              <div className="flex flex-col gap-1.5">
                <span className="font-black text-neutral-300 uppercase tracking-wider text-[11px]">PREVIOUS FRAMES</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={onionPrev}
                  onChange={(e) => setOnionPrev(Number(e.target.value))}
                  className="w-28 accent-amber-500 cursor-pointer h-2"
                />
                <span className="text-right text-xs text-amber-400 font-mono font-black">{onionPrev} frames</span>
              </div>
              <div className="flex flex-col gap-1.5">
                <span className="font-black text-neutral-300 uppercase tracking-wider text-[11px]">NEXT FRAMES</span>
                <input
                  type="range"
                  min="0"
                  max="5"
                  value={onionNext}
                  onChange={(e) => setOnionNext(Number(e.target.value))}
                  className="w-28 accent-amber-500 cursor-pointer h-2"
                />
                <span className="text-right text-xs text-amber-400 font-mono font-black">{onionNext} frames</span>
              </div>
            </div>
          )}
        </div>

        {/* Right: FPS presets & slider */}
        <div className="flex items-center gap-2 sm:gap-3 bg-neutral-900 border-2 border-neutral-750 px-3.5 py-1.5 rounded-2xl text-xs text-neutral-200 shadow-md">
          <span className="text-neutral-400 font-black tracking-wider uppercase hidden md:inline text-xs">SPEED</span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFps(12)}
              className={`px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer transition-colors border-2 ${
                fps === 12 ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-sm' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              12
            </button>
            <button
              onClick={() => setFps(24)}
              className={`px-2.5 py-1 rounded-xl font-black text-xs cursor-pointer transition-colors border-2 ${
                fps === 24 ? 'bg-amber-500 text-neutral-950 border-amber-300 shadow-sm' : 'text-neutral-300 hover:bg-neutral-800 hover:text-white border-transparent'
              }`}
            >
              24
            </button>
          </div>
          <input
            type="range"
            min="6"
            max="60"
            step="1"
            value={fps}
            onChange={(e) => setFps(Number(e.target.value))}
            className="w-16 sm:w-24 accent-amber-500 cursor-pointer h-2"
          />
          <span className="font-black text-amber-300 w-14 text-right text-xs font-mono">{fps} FPS</span>
        </div>
      </div>

      {/* DOWNSIDE AUTOFRAMES SECONDS & CONTROLS ROW - CLEARLY VISIBLE BELOW AUTOFRAMES BUTTON IN DOWNSIDE SPACE, NEVER HIDDEN */}
      {autoFramesActive && (
        <div 
          id="autoframes-downside-options" 
          className="w-full bg-neutral-900 border-2 border-amber-400 p-3.5 rounded-2xl shadow-2xl flex flex-wrap items-center justify-between gap-3.5 animate-fade-in text-white shrink-0 z-30"
        >
          {/* Label and Badge */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 bg-amber-500 text-neutral-950 px-3 py-1.5 rounded-xl font-black text-xs uppercase tracking-wider shadow-md">
              <Clock className="w-4.5 h-4.5 stroke-[2.6]" />
              <span>AutoFrames Seconds</span>
            </div>
            <span className="font-mono text-sm font-black text-amber-300 bg-neutral-950 px-3 py-1.5 rounded-xl border-2 border-amber-500/60 shadow-inner">
              {autoFramesDelay} SECONDS
            </span>
          </div>

          {/* Quick Preset Buttons - Bigger and thick */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-neutral-400 font-black uppercase tracking-wider mr-1 hidden sm:inline">Presets:</span>
            {[2, 3, 5, 10, 15].map((sec) => (
              <button
                key={sec}
                type="button"
                onClick={() => setAutoFramesDelay?.(sec)}
                className={`h-9 px-3.5 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                  autoFramesDelay === sec
                    ? 'bg-amber-500 text-neutral-950 border-amber-200 shadow-md scale-105'
                    : 'bg-neutral-800 hover:bg-neutral-700 text-neutral-200 border-neutral-700'
                }`}
              >
                {sec}s
              </button>
            ))}
          </div>

          {/* Slider */}
          <div className="flex items-center gap-2.5 min-w-[180px] sm:min-w-[220px] flex-1 max-w-xs">
            <span className="text-xs text-neutral-400 font-black">2s</span>
            <input
              type="range"
              min="2"
              max="15"
              step="1"
              value={autoFramesDelay}
              onChange={(e) => setAutoFramesDelay?.(Number(e.target.value))}
              className="w-full accent-amber-500 cursor-pointer h-2.5 rounded-lg bg-neutral-800"
            />
            <span className="text-xs text-neutral-400 font-black">15s</span>
          </div>

          {/* Action Control Buttons */}
          <div className="flex items-center gap-2">
            {autoFramesStatus === 'idle' ? (
              <button
                type="button"
                onClick={onStartAutoFrames}
                className="h-10 px-4 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs uppercase rounded-xl tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg border-2 border-amber-300 active:scale-95"
              >
                <Play className="w-4 h-4 fill-current stroke-[2.4]" />
                Start Auto Frames ({autoFramesDelay}s)
              </button>
            ) : autoFramesStatus === 'countdown' ? (
              <div className="h-10 px-4 flex items-center justify-center font-black text-amber-400 text-xs bg-neutral-950 rounded-xl border-2 border-amber-500/50 animate-pulse">
                Starting in {autoFramesCountdown}s...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {autoFramesStatus === 'recording' ? (
                  <button
                    type="button"
                    onClick={onPauseAutoFrames}
                    className="h-10 px-3.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border-2 border-neutral-600 cursor-pointer"
                  >
                    <Pause className="w-4 h-4 fill-current" />
                    Pause ({autoFramesTimeRemaining}s)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onResumeAutoFrames}
                    className="h-10 px-3.5 bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border-2 border-amber-300 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    Resume
                  </button>
                )}
                <button
                  type="button"
                  onClick={onStopAutoFrames}
                  className="h-10 px-3.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl flex items-center justify-center gap-1.5 border-2 border-rose-400 cursor-pointer"
                >
                  <Square className="w-4 h-4 fill-current" />
                  Stop
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Frame Cells Row */}
      <div className="flex items-center gap-2.5 overflow-x-auto py-1.5 pr-12 scrollbar-thin select-none">
        {frames.map((frame, index) => {
          const isActive = index === currentFrameIndex;
          const isCopied = index === copiedFrameIndex;
          return (
            <div
              key={index}
              onClick={() => {
                setIsPlaying(false);
                setCurrentFrameIndex(index);
              }}
              className={`group min-w-[76px] h-20 rounded-2xl border-2 flex flex-col justify-between p-2.5 cursor-pointer transition-all relative shrink-0 shadow-md ${
                isActive
                  ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.3)] scale-[1.03]'
                  : 'bg-neutral-900/90 hover:bg-neutral-900 border-neutral-750 hover:border-neutral-600'
              }`}
            >
              {/* Frame Label */}
              <div className="flex items-center justify-between">
                <span className={`text-xs sm:text-sm font-mono ${isActive ? 'text-amber-300 font-black' : 'text-neutral-300 font-bold'}`}>
                  #{index + 1}
                </span>
                {frame.objects && Object.keys(frame.objects).length > 0 && (
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm" title="Has keyframe transforms"></span>
                )}
              </div>

              {/* Indicator info */}
              <span className="text-[10px] text-neutral-400 block text-right select-none font-black font-mono">
                {frame.objects ? Object.keys(frame.objects).length : 0} nodes
              </span>
            </div>
          );
        })}

        {/* Append Frame Button */}
        <button
          onClick={addFrame}
          className="min-w-[76px] h-20 rounded-2xl border-2 border-dashed border-neutral-600 hover:border-amber-400 bg-neutral-900/60 hover:bg-neutral-900 flex items-center justify-center text-neutral-200 hover:text-amber-300 transition-all cursor-pointer shrink-0 shadow-md"
          title="Add New Frame"
        >
          <Plus className="w-7 h-7 stroke-[2.6]" />
        </button>

        {/* Batch Add Frames Section */}
        <div className="flex items-center gap-2 bg-neutral-900 border-2 border-neutral-750 p-2.5 rounded-2xl shrink-0 h-20 shadow-md">
          <div className="flex flex-col justify-center min-w-32">
            <span className="text-[10px] text-neutral-300 font-black uppercase tracking-wider mb-1">Batch Add</span>
            <CustomSelect
              value={String(batchCount)}
              onChange={(val) => setBatchCount(Number(val))}
              options={[
                { value: "10", label: "10 Frames" },
                { value: "20", label: "20 Frames" },
                { value: "30", label: "30 Frames" },
                { value: "40", label: "40 Frames" },
                { value: "50", label: "50 Frames" },
                { value: "100", label: "100 Frames" }
              ]}
              placeholder="Batch Count"
              className="w-full"
            />
          </div>
          <button
            onClick={() => {
              batchAddFrames(batchCount);
            }}
            className="h-9 px-4 rounded-xl bg-amber-500 text-neutral-950 hover:bg-amber-400 font-black text-xs transition-all flex items-center justify-center self-end cursor-pointer shadow-md border-2 border-amber-300 active:scale-95"
          >
            ADD
          </button>
        </div>
      </div>
    </div>
  );
}

export default React.memo(Timeline);
