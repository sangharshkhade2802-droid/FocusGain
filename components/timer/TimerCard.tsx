'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Maximize2, Minimize2, Bell, CheckCircle2, Flame, ShieldAlert, Sparkles, Target } from 'lucide-react';
import { formatTime } from '@/lib/utils';
import confetti from 'canvas-confetti';

export type TimerMode = 'pomodoro' | 'stopwatch' | 'strict';
export type PomodoroPhase = 'focus' | 'short_break' | 'long_break';

interface TimerCardProps {
  onSessionComplete?: (durationMinutes: number, mode: TimerMode) => void;
  activeTaskName?: string;
}

export const TimerCard: React.FC<TimerCardProps> = ({
  onSessionComplete,
  activeTaskName,
}) => {
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [phase, setPhase] = useState<PomodoroPhase>('focus');
  
  // Durations in minutes
  const [focusDuration, setFocusDuration] = useState<number>(25);
  const [shortBreakDuration, setShortBreakDuration] = useState<number>(5);
  const [longBreakDuration, setLongBreakDuration] = useState<number>(15);

  // Remaining time in seconds
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [totalTime, setTotalTime] = useState<number>(25 * 60);
  
  // Stopwatch elapsed seconds
  const [stopwatchSeconds, setStopwatchSeconds] = useState<number>(0);
  const [laps, setLaps] = useState<number[]>([]);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [pomodoroCount, setPomodoroCount] = useState<number>(0);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [strictDistractionWarnings, setStrictDistractionWarnings] = useState<number>(0);

  const containerRef = useRef<HTMLDivElement>(null);
  const audioChimeRef = useRef<AudioContext | null>(null);

  // Play pleasant chime
  const playChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880.0, ctx.currentTime + 0.3); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch (e) {
      console.error(e);
    }
  };

  // Sync timer when phase or duration changes
  useEffect(() => {
    if (mode === 'pomodoro') {
      let mins = focusDuration;
      if (phase === 'short_break') mins = shortBreakDuration;
      if (phase === 'long_break') mins = longBreakDuration;
      setTimeLeft(mins * 60);
      setTotalTime(mins * 60);
      setIsRunning(false);
    } else if (mode === 'strict') {
      setTimeLeft(focusDuration * 60);
      setTotalTime(focusDuration * 60);
      setIsRunning(false);
    } else if (mode === 'stopwatch') {
      setIsRunning(false);
    }
  }, [mode, phase, focusDuration, shortBreakDuration, longBreakDuration]);

  // Main countdown / stopwatch loop
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning) {
      interval = setInterval(() => {
        if (mode === 'stopwatch') {
          setStopwatchSeconds(prev => prev + 1);
        } else {
          setTimeLeft(prev => {
            if (prev <= 1) {
              handleTimerFinished();
              return 0;
            }
            return prev - 1;
          });
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, mode]);

  // Tab switch listener for Strict Mode
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (mode === 'strict' && isRunning && document.hidden) {
        setStrictDistractionWarnings(prev => prev + 1);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [mode, isRunning]);

  const handleTimerFinished = () => {
    setIsRunning(false);
    playChime();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    const sessionMinutes = Math.max(1, Math.round(totalTime / 60));
    if (onSessionComplete) {
      onSessionComplete(sessionMinutes, mode);
    }

    if (mode === 'pomodoro') {
      if (phase === 'focus') {
        const nextCount = pomodoroCount + 1;
        setPomodoroCount(nextCount);
        if (nextCount % 4 === 0) {
          setPhase('long_break');
        } else {
          setPhase('short_break');
        }
      } else {
        setPhase('focus');
      }
    }
  };

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    if (mode === 'stopwatch') {
      setStopwatchSeconds(0);
      setLaps([]);
    } else {
      setTimeLeft(totalTime);
    }
  };

  const recordLap = () => {
    if (mode === 'stopwatch' && isRunning) {
      setLaps(prev => [stopwatchSeconds, ...prev]);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(console.error);
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(console.error);
      setIsFullscreen(false);
    }
  };

  // SVG Progress Ring calculations
  const radius = 120;
  const circumference = 2 * Math.PI * radius;
  const progressRatio = totalTime > 0 ? (totalTime - timeLeft) / totalTime : 0;
  const strokeDashoffset = circumference - progressRatio * circumference;

  const currentSeconds = mode === 'stopwatch' ? stopwatchSeconds : timeLeft;

  return (
    <div
      ref={containerRef}
      className={`relative rounded-3xl glass-card p-6 md:p-8 flex flex-col items-center justify-between transition-all ${
        isFullscreen ? 'fixed inset-0 z-50 bg-[#030712] justify-center' : 'w-full'
      }`}
    >
      {/* Mode Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/80 border border-white/5 mb-6">
        <button
          onClick={() => { setMode('pomodoro'); setPhase('focus'); }}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'pomodoro'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pomodoro (25/5)
        </button>
        <button
          onClick={() => setMode('stopwatch')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'stopwatch'
              ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Open Stopwatch
        </button>
        <button
          onClick={() => setMode('strict')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
            mode === 'strict'
              ? 'bg-gradient-to-r from-rose-500 to-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Strict Lockdown
        </button>
      </div>

      {/* Pomodoro Sub-Phases */}
      {mode === 'pomodoro' && (
        <div className="flex items-center gap-2 mb-4">
          <button
            onClick={() => setPhase('focus')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              phase === 'focus'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Focus Sprint
          </button>
          <button
            onClick={() => setPhase('short_break')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              phase === 'short_break'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Short Break
          </button>
          <button
            onClick={() => setPhase('long_break')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              phase === 'long_break'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            Long Break
          </button>
        </div>
      )}

      {/* Active Objective Pill */}
      <div className="flex items-center gap-2 mb-6 px-4 py-1.5 rounded-full bg-slate-900/60 border border-white/5 text-xs text-slate-300">
        <Target className="w-3.5 h-3.5 text-indigo-400" />
        <span>Objective:</span>
        <span className="font-semibold text-white">
          {activeTaskName || 'High-Cognitive Focus Sprint'}
        </span>
      </div>

      {/* Circular SVG Progress Ring */}
      <div className="relative flex items-center justify-center my-2">
        <svg className="w-72 h-72 transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="144"
            cy="144"
            r={radius}
            stroke="currentColor"
            strokeWidth="12"
            fill="transparent"
            className="text-slate-800/80"
          />
          {/* Animated Progress Ring */}
          {mode !== 'stopwatch' && (
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth="12"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              fill="transparent"
              className="transition-all duration-1000 ease-linear"
            />
          )}
          {mode === 'stopwatch' && isRunning && (
            <circle
              cx="144"
              cy="144"
              r={radius}
              stroke="url(#timerGradient)"
              strokeWidth="12"
              strokeDasharray={`${circumference / 6} ${circumference / 6}`}
              strokeLinecap="round"
              fill="transparent"
              className="animate-spin"
              style={{ animationDuration: '4s' }}
            />
          )}
          {/* Gradient Definition */}
          <defs>
            <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Center Display */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="text-5xl md:text-6xl font-bold tracking-tight text-white font-mono drop-shadow-md">
            {formatTime(currentSeconds)}
          </span>
          <span className="text-xs uppercase tracking-wider text-slate-400 mt-2 font-medium">
            {mode === 'stopwatch'
              ? 'Elapsed'
              : phase === 'focus'
              ? 'Focus Sprint'
              : 'Recharge Interval'}
          </span>
          {pomodoroCount > 0 && mode === 'pomodoro' && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-400">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>{pomodoroCount} completed</span>
            </div>
          )}
        </div>
      </div>

      {/* Strict Mode Distraction Alert */}
      {mode === 'strict' && strictDistractionWarnings > 0 && (
        <div className="mt-3 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs animate-bounce">
          <ShieldAlert className="w-4 h-4 text-rose-400" />
          <span>Tab switches detected: {strictDistractionWarnings}</span>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex items-center gap-4 mt-8">
        <button
          onClick={resetTimer}
          className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/5"
          title="Reset"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        <button
          onClick={toggleTimer}
          className={`px-8 py-3.5 rounded-2xl font-semibold flex items-center gap-2 text-sm transition-all transform active:scale-95 shadow-xl ${
            isRunning
              ? 'bg-amber-600 hover:bg-amber-500 text-white glow-primary'
              : 'bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 text-white glow-primary'
          }`}
        >
          {isRunning ? (
            <>
              <Pause className="w-5 h-5" /> Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 fill-white" /> Start Flow
            </>
          )}
        </button>

        {mode === 'stopwatch' ? (
          <button
            onClick={recordLap}
            disabled={!isRunning}
            className="px-4 py-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/5 text-xs font-semibold disabled:opacity-40"
          >
            Lap Split
          </button>
        ) : (
          <button
            onClick={toggleFullscreen}
            className="p-3.5 rounded-2xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/5"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen Zen Mode'}
          >
            {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
          </button>
        )}
      </div>

      {/* Stopwatch Laps Record */}
      {mode === 'stopwatch' && laps.length > 0 && (
        <div className="w-full max-w-sm mt-6 border-t border-white/10 pt-4">
          <h4 className="text-xs font-semibold text-slate-400 mb-2">Split Intervals</h4>
          <div className="max-h-24 overflow-y-auto space-y-1">
            {laps.map((lapSec, i) => (
              <div key={i} className="flex justify-between text-xs text-slate-300 px-2 py-1 rounded bg-slate-900/40">
                <span>Interval #{laps.length - i}</span>
                <span className="font-mono">{formatTime(lapSec)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
