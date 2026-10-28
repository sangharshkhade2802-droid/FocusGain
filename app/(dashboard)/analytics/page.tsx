'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { Flame, Clock, ShieldCheck, Trophy, Sparkles, TrendingUp, Calendar, Filter } from 'lucide-react';

export default function AnalyticsPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Daily focus minutes data
  const dailyFocusData = [
    { day: 'Mon', minutes: 140, target: 120 },
    { day: 'Tue', minutes: 195, target: 120 },
    { day: 'Wed', minutes: 210, target: 120 },
    { day: 'Thu', minutes: 165, target: 120 },
    { day: 'Fri', minutes: 240, target: 120 },
    { day: 'Sat', minutes: 180, target: 90 },
    { day: 'Sun', minutes: 130, target: 90 },
  ];

  // Category breakdown data
  const categoryData = [
    { name: 'Productive Deep Work', value: 72, color: '#6366f1' },
    { name: 'Distracting Blocked', value: 18, color: '#ec4899' },
    { name: 'Administrative / Review', value: 10, color: '#38bdf8' },
  ];

  // Weekly trend velocity data
  const weeklyTrendData = [
    { week: 'Week 1', focusHours: 12.5, score: 78 },
    { week: 'Week 2', focusHours: 16.0, score: 82 },
    { week: 'Week 3', focusHours: 19.5, score: 88 },
    { week: 'Week 4', focusHours: 21.0, score: 94 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            EXECUTIVE ANALYTICS
          </span>
          <span className="text-xs text-slate-400">Deep Work & Deflection Telemetry</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
          Cognitive Performance Analytics
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Measurable verification of deep work retention, feed shield blocks, and weekly focus trajectory.
        </p>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Total Focus Time</span>
            <h3 className="text-2xl font-bold text-white mt-1">21.0 hrs</h3>
            <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
              <TrendingUp className="w-3 h-3" /> +18% vs last week
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Current Focus Streak</span>
            <h3 className="text-2xl font-bold text-amber-400 mt-1">7 Days</h3>
            <span className="text-[11px] text-slate-400 font-medium mt-1">Personal Best: 14 days</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <Flame className="w-6 h-6 fill-amber-400" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">Addictive Feeds Deflected</span>
            <h3 className="text-2xl font-bold text-pink-400 mt-1">184 Shorts</h3>
            <span className="text-[11px] text-pink-300 font-medium mt-1">YT &bull; IG &bull; FB &bull; SC</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-pink-500/20 text-pink-400 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="p-5 rounded-3xl glass-card border border-white/10 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400">20-MCQ Mastery Avg</span>
            <h3 className="text-2xl font-bold text-emerald-400 mt-1">91.4%</h3>
            <span className="text-[11px] text-emerald-300 font-medium mt-1">Top 5% Cohort Tier</span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
            <Trophy className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Focus Time Bar Chart (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-card border border-white/10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-white">Daily Focus Minutes</h3>
              <p className="text-xs text-slate-400 mt-0.5">Focus time logged vs daily target threshold (120 mins)</p>
            </div>
            <span className="px-3 py-1 rounded-lg bg-slate-800 text-xs font-semibold text-slate-300">
              This Week
            </span>
          </div>

          <div className="h-64 w-full">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyFocusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="day" stroke="#64748b" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="minutes" name="Focus Minutes" fill="#6366f1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Donut Chart (1 col) */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Attention Allocation</h3>
            <p className="text-xs text-slate-400 mt-0.5">Productive time vs. deflected distractions</p>
          </div>

          <div className="h-52 w-full flex items-center justify-center my-2">
            {mounted && (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderColor: 'rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/5">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                  <span className="text-slate-300">{c.name}</span>
                </div>
                <span className="font-bold text-white">{c.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Weekly Trend Velocity Area Chart */}
      <div className="p-6 rounded-3xl glass-card border border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white">Cognitive Velocity & Quality Index</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Cumulative weekly deep work hours & 20-MCQ quality score trajectory
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Optimal Flow Zone
          </span>
        </div>

        <div className="h-60 w-full">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="focusGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="week" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="focusHours"
                  name="Focus Hours"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#focusGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
