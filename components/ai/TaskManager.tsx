'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, CheckCircle2, Trash2, Key, HelpCircle, ArrowUpRight, Flame, ShieldAlert, BookOpen, AlertTriangle, ExternalLink, Check, Eye, EyeOff } from 'lucide-react';
import { ScoredTaskResult } from '@/app/api/ai/score-tasks/route';
import { QuizPayload } from '@/app/api/ai/generate-quiz/route';
import { QuizRunner } from './QuizRunner';

export interface TaskItem {
  id: string;
  task_name: string;
  score: number;
  status: 'pending' | 'scoring' | 'accepted' | 'completed';
  category?: string;
  reasoning?: string;
}

interface TaskManagerProps {
  onSelectActiveTask?: (taskName: string) => void;
  activeTaskName?: string;
}

export const TaskManager: React.FC<TaskManagerProps> = ({
  onSelectActiveTask,
  activeTaskName,
}) => {
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [inputTaskList, setInputTaskList] = useState<string>('');
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [rejectedTasks, setRejectedTasks] = useState<ScoredTaskResult[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizPayload | null>(null);
  const [quizTaskName, setQuizTaskName] = useState<string>('');
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState<boolean>(false);

  // Gemini API Key management
  const [geminiApiKey, setGeminiApiKey] = useState<string>('');
  const [showKeyInput, setShowKeyInput] = useState<boolean>(false);
  const [keySavedNotification, setKeySavedNotification] = useState<boolean>(false);
  const [maskKey, setMaskKey] = useState<boolean>(true);

  // Load tasks and API key from localStorage on mount
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem('focusgain_gemini_key');
      if (storedKey) {
        setGeminiApiKey(storedKey);
      }

      const saved = localStorage.getItem('focusgain_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        // High-cognitive diverse starter topics
        const initial: TaskItem[] = [
          {
            id: 'task-1',
            task_name: 'Analyze Cellular Respiration and Krebs Cycle Bioenergetics',
            score: 9,
            status: 'accepted',
            category: 'Biology & Medicine',
            reasoning: 'Rigorous biochemical mechanics with deep molecular cause-effect pathways.',
          },
          {
            id: 'task-2',
            task_name: 'Investigate the Economic and Political Causes of the French Revolution',
            score: 10,
            status: 'accepted',
            category: 'History & Social Science',
            reasoning: 'Rich multi-variable historical synthesis examining institutional collapse.',
          },
          {
            id: 'task-3',
            task_name: 'Solve Multivariable Calculus Line Integrals and Green Theorem Proofs',
            score: 9,
            status: 'accepted',
            category: 'Mathematics',
            reasoning: 'Active problem solving building deep analytical mathematical intuition.',
          },
        ];
        setTasks(initial);
        localStorage.setItem('focusgain_tasks', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSaveApiKey = () => {
    try {
      localStorage.setItem('focusgain_gemini_key', geminiApiKey.trim());
      setKeySavedNotification(true);
      setTimeout(() => setKeySavedNotification(false), 3000);
    } catch (e) {
      console.error(e);
    }
  };

  const handleClearApiKey = () => {
    try {
      localStorage.removeItem('focusgain_gemini_key');
      setGeminiApiKey('');
    } catch (e) {
      console.error(e);
    }
  };

  // Save to localStorage
  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('focusgain_tasks', JSON.stringify(newTasks));
    } catch (e) {
      console.error(e);
    }
  };

  // Submit tasks to AI evaluation
  const handleEvaluateBatch = async () => {
    const rawLines = inputTaskList
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    if (rawLines.length === 0) return;

    setIsEvaluating(true);
    setRejectedTasks([]);

    try {
      const res = await fetch('/api/ai/score-tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {}),
        },
        body: JSON.stringify({
          tasks: rawLines.slice(0, 10),
          userApiKey: geminiApiKey || undefined,
        }),
      });
      const data = await res.json();

      if (data.success && Array.isArray(data.evaluatedTasks)) {
        const accepted: TaskItem[] = [];
        const rejected: ScoredTaskResult[] = [];

        data.evaluatedTasks.forEach((t: ScoredTaskResult) => {
          if (t.status === 'accepted') {
            accepted.push({
              id: t.id,
              task_name: t.task_name,
              score: t.score,
              status: 'accepted',
              category: t.category,
              reasoning: t.reasoning,
            });
          } else {
            rejected.push(t);
          }
        });

        saveTasks([...tasks, ...accepted]);
        setRejectedTasks(rejected);
        setInputTaskList('');
      }
    } catch (err) {
      console.error('Task evaluation error:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // One-click accept replacement for rejected task
  const handleAdoptReplacement = (rep: string) => {
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      task_name: rep,
      score: 8,
      status: 'accepted',
      category: 'AI Recommended Replacement',
      reasoning: 'High-cognitive density alternative proposed by Gemini.',
    };
    saveTasks([...tasks, newTask]);
    setRejectedTasks(prev => prev.filter(r => r.suggestedReplacement !== rep));
  };

  // Mark task completed -> Triggers 20-MCQ Quiz Generator!
  const handleCompleteTask = async (task: TaskItem) => {
    // Update task status
    const updated = tasks.map(t =>
      t.id === task.id ? { ...t, status: 'completed' as const } : t
    );
    saveTasks(updated);

    // Launch Quiz Generation
    setQuizTaskName(task.task_name);
    setIsGeneratingQuiz(true);

    try {
      const res = await fetch('/api/ai/generate-quiz', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(geminiApiKey ? { 'x-gemini-api-key': geminiApiKey } : {}),
        },
        body: JSON.stringify({
          taskName: task.task_name,
          taskId: task.id,
          userApiKey: geminiApiKey || undefined,
        }),
      });
      const data = await res.json();
      if (data.success && data.quiz) {
        setActiveQuiz(data.quiz);
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleDeleteTask = (id: string) => {
    saveTasks(tasks.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Quiz Modal Runner */}
      {activeQuiz && (
        <QuizRunner
          quiz={activeQuiz}
          taskName={quizTaskName}
          onClose={() => setActiveQuiz(null)}
        />
      )}

      {/* Gemini AI Key Config Banner */}
      <div className="p-4 rounded-2xl glass-card border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Key className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">Google Gemini Engine</span>
              {geminiApiKey ? (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Gemini Live Key Active
                </span>
              ) : (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  Domain-Aware Cognitive Engine
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {geminiApiKey
                ? 'Generating real-time, topic-tailored questions and diagnostics via Gemini 1.5 Flash.'
                : 'Paste a free Gemini API key to activate live generative 20-MCQ synthesis for any subject.'}
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowKeyInput(!showKeyInput)}
          className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold self-start md:self-auto transition-all"
        >
          {showKeyInput ? 'Hide Settings' : geminiApiKey ? 'Update Key' : '🔑 Enter Gemini Key'}
        </button>
      </div>

      {/* Expandable Key Input Panel */}
      {showKeyInput && (
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <label className="text-xs font-bold text-slate-200 block">Gemini API Key</label>
              <span className="text-[11px] text-slate-400">
                Get a free key in 30 seconds at{' '}
                <a
                  href="https://aistudio.google.com/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-400 hover:underline inline-flex items-center gap-0.5 font-medium"
                >
                  aistudio.google.com/apikey <ExternalLink className="w-3 h-3" />
                </a>
              </span>
            </div>

            {keySavedNotification && (
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Key Saved!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={maskKey ? 'password' : 'text'}
                placeholder="AIzaSy..."
                value={geminiApiKey}
                onChange={e => setGeminiApiKey(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-slate-950 border border-white/10 rounded-xl text-xs text-white font-mono focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setMaskKey(!maskKey)}
                className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
              >
                {maskKey ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
              </button>
            </div>

            <button
              onClick={handleSaveApiKey}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-md"
            >
              Save Key
            </button>

            {geminiApiKey && (
              <button
                onClick={handleClearApiKey}
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 border border-white/5 text-xs font-semibold"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input Batch Section */}
      <div className="p-6 rounded-3xl glass-card border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Cognitive Task Evaluator</h3>
              <p className="text-xs text-slate-400">
                Submit up to 10 tasks in any field (Biology, History, Math, Physics, Coding, Literature). Low-productivity items (&lt; 5/10) are filtered and replaced.
              </p>
            </div>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputTaskList}
          onChange={e => setInputTaskList(e.target.value)}
          placeholder={`Enter one study goal per line. Examples:\n• Analyze the French Revolution economic causes and Jacobin constitution\n• Study Cellular Respiration, Glycolysis and ATP synthase\n• Solve Multivariable Calculus line integrals and Stokes Theorem\n• Scroll random TikTok videos (AI will reject & replace this)`}
          className="w-full p-3.5 rounded-2xl bg-slate-900/80 border border-white/10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all font-mono"
        ></textarea>

        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-slate-500">
            {inputTaskList.split('\n').filter(s => s.trim().length > 0).length} of 10 tasks submitted
          </span>
          <button
            onClick={handleEvaluateBatch}
            disabled={isEvaluating || inputTaskList.trim().length === 0}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-md disabled:opacity-40"
          >
            {isEvaluating ? (
              <>
                <Sparkles className="w-4 h-4 animate-spin" /> Evaluating Cognitive Value...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" /> Score & Filter with AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Rejected / Replaced Tasks Notification Banner */}
      {rejectedTasks.length > 0 && (
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 animate-in fade-in duration-300">
          <div className="flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider mb-2">
            <AlertTriangle className="w-4 h-4" />
            <span>AI Filter Triggered: {rejectedTasks.length} Low-Value Tasks Removed (&lt; 5/10)</span>
          </div>
          <p className="text-xs text-slate-300 mb-3">
            FocusGain protected your cognitive energy by dropping passive, distracting, or vague busywork. Click to adopt the AI-recommended high-leverage replacements:
          </p>
          <div className="space-y-2">
            {rejectedTasks.map((rej, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
              >
                <div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="line-through text-slate-500">{rej.task_name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-bold">
                      Score: {rej.score}/10
                    </span>
                  </div>
                  {rej.suggestedReplacement && (
                    <div className="text-xs text-emerald-400 font-medium mt-1 flex items-center gap-1">
                      <span>↳ Recommended replacement:</span> {rej.suggestedReplacement}
                    </div>
                  )}
                </div>
                {rej.suggestedReplacement && (
                  <button
                    onClick={() => handleAdoptReplacement(rej.suggestedReplacement!)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/40 text-emerald-300 text-xs font-semibold whitespace-nowrap self-start sm:self-auto transition-all"
                  >
                    + Adopt Replacement
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active & Accepted Tasks List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-200">
            Active Study Objectives ({tasks.filter(t => t.status === 'accepted').length})
          </h4>
          <span className="text-xs text-slate-500">
            Marking "Done" immediately synthesizes a 20-MCQ test on that specific topic
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 text-slate-500 text-xs">
            No active focus tasks yet. Enter your goals above to have AI score and refine them.
          </div>
        ) : (
          tasks.map(task => {
            const isCompleted = task.status === 'completed';
            const isActive = activeTaskName === task.task_name;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                  isCompleted
                    ? 'bg-slate-950/40 border-white/5 opacity-60'
                    : isActive
                    ? 'bg-indigo-950/30 border-indigo-500/50 shadow-lg glow-primary'
                    : 'bg-slate-900/50 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => !isCompleted && handleCompleteTask(task)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center transition-all ${
                      isCompleted
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-slate-600 hover:border-indigo-400 text-transparent'
                    }`}
                    title={isCompleted ? 'Completed' : 'Mark Done & Launch 20-MCQ Quiz on this topic'}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-sm font-semibold ${
                          isCompleted ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.task_name}
                      </span>
                      {task.score > 0 && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Score {task.score}/10
                        </span>
                      )}
                      {task.category && (
                        <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400">
                          {task.category}
                        </span>
                      )}
                    </div>
                    {task.reasoning && (
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {task.reasoning}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {!isCompleted && onSelectActiveTask && (
                    <button
                      onClick={() => onSelectActiveTask(task.task_name)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isActive ? 'Current Focus' : 'Set as Focus'}
                    </button>
                  )}

                  <button
                    onClick={() => handleCompleteTask(task)}
                    className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs flex items-center gap-1 font-semibold"
                    title={`Take 20-MCQ Quiz on "${task.task_name}"`}
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Quiz</span>
                  </button>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isGeneratingQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm">
          <div className="p-6 rounded-2xl glass-panel border border-indigo-500/40 text-center max-w-sm">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-3" />
            <h4 className="font-bold text-white text-base">Synthesizing 20-Question Quiz</h4>
            <p className="text-xs text-slate-400 mt-1">
              Formulating questions strictly on the subject: <strong className="text-indigo-300 block mt-1">"{quizTaskName}"</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
