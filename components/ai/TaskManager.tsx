'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Sparkles, CheckCircle2, Trash2, HelpCircle, ArrowUpRight, Flame, ShieldAlert, BookOpen, AlertTriangle } from 'lucide-react';
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

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('focusgain_tasks');
      if (saved) {
        setTasks(JSON.parse(saved));
      } else {
        // Default high-leverage initial seed tasks
        const initial: TaskItem[] = [
          {
            id: 'task-1',
            task_name: 'Implement OAuth PKCE flow & Supabase Row-Level Security',
            score: 9,
            status: 'accepted',
            category: 'Deep Work',
            reasoning: 'Critical architectural security milestone with zero distraction risk.',
          },
          {
            id: 'task-2',
            task_name: 'Analyze distributed systems consensus & Paxos invariants',
            score: 10,
            status: 'accepted',
            category: 'Deliberate Practice',
            reasoning: 'High cognitive challenge strengthening core distributed principles.',
          },
          {
            id: 'task-3',
            task_name: 'Optimize Web Audio procedural synthesis buffer latencies',
            score: 8,
            status: 'accepted',
            category: 'Deep Work',
            reasoning: 'Hands-on performance profiling with measurable memory outcomes.',
          },
        ];
        setTasks(initial);
        localStorage.setItem('focusgain_tasks', JSON.stringify(initial));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Save to localStorage
  const saveTasks = (newTasks: TaskItem[]) => {
    setTasks(newTasks);
    try {
      localStorage.setItem('focusgain_tasks', JSON.stringify(newTasks));
    } catch (e) {
      console.error(e);
    }
  };

  // Submit tasks to Gemini AI evaluation
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tasks: rawLines.slice(0, 10) }),
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          taskName: task.task_name,
          taskId: task.id,
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

      {/* Input Batch Section */}
      <div className="p-6 rounded-3xl glass-card border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Gemini Cognitive Task Evaluator</h3>
              <p className="text-xs text-slate-400">
                Submit up to 10 tasks. Low-productivity items (&lt; 5/10) are filtered out and replaced.
              </p>
            </div>
          </div>
        </div>

        <textarea
          rows={3}
          value={inputTaskList}
          onChange={e => setInputTaskList(e.target.value)}
          placeholder={`Enter one task per line (up to 10 tasks). Examples:\n1. Solve 3 LeetCode dynamic programming problems\n2. Read paper on speculative decoding in LLMs\n3. Scroll Twitter feeds (AI will reject & replace this)`}
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
            Marking "Done" immediately launches a 20-MCQ test
          </span>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-12 rounded-3xl border border-dashed border-white/10 text-slate-500 text-xs">
            No active focus tasks yet. Enter your goals above to have Gemini score and refine them.
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
                    title={isCompleted ? 'Completed' : 'Mark Done & Launch 20-MCQ Quiz'}
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
                    title="Take 20-MCQ Quiz"
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
              Gemini is formulating comprehensive conceptual and practical questions for "{quizTaskName}"...
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
