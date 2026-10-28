'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Radio, Flame, Sparkles, MessageSquare, Send, Smile, Coffee, Target, Clock, ArrowRight } from 'lucide-react';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';

export interface StudyRoom {
  id: string;
  title: string;
  host_id?: string;
  is_active: boolean;
  max_participants: number;
  participantCount?: number;
  category?: string;
}

export interface Participant {
  id: string;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  status: 'focusing' | 'break' | 'idle';
  focus_streak: number;
  joined_at: string;
}

export interface RoomMessage {
  id: string;
  sender: string;
  text: string;
  time: string;
  isReaction?: boolean;
}

export const RoomGrid: React.FC = () => {
  const [rooms, setRooms] = useState<StudyRoom[]>([
    {
      id: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
      title: 'Deep Work & Systems Architecture 🧠',
      is_active: true,
      max_participants: 25,
      participantCount: 8,
      category: 'Deep Work',
    },
    {
      id: 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22',
      title: 'Medical & MCAT Intense Focus Ward 🩺',
      is_active: true,
      max_participants: 15,
      participantCount: 11,
      category: 'Exam Prep',
    },
    {
      id: 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33',
      title: 'Late Night Lo-Fi Code Sprint 💻',
      is_active: true,
      max_participants: 30,
      participantCount: 14,
      category: 'Coding Sprint',
    },
    {
      id: 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a44',
      title: 'Silent Pomodoro Sprint (50/10) ⏱️',
      is_active: true,
      max_participants: 20,
      participantCount: 6,
      category: 'Pomodoro',
    },
  ]);

  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [myStatus, setMyStatus] = useState<'focusing' | 'break' | 'idle'>('focusing');
  const [messages, setMessages] = useState<RoomMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isCreatingRoom, setIsCreatingRoom] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState('');
  const [newRoomMax, setNewRoomMax] = useState(20);

  // Initialize participants when joining a room
  const handleJoinRoom = (room: StudyRoom) => {
    setActiveRoom(room);
    
    // Default mock peers in room
    const mockPeers: Participant[] = [
      {
        id: 'p-1',
        user_id: 'user-1',
        display_name: 'Elena Rostova',
        avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80',
        status: 'focusing',
        focus_streak: 14,
        joined_at: '25m ago',
      },
      {
        id: 'p-2',
        user_id: 'user-2',
        display_name: 'Marcus Vance',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
        status: 'focusing',
        focus_streak: 8,
        joined_at: '45m ago',
      },
      {
        id: 'p-3',
        user_id: 'user-3',
        display_name: 'Sarah Chen',
        avatar_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=80',
        status: 'break',
        focus_streak: 21,
        joined_at: '1h ago',
      },
      {
        id: 'my-self',
        user_id: 'current-user',
        display_name: 'You (Focus Pioneer)',
        status: 'focusing',
        focus_streak: 5,
        joined_at: 'Just now',
      },
    ];
    setParticipants(mockPeers);
    setMessages([
      { id: 'm-1', sender: 'System', text: `Welcome to "${room.title}". Microphone is muted for silent deep work.`, time: '14:00' },
      { id: 'm-2', sender: 'Elena Rostova', text: '50-minute sprint underway! Let’s crush this objective. 🔥', time: '14:02' },
    ]);

    // Supabase Realtime subscription if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = createClient();
        const channel = supabase.channel(`room:${room.id}`, {
          config: { presence: { key: 'focus-user' } },
        });

        channel
          .on('broadcast', { event: 'reaction' }, payload => {
            if (payload?.payload) {
              setMessages(prev => [...prev, payload.payload]);
            }
          })
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      } catch (err) {
        console.warn('Supabase realtime fallback to memory state:', err);
      }
    }
  };

  const handleLeaveRoom = () => {
    setActiveRoom(null);
    setParticipants([]);
    setMessages([]);
  };

  const handleUpdateStatus = (newStatus: 'focusing' | 'break' | 'idle') => {
    setMyStatus(newStatus);
    setParticipants(prev =>
      prev.map(p => (p.user_id === 'current-user' ? { ...p, status: newStatus } : p))
    );
  };

  const handleSendReaction = (emoji: string) => {
    const newMsg: RoomMessage = {
      id: `m-${Date.now()}`,
      sender: 'You',
      text: emoji,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isReaction: true,
    };
    setMessages(prev => [...prev, newMsg]);

    if (isSupabaseConfigured() && activeRoom) {
      try {
        const supabase = createClient();
        supabase.channel(`room:${activeRoom.id}`).send({
          type: 'broadcast',
          event: 'reaction',
          payload: newMsg,
        });
      } catch {}
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const newMsg: RoomMessage = {
      id: `m-${Date.now()}`,
      sender: 'You',
      text: chatInput.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages(prev => [...prev, newMsg]);
    setChatInput('');

    if (isSupabaseConfigured() && activeRoom) {
      try {
        const supabase = createClient();
        supabase.channel(`room:${activeRoom.id}`).send({
          type: 'broadcast',
          event: 'reaction',
          payload: newMsg,
        });
      } catch {}
    }
  };

  const handleCreateRoom = () => {
    if (!newRoomTitle.trim()) return;
    const newRoom: StudyRoom = {
      id: `room-${Date.now()}`,
      title: newRoomTitle.trim(),
      is_active: true,
      max_participants: newRoomMax,
      participantCount: 1,
      category: 'Custom Room',
    };
    setRooms([newRoom, ...rooms]);
    setNewRoomTitle('');
    setIsCreatingRoom(false);
    handleJoinRoom(newRoom);
  };

  return (
    <div className="space-y-6">
      {/* If in an active room: Live Multiplayer Room View */}
      {activeRoom ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Room Header Banner */}
          <div className="p-6 rounded-3xl glass-panel border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Live Realtime Room
                </span>
                <span className="text-slate-400 text-xs">• {participants.length} Active Participants</span>
              </div>
              <h2 className="text-xl font-bold text-white">{activeRoom.title}</h2>
            </div>

            <div className="flex items-center gap-3">
              {/* My Status Selector */}
              <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-xl border border-white/5">
                <button
                  onClick={() => handleUpdateStatus('focusing')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    myStatus === 'focusing'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Target className="w-3.5 h-3.5" /> Focusing
                </button>
                <button
                  onClick={() => handleUpdateStatus('break')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    myStatus === 'break'
                      ? 'bg-emerald-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Coffee className="w-3.5 h-3.5" /> Break
                </button>
                <button
                  onClick={() => handleUpdateStatus('idle')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                    myStatus === 'idle'
                      ? 'bg-slate-700 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" /> Idle
                </button>
              </div>

              <button
                onClick={handleLeaveRoom}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-300 border border-white/5 hover:border-rose-500/30 text-xs font-semibold transition-all"
              >
                Leave Room
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Participants Grid (2 Cols on lg) */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Co-Working Fellows
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {participants.map(p => (
                  <div
                    key={p.id}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-white/5 flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            alt={p.display_name}
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-bold text-indigo-300 text-sm">
                            {p.display_name.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <span
                          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-slate-900 ${
                            p.status === 'focusing'
                              ? 'bg-indigo-500'
                              : p.status === 'break'
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">{p.display_name}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span
                            className={`capitalize font-medium ${
                              p.status === 'focusing'
                                ? 'text-indigo-400'
                                : p.status === 'break'
                                ? 'text-emerald-400'
                                : 'text-amber-400'
                            }`}
                          >
                            {p.status}
                          </span>
                          <span>• Joined {p.joined_at}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                      <Flame className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{p.focus_streak}d</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Silent Chat & Reactions (1 Col on lg) */}
            <div className="rounded-2xl glass-card p-4 border border-white/10 flex flex-col h-[400px]">
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Silent Study Log
                </span>
                <span className="text-[10px] text-slate-500">Live WebSockets</span>
              </div>

              {/* Messages container */}
              <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {messages.map(m => (
                  <div
                    key={m.id}
                    className={`p-2.5 rounded-xl text-xs ${
                      m.sender === 'System'
                        ? 'bg-slate-800/40 text-slate-400 italic text-center text-[11px]'
                        : m.sender === 'You'
                        ? 'bg-indigo-600/20 border border-indigo-500/30 text-white ml-4'
                        : 'bg-slate-900/60 border border-white/5 text-slate-200 mr-4'
                    }`}
                  >
                    {m.sender !== 'System' && (
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold">{m.sender}</span>
                        <span>{m.time}</span>
                      </div>
                    )}
                    <div className={m.isReaction ? 'text-2xl text-center py-1' : ''}>
                      {m.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Reactions Bar */}
              <div className="flex items-center justify-around py-2 border-t border-white/5 mt-2">
                {['👏', '🔥', '🚀', '💡', '☕', '💪'].map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => handleSendReaction(emoji)}
                    className="p-1.5 hover:scale-125 transition-transform text-base"
                    title={`Send ${emoji}`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>

              {/* Text Input */}
              <div className="flex items-center gap-2 mt-2">
                <input
                  type="text"
                  placeholder="Send a quiet note..."
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1 bg-slate-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Room Directory List */
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Live Multiplayer Focus Rooms
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Synchronized collaborative study rooms with presence detection and focus streaks.
              </p>
            </div>

            <button
              onClick={() => setIsCreatingRoom(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" /> Create Study Room
            </button>
          </div>

          {/* Create Room Modal */}
          {isCreatingRoom && (
            <div className="p-6 rounded-3xl glass-card border border-indigo-500/30 animate-in fade-in duration-200">
              <h3 className="font-bold text-white text-base mb-3">Host a New Focus Room</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Room Title</label>
                  <input
                    type="text"
                    value={newRoomTitle}
                    onChange={e => setNewRoomTitle(e.target.value)}
                    placeholder="e.g. Distributed Consensus Deliberate Practice ⚡"
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Max Participants</label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    value={newRoomMax}
                    onChange={e => setNewRoomMax(parseInt(e.target.value) || 20)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-white/10 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setIsCreatingRoom(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateRoom}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all"
                >
                  Create & Join
                </button>
              </div>
            </div>
          )}

          {/* Rooms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {rooms.map(room => (
              <div
                key={room.id}
                className="p-5 rounded-3xl glass-card border border-white/10 flex flex-col justify-between hover:border-indigo-500/40 group"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      {room.category || 'Focus Room'}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-slate-400">
                      <Users className="w-3.5 h-3.5 text-slate-500" />
                      <span>{room.participantCount || 1} / {room.max_participants}</span>
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                    {room.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Synchronized focus intervals. Cameras optional, microphone muted.
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden">
                    {[1, 2, 3].map(i => (
                      <div
                        key={i}
                        className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-slate-800 text-[10px] font-bold text-slate-400 flex items-center justify-center"
                      >
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-slate-900 bg-indigo-900 text-[9px] font-bold text-indigo-200 flex items-center justify-center">
                      +{room.participantCount || 5}
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoinRoom(room)}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all shadow-md group-hover:translate-x-0.5"
                  >
                    Enter Room <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
