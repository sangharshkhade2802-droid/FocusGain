'use client';

import React, { useState } from 'react';
import { TaskManager } from '@/components/ai/TaskManager';
import { Sparkles, Brain, BookCheck, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function TasksPage() {
  const router = useRouter();
  const [activeTaskName, setActiveTaskName] = useState<string>('');

  const handleSelectActiveTask = (taskName: string) => {
    setActiveTaskName(taskName);
    try {
      localStorage.setItem('focusgain_active_target', taskName);
    } catch {}
    router.push('/timer');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
            COGNITIVE PIPELINE
          </span>
          <span className="text-xs text-slate-400">Gemini-Powered Objective Scoring & Testing</span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
          AI Task Evaluation & 20-MCQ Mastery
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1 max-w-2xl">
          Submit your intended study blocks. Gemini scores each task's cognitive leverage (1-10), drops shallow busywork (&lt;5), and automatically synthesizes a 20-MCQ retention test when you complete a task.
        </p>
      </div>

      {/* Feature Explainer Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl glass-card border border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 mt-0.5">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">1. Strict AI Scoring</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Tasks scored 1-4 (passive browsing, distraction vulnerabilities) are immediately purged.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 mt-0.5">
            <BookCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">2. Auto 20-MCQ Diagnostic</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Marking "Done" generates a 20-question test evaluating edge cases and core invariants.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl glass-card border border-white/5 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 mt-0.5">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">3. Diagnostic Roadmap</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Maps your specific weak subtopics and curates technical reading and video resources.
            </p>
          </div>
        </div>
      </div>

      {/* Main Task Manager Component */}
      <TaskManager
        onSelectActiveTask={handleSelectActiveTask}
        activeTaskName={activeTaskName}
      />
    </div>
  );
}
