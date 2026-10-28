'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, Trash2, Play, Check, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';

export interface ScheduledBlock {
  id: string;
  title: string;
  start_time: string; // HH:MM
  end_time: string;   // HH:MM
  days_of_week: number[]; // 1=Mon, 7=Sun
  color?: string;
  category?: string;
}

const DAYS = [
  { id: 1, name: 'Monday', short: 'Mon' },
  { id: 2, name: 'Tuesday', short: 'Tue' },
  { id: 3, name: 'Wednesday', short: 'Wed' },
  { id: 4, name: 'Thursday', short: 'Thu' },
  { id: 5, name: 'Friday', short: 'Fri' },
  { id: 6, name: 'Saturday', short: 'Sat' },
  { id: 7, name: 'Sunday', short: 'Sun' },
];

export default function PlannerPage() {
  const router = useRouter();
  const [blocks, setBlocks] = useState<ScheduledBlock[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1); // 1 = Monday

  // Form fields
  const [newTitle, setNewTitle] = useState('');
  const [newStartTime, setNewStartTime] = useState('09:00');
  const [newEndTime, setNewEndTime] = useState('10:30');
  const [newDays, setNewDays] = useState<number[]>([1, 2, 3, 4, 5]);
  const [newColor, setNewColor] = useState('indigo');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('focusgain_scheduled_blocks');
      if (saved) {
        setBlocks(JSON.parse(saved));
      } else {
        const initialBlocks: ScheduledBlock[] = [
          {
            id: 'b-1',
            title: 'Deep Architecture & Systems Design',
            start_time: '08:30',
            end_time: '10:00',
            days_of_week: [1, 3, 5],
            color: 'indigo',
            category: 'Deep Work',
          },
          {
            id: 'b-2',
            title: 'Distributed Consensus & Raft Implementations',
            start_time: '14:00',
            end_time: '15:30',
            days_of_week: [2, 4],
            color: 'emerald',
            category: 'Systems Code',
          },
          {
            id: 'b-3',
            title: '20-MCQ Diagnostic Review & Synthesized Reading',
            start_time: '17:00',
            end_time: '18:00',
            days_of_week: [1, 2, 3, 4, 5],
            color: 'purple',
            category: 'Review',
          },
        ];
        setBlocks(initialBlocks);
        localStorage.setItem('focusgain_scheduled_blocks', JSON.stringify(initialBlocks));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const saveBlocks = (newBlocks: ScheduledBlock[]) => {
    setBlocks(newBlocks);
    try {
      localStorage.setItem('focusgain_scheduled_blocks', JSON.stringify(newBlocks));
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddBlock = () => {
    if (!newTitle.trim() || newDays.length === 0) return;
    const newBlock: ScheduledBlock = {
      id: `block-${Date.now()}`,
      title: newTitle.trim(),
      start_time: newStartTime,
      end_time: newEndTime,
      days_of_week: newDays,
      color: newColor,
    };
    saveBlocks([...blocks, newBlock]);
    setNewTitle('');
    setIsAdding(false);
  };

  const handleDeleteBlock = (id: string) => {
    saveBlocks(blocks.filter(b => b.id !== id));
  };

  const toggleDaySelection = (dayId: number) => {
    if (newDays.includes(dayId)) {
      setNewDays(newDays.filter(d => d !== dayId));
    } else {
      setNewDays([...newDays, dayId]);
    }
  };

  const startBlockNow = (block: ScheduledBlock) => {
    try {
      localStorage.setItem('focusgain_active_target', block.title);
      router.push('/timer');
    } catch {
      router.push('/timer');
    }
  };

  const dayBlocks = blocks.filter(b => b.days_of_week.includes(selectedDay));

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              CHRONO ARCHITECTURE
            </span>
            <span className="text-xs text-slate-400">Weekly Pre-Scheduled Focus Blocks</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white mt-1">
            Weekly Focus Schedule Planner
          </h1>
          <p className="text-xs md:text-sm text-slate-400 mt-1">
            Pre-commit your highest-leverage cognitive sprints into structured daily calendar blocks.
          </p>
        </div>

        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Focus Block
        </button>
      </div>

      {/* Add Block Modal / Inline Form */}
      {isAdding && (
        <div className="p-6 rounded-3xl glass-card border border-indigo-500/30 animate-in fade-in duration-200">
          <h3 className="font-bold text-white text-base mb-4">Create Pre-Scheduled Focus Block</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Focus Block Title</label>
              <input
                type="text"
                placeholder="e.g. Formal Verification & TLA+ Invariants"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">Start Time</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={e => setNewStartTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">End Time</label>
                <input
                  type="time"
                  value={newEndTime}
                  onChange={e => setNewEndTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-2">Repeat Days</label>
              <div className="flex flex-wrap gap-2">
                {DAYS.map(day => {
                  const isSelected = newDays.includes(day.id);
                  return (
                    <button
                      key={day.id}
                      type="button"
                      onClick={() => toggleDaySelection(day.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {day.short}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddBlock}
                className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
              >
                Save Focus Block
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Days Tabs Strip */}
      <div className="grid grid-cols-7 gap-2 p-1.5 bg-slate-900/60 rounded-2xl border border-white/5">
        {DAYS.map(day => {
          const isSelected = selectedDay === day.id;
          const count = blocks.filter(b => b.days_of_week.includes(day.id)).length;

          return (
            <button
              key={day.id}
              onClick={() => setSelectedDay(day.id)}
              className={`py-3 px-2 rounded-xl flex flex-col items-center justify-center transition-all ${
                isSelected
                  ? 'bg-gradient-to-b from-indigo-600 to-indigo-700 text-white shadow-lg glow-primary'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <span className="text-xs font-bold">{day.short}</span>
              <span className="text-[10px] opacity-75 mt-0.5">{count} blocks</span>
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            {DAYS.find(d => d.id === selectedDay)?.name}'s Focus Blocks
          </h3>
          <span className="text-xs text-slate-400">{dayBlocks.length} planned sprints</span>
        </div>

        {dayBlocks.length === 0 ? (
          <div className="p-12 text-center rounded-3xl border border-dashed border-white/10 text-slate-500 text-xs">
            No focus blocks scheduled for this day yet. Click "Add Focus Block" above to plan a high-cognitive sprint.
          </div>
        ) : (
          <div className="space-y-3">
            {dayBlocks.map(block => (
              <div
                key={block.id}
                className="p-5 rounded-2xl glass-card border border-white/10 hover:border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex flex-col items-center justify-center min-w-[70px]">
                    <Clock className="w-4 h-4 mb-0.5" />
                    <span className="text-xs font-mono font-bold">{block.start_time}</span>
                    <span className="text-[10px] text-slate-400 font-mono">to {block.end_time}</span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-white">{block.title}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium text-[11px]">
                        {block.category || 'Deep Focus'}
                      </span>
                      <span>
                        • Recurring on {block.days_of_week.map(d => DAYS.find(day => day.id === d)?.short).join(', ')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button
                    onClick={() => startBlockNow(block)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" /> Start Sprint Now
                  </button>
                  <button
                    onClick={() => handleDeleteBlock(block.id)}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-all border border-white/5"
                    title="Delete block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
