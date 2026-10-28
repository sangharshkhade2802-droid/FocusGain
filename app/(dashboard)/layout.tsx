'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Timer,
  CheckSquare,
  Users,
  BarChart3,
  Calendar,
  Shield,
  Flame,
  Volume2,
  Sparkles,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Focus Station', href: '/timer', icon: Timer },
  { name: 'AI Tasks & Quizzes', href: '/tasks', icon: CheckSquare },
  { name: 'Multiplayer Rooms', href: '/rooms', icon: Users },
  { name: 'Analytics Telemetry', href: '/analytics', icon: BarChart3 },
  { name: 'Schedule Planner', href: '/planner', icon: Calendar },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#030712] flex flex-col md:flex-row text-slate-100">
      {/* Mobile Header Bar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-white/10 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-white shadow-md">
            ⚡
          </div>
          <span className="font-bold text-white text-base">FocusGain</span>
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-xl bg-slate-800 text-slate-300"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#080d1a] border-r border-white/10 flex flex-col justify-between p-4 transition-transform md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:relative'
        }`}
      >
        <div className="space-y-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-black text-white text-lg shadow-lg glow-primary">
              ⚡
            </div>
            <div>
              <span className="font-extrabold text-white text-base tracking-tight block">
                FocusGain
              </span>
              <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest block">
                Enterprise Flow
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {NAV_ITEMS.map(item => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href === '/timer' && pathname === '/');

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md glow-primary'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom User Profile & Extension Card */}
        <div className="space-y-3 pt-4 border-t border-white/10">
          {/* Chrome Extension Pill */}
          <div className="p-3 rounded-2xl bg-indigo-950/30 border border-indigo-500/20">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-indigo-300 flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Manifest V3
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Feed shield & study whitelist loaded.
            </p>
            <a
              href="/extension"
              className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
            >
              Extension Details <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Profile Card */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-xs">
                FP
              </div>
              <div>
                <span className="text-xs font-bold text-white block">Focus Pioneer</span>
                <span className="text-[10px] text-slate-400">Deep Work Level 4</span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              <span>7d</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
