'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Timer,
  Shield,
  Sparkles,
  Users,
  BarChart3,
  Flame,
  ArrowRight,
  CheckCircle2,
  Play,
  Volume2,
  Calendar,
  Lock,
  Compass,
  Cpu,
  Layers,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';
import { AmbientAudio } from '@/components/timer/AmbientAudio';

export default function LandingPage() {
  const [activeTab, setActiveTab] = useState<'timer' | 'ai' | 'rooms'>('timer');

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Navigation Header */}
      <header className="border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg glow-primary">
              ⚡
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">FocusGain</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold text-slate-300">
            <Link href="/timer" className="hover:text-white transition-colors">Focus Station</Link>
            <Link href="/tasks" className="hover:text-white transition-colors">AI Diagnostics</Link>
            <Link href="/rooms" className="hover:text-white transition-colors">Multiplayer Rooms</Link>
            <Link href="/analytics" className="hover:text-white transition-colors">Analytics</Link>
            <Link href="/planner" className="hover:text-white transition-colors">Chrono Planner</Link>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/timer"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold transition-all shadow-md glow-primary flex items-center gap-1.5"
            >
              Launch App <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden">
        {/* Glow backgrounds */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Gen Deep Focus & Gemini-Evaluated Learning</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
            Command Attention.{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Deflect Distractions.
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            FocusGain merges targeted feed filtering with DeclarativeNetRequest site blocking, Web Audio binaural beats, synchronized multiplayer study rooms, and Gemini AI 20-MCQ diagnostics.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/timer"
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-400 hover:to-pink-400 text-white font-bold text-sm shadow-xl glow-primary flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <Play className="w-4 h-4 fill-white" /> Start Deep Work Session
            </Link>

            <Link
              href="/rooms"
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-white/10 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Users className="w-4 h-4 text-indigo-400" /> Enter Live Study Room
            </Link>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-14 pt-8 border-t border-white/10 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto text-center">
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono block">100%</span>
              <span className="text-xs text-slate-400 mt-1 block">Shorts & Reels Blocked</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono block">20 MCQs</span>
              <span className="text-xs text-slate-400 mt-1 block">Auto-Generated Diagnostics</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-purple-400 font-mono block">&lt; 15ms</span>
              <span className="text-xs text-slate-400 mt-1 block">Realtime Room Sync</span>
            </div>
            <div>
              <span className="text-2xl sm:text-3xl font-extrabold text-pink-400 font-mono block">Manifest V3</span>
              <span className="text-xs text-slate-400 mt-1 block">DeclarativeNetRequest Whitelist</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Platform Preview Section */}
      <section className="py-16 bg-[#060a14] border-y border-white/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              The Architecture of High-Cognitive Retention
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2">
              Explore the four core modules powering the FocusGain platform.
            </p>

            {/* Interactive Tab Selector */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <button
                onClick={() => setActiveTab('timer')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'timer'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                1. Focus & Procedural Audio
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'ai'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                2. AI Task Scoring & 20 MCQs
              </button>
              <button
                onClick={() => setActiveTab('rooms')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === 'rooms'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                3. Live Multiplayer Rooms
              </button>
            </div>
          </div>

          {/* Tab Content Cards */}
          {activeTab === 'timer' && (
            <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 animate-in fade-in duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                <div className="space-y-4">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    MODULE B: FOCUS TIMERS
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    Pomodoro, Strict Mode, and Procedural Web Audio
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    Customizable Pomodoro cycles with smooth circular SVG progress rings. Integrated Web Audio synthesizer provides real-time pink-noise rain, 10Hz alpha binaural beats, and lo-fi chords with zero external dependencies.
                  </p>
                  <ul className="space-y-2 text-xs text-slate-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Customizable 25/5, 50/10 intervals & Stopwatch</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Tab switch penalty detection in Strict Lockdown</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Automated logging to Supabase focus sessions</span>
                    </li>
                  </ul>
                  <Link
                    href="/timer"
                    className="inline-flex items-center gap-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 pt-2"
                  >
                    Open Focus Station &rarr;
                  </Link>
                </div>

                <div>
                  <AmbientAudio />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ai' && (
            <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 animate-in fade-in duration-300">
              <div className="space-y-4 max-w-2xl mx-auto text-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  MODULE D: GEMINI COGNITIVE ENGINE
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Intelligent Task Scoring (1-10) & 20-MCQ Retention Diagnostics
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Submit up to 10 study tasks. Gemini filters out shallow busywork scoring below 5 and suggests replacements. Once you mark an objective "Done", Gemini synthesizes a rigorous 20-question multiple-choice diagnostic to measure your real understanding.
                </p>
                <div className="pt-4 flex justify-center">
                  <Link
                    href="/tasks"
                    className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-xs font-bold shadow-md glow-primary"
                  >
                    Try AI Task Evaluator &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rooms' && (
            <div className="rounded-3xl glass-card p-6 sm:p-8 border border-white/10 animate-in fade-in duration-300">
              <div className="space-y-4 max-w-2xl mx-auto text-center">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  MODULE C: REALTIME MULTIPLAYER
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white">
                  Synchronized Study Rooms with Live Presence
                </h3>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Join co-working rooms powered by Supabase Realtime WebSockets. See peer focus states ('focusing', 'break', 'idle'), exchange quiet emoji reactions, and build collaborative focus streaks.
                </p>
                <div className="pt-4 flex justify-center">
                  <Link
                    href="/rooms"
                    className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md glow-emerald"
                  >
                    Browse Active Focus Rooms &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Chrome Extension Module Showcase */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-panel border border-indigo-500/30 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-indigo-400" />
                <span className="text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  Module A: Manifest V3 Extension
                </span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white leading-tight">
                Surgical Feed Filter & DeclarativeNetRequest Whitelist
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                The included browser extension runs DOM mutation observers across Instagram, YouTube, Facebook, and Snapchat to hide Shorts and Reels while leaving search, messages, and legitimate videos untouched.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <strong className="text-white block font-semibold">Feed Shield</strong>
                  <span className="text-[11px] text-slate-400">Drops #shorts-container & reels shelves</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5">
                  <strong className="text-white block font-semibold">Study Whitelist</strong>
                  <span className="text-[11px] text-slate-400">Strict dynamic DNR traffic drops</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-[#090e1a] border border-white/10 font-mono text-xs text-slate-300 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-white/10 text-slate-400">
                <span>extension/content.js</span>
                <span className="text-emerald-400 font-bold">READY TO LOAD</span>
              </div>
              <p className="text-slate-400">
                // Target platforms: YouTube, Instagram, Facebook, Snapchat
              </p>
              <div className="p-3 rounded-lg bg-slate-950 text-indigo-300">
                ytd-reel-shelf-renderer, #shorts-container &#123; display: none !important; &#125;<br />
                a[href*="/reels/"], svg[aria-label="Reels"] &#123; display: none !important; &#125;
              </div>
              <p className="text-slate-400">
                Load in Chrome via <code>chrome://extensions</code> &rarr; <em>Load unpacked</em> &rarr; select <code>/extension</code> folder.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
              ⚡
            </div>
            <div>
              <span className="font-bold text-white text-base">FocusGain Web</span>
              <span className="text-xs text-slate-500 block">Enterprise Cognitive Platform</span>
            </div>
          </div>

          <div className="flex items-center gap-6 text-xs text-slate-400">
            <Link href="/timer" className="hover:text-white">Timer</Link>
            <Link href="/tasks" className="hover:text-white">AI Tasks & Quizzes</Link>
            <Link href="/rooms" className="hover:text-white">Multiplayer Rooms</Link>
            <Link href="/analytics" className="hover:text-white">Analytics</Link>
            <Link href="/planner" className="hover:text-white">Chrono Planner</Link>
          </div>

          <span className="text-xs text-slate-500">
            &copy; 2026 FocusGain Architecture. All rights reserved.
          </span>
        </div>
      </footer>
    </div>
  );
}
