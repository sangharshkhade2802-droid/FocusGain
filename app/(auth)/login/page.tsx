'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Sparkles, Shield, ArrowRight, Github, Mail, Lock, User, CheckCircle2 } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        if (isSignUp) {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name || 'Focus Pioneer',
              },
            },
          });
          if (error) throw error;
          setSuccessMessage('Account created! Check your email for confirmation or sign in.');
        } else {
          const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
          router.push('/timer');
        }
      } catch (err: any) {
        setErrorMessage(err.message || 'Authentication error');
      } finally {
        setLoading(false);
      }
    } else {
      // Offline / Demo mode fallback
      setTimeout(() => {
        try {
          localStorage.setItem(
            'focusgain_demo_user',
            JSON.stringify({ email: email || 'pioneer@focusgain.internal', name: name || 'Focus Pioneer' })
          );
        } catch {}
        router.push('/timer');
      }, 500);
    }
  };

  const handleGuestLogin = () => {
    try {
      localStorage.setItem(
        'focusgain_demo_user',
        JSON.stringify({ email: 'demo@focusgain.internal', name: 'Elite Focus Pioneer' })
      );
    } catch {}
    router.push('/timer');
  };

  return (
    <div className="min-h-screen bg-[#030712] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md rounded-3xl glass-panel p-8 border border-white/10 shadow-2xl relative z-10">
        {/* Brand header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-lg font-black text-white shadow-lg glow-primary">
              ⚡
            </div>
            <span className="font-extrabold text-white text-xl tracking-tight">FocusGain</span>
          </Link>
          <h2 className="text-2xl font-bold text-white">
            {isSignUp ? 'Create your Focus Account' : 'Welcome to the Flow State'}
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Enterprise focus timer, feed filters & AI learning diagnostics.
          </p>
        </div>

        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs text-center">
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs text-center">
            {successMessage}
          </div>
        )}

        {/* Guest Instant Access Button */}
        <button
          onClick={handleGuestLogin}
          className="w-full mb-6 p-3 rounded-2xl bg-gradient-to-r from-indigo-500/20 to-purple-500/20 hover:from-indigo-500/30 hover:to-purple-500/30 border border-indigo-500/40 text-indigo-300 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Instant Pioneer Access (Demo Mode)</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="relative flex items-center justify-center mb-6">
          <div className="border-t border-white/10 w-full"></div>
          <span className="bg-[#0b101f] px-3 text-[11px] text-slate-500 uppercase tracking-wider relative">
            Or with email credentials
          </span>
        </div>

        {/* Form */}
        <form onSubmit={handleAuthSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Display Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Elena Rostova"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                placeholder="pioneer@university.edu"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg glow-primary transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              'Authenticating...'
            ) : isSignUp ? (
              'Create Pioneer Account'
            ) : (
              'Sign In to Focus Station'
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          {isSignUp ? (
            <span>
              Already registered?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="text-indigo-400 font-semibold hover:underline ml-1"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="text-indigo-400 font-semibold hover:underline ml-1"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
