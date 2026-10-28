'use client';

import React, { useState, useEffect } from 'react';
import { TimerCard, TimerMode } from '@/components/timer/TimerCard';
import { AmbientAudio } from '@/components/timer/AmbientAudio';
import { Sparkles, Shield, Flame, Target, Trophy, Clock, Zap } from 'lucide-react';
import Link from 'next/link';

export default function TimerPage() {
  const [activeTask, setActiveTask] = useState<string>('Deep Architectural Mastery & Distributed Systems');
  const [todayFocusMinutes, setTodayFocusMinutes] = useState<number>(125);
  const [sessionCount, setSessionCount] = useState<number>(5);

  useEffect(() => {
    try {
      const storedTarget = localStorage.getItem('focusgain_active_target');
      if (storedTarget) {
        setActiveTask(storedTarget);
      }
    } catch {}
  }, []);

  const handleSessionComplete = (duration: number, mode: TimerMode) => {
    setTodayFocusMinutes(prev => prev + duration);
    setSessionCount(prev => prev + 1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Welcome & Focus Shield Status Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl glass-panel border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              DEEP FOCUS STATION
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Chrome Shield Synced
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white">
            Command Your Concentration
          </h1>
          <p className="text-xs md:text-sm text-slate-300 mt-1 max-w-xl">
            Block doomscrolling reels and shorts, stream procedural ambient audio, and complete tasks verified with Gemini 20-MCQ quizzes.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center min-w-[90px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Today</span>
            <span className="text-lg font-bold text-white font-mono">{todayFocusMinutes}m</span>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 text-center min-w-[90px]">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Sprints</span>
            <span className="text-lg font-bold text-indigo-400 font-mono">{sessionCount}</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Timer on Left, Ambient Controls & Quick Tools on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Timer Card (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <TimerCard
            activeTaskName={activeTask}
            onSessionComplete={handleSessionComplete}
          />
        </div>

        {/* Right Column: Procedural Audio Mixer & Active Task Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Ambient Audio Player */}
          <AmbientAudio />

          {/* Quick Objective Card */}
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-400" /> Current Sprint Objective
              </h3>
              <Link
                href="/tasks"
                className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
              >
                Manage AI Tasks &rarr;
              </Link>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
              <span className="text-xs text-slate-400 block mb-1">Target Mission:</span>
              <p className="text-sm font-semibold text-white leading-snug">
                {activeTask}
              </p>
            </div>

            <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI verified task
              </span>
              <Link
                href="/rooms"
                className="text-slate-300 hover:text-white underline font-medium"
              >
                Join Study Room with peers
              </Link>
            </div>
          </div>

          {/* Extension Quick Launch Banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-indigo-950/30 to-purple-950/20 border border-indigo-500/20">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white">DeclarativeNetRequest Whitelist Active</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Distracting social feeds (Reels, Shorts, Explore) are automatically stripped from YouTube & Instagram.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
