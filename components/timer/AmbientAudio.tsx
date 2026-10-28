'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, Play, Pause, CloudRain, Wind, Radio, Music, Waves, Sliders } from 'lucide-react';

interface SoundTrack {
  id: string;
  name: string;
  icon: any;
  type: 'rain' | 'white_noise' | 'lofi' | 'binaural';
  volume: number; // 0 to 1
  isPlaying: boolean;
}

export const AmbientAudio: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [masterVolume, setMasterVolume] = useState(0.7);
  const [expanded, setExpanded] = useState(false);
  const [tracks, setTracks] = useState<SoundTrack[]>([
    { id: 'rain', name: 'Gentle Rain', icon: CloudRain, type: 'rain', volume: 0.6, isPlaying: true },
    { id: 'noise', name: 'White Noise', icon: Wind, type: 'white_noise', volume: 0.3, isPlaying: false },
    { id: 'lofi', name: 'Lo-Fi Chill Chords', icon: Music, type: 'lofi', volume: 0.5, isPlaying: false },
    { id: 'binaural', name: 'Alpha Waves (10Hz)', icon: Waves, type: 'binaural', volume: 0.4, isPlaying: false },
  ]);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<Map<string, { gain: GainNode; stop: () => void }>>(new Map());
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize or resume AudioContext
  const getAudioContext = () => {
    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      audioCtxRef.current = new AudioCtx();
      masterGainRef.current = audioCtxRef.current.createGain();
      masterGainRef.current.gain.value = masterVolume;
      masterGainRef.current.connect(audioCtxRef.current.destination);
    }
    if (audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const toggleMasterPlay = () => {
    const nextPlay = !isPlaying;
    setIsPlaying(nextPlay);

    if (nextPlay) {
      const ctx = getAudioContext();
      tracks.forEach(track => {
        if (track.isPlaying) {
          startTrack(track, ctx);
        }
      });
    } else {
      stopAllTracks();
    }
  };

  const stopAllTracks = () => {
    activeNodesRef.current.forEach(node => {
      try {
        node.stop();
      } catch (e) {
        console.error(e);
      }
    });
    activeNodesRef.current.clear();
  };

  const startTrack = (track: SoundTrack, ctx: AudioContext) => {
    if (activeNodesRef.current.has(track.id)) return;
    if (!masterGainRef.current) return;

    const trackGain = ctx.createGain();
    trackGain.gain.value = track.volume;
    trackGain.connect(masterGainRef.current);

    let stopFn = () => {};

    if (track.type === 'rain') {
      // Procedural Pink Noise with Lowpass filter for Rain
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
        b6 = white * 0.115926;
      }
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1000;

      noiseSource.connect(filter);
      filter.connect(trackGain);
      noiseSource.start();

      stopFn = () => {
        try { noiseSource.stop(); } catch {}
      };
    } else if (track.type === 'white_noise') {
      // White noise generator
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.08;
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 850;
      filter.Q.value = 1.2;

      noise.connect(filter);
      filter.connect(trackGain);
      noise.start();

      stopFn = () => {
        try { noise.stop(); } catch {}
      };
    } else if (track.type === 'binaural') {
      // 10Hz Alpha Binaural beats: 210Hz Left, 200Hz Right
      const merger = ctx.createChannelMerger(2);
      const oscL = ctx.createOscillator();
      const oscR = ctx.createOscillator();

      oscL.type = 'sine';
      oscL.frequency.value = 210;

      oscR.type = 'sine';
      oscR.frequency.value = 200; // 10Hz delta (Alpha state)

      oscL.connect(merger, 0, 0);
      oscR.connect(merger, 0, 1);
      merger.connect(trackGain);

      oscL.start();
      oscR.start();

      stopFn = () => {
        try { oscL.stop(); oscR.stop(); } catch {}
      };
    } else if (track.type === 'lofi') {
      // Procedural warm chords sequence (Cmaj7 -> Am7 -> Dm7 -> G7)
      const chordFreqs = [
        [261.63, 329.63, 392.00, 493.88], // Cmaj7
        [220.00, 261.63, 329.63, 392.00], // Am7
        [293.66, 349.23, 440.00, 523.25], // Dm7
        [196.00, 246.94, 293.66, 349.23], // G7
      ];
      let step = 0;
      let activeOscs: OscillatorNode[] = [];

      const playChord = () => {
        activeOscs.forEach(o => { try { o.stop(); } catch {} });
        activeOscs = [];
        const freqs = chordFreqs[step % chordFreqs.length];
        step++;

        freqs.forEach(f => {
          const osc = ctx.createOscillator();
          const noteGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.value = f;

          noteGain.gain.setValueAtTime(0.01, ctx.currentTime);
          noteGain.gain.exponentialRampToValueAtTime(0.08, ctx.currentTime + 0.4);
          noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3.8);

          osc.connect(noteGain);
          noteGain.connect(trackGain);
          osc.start();
          osc.stop(ctx.currentTime + 4);
          activeOscs.push(osc);
        });
      };

      playChord();
      const interval = setInterval(playChord, 4000);

      stopFn = () => {
        clearInterval(interval);
        activeOscs.forEach(o => { try { o.stop(); } catch {} });
      };
    }

    activeNodesRef.current.set(track.id, { gain: trackGain, stop: stopFn });
  };

  const toggleTrack = (id: string) => {
    setTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextState = !t.isPlaying;
          if (isPlaying) {
            const ctx = getAudioContext();
            if (nextState) {
              startTrack({ ...t, isPlaying: true }, ctx);
            } else {
              const node = activeNodesRef.current.get(id);
              if (node) {
                node.stop();
                activeNodesRef.current.delete(id);
              }
            }
          }
          return { ...t, isPlaying: nextState };
        }
        return t;
      })
    );
  };

  const handleTrackVolumeChange = (id: string, vol: number) => {
    setTracks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const node = activeNodesRef.current.get(id);
          if (node) {
            node.gain.gain.value = vol;
          }
          return { ...t, volume: vol };
        }
        return t;
      })
    );
  };

  const handleMasterVolumeChange = (vol: number) => {
    setMasterVolume(vol);
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = vol;
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      stopAllTracks();
      if (audioCtxRef.current) {
        audioCtxRef.current.close().catch(() => {});
      }
    };
  }, []);

  return (
    <div className="rounded-2xl glass-panel p-5 border border-white/10 shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleMasterPlay}
            className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
              isPlaying
                ? 'bg-gradient-to-tr from-indigo-500 to-purple-600 text-white glow-primary'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-sm text-slate-100">Ambient Flow Audio</h3>
              {isPlaying && (
                <span className="flex gap-0.5 items-end h-3">
                  <span className="w-1 bg-indigo-400 h-full animate-pulse"></span>
                  <span className="w-1 bg-indigo-400 h-2/3 animate-pulse delay-75"></span>
                  <span className="w-1 bg-indigo-400 h-4/5 animate-pulse delay-150"></span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {isPlaying ? 'Streaming procedural deep focus atmosphere' : 'Binaural beats, rain & chill chords'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-white/5">
            {masterVolume === 0 ? (
              <VolumeX className="w-4 h-4 text-slate-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={masterVolume}
              onChange={e => handleMasterVolumeChange(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
          </div>

          <button
            onClick={() => setExpanded(!expanded)}
            className={`p-2 rounded-lg border transition-all ${
              expanded
                ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                : 'bg-slate-800/80 border-white/5 text-slate-400 hover:text-white'
            }`}
            title="Mixer tracks"
          >
            <Sliders className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Expanded Multi-Track Mixer */}
      {expanded && (
        <div className="mt-4 pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in duration-200">
          {tracks.map(track => {
            const Icon = track.icon;
            return (
              <div
                key={track.id}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                  track.isPlaying
                    ? 'bg-indigo-950/30 border-indigo-500/30 text-white'
                    : 'bg-slate-900/40 border-white/5 text-slate-400 hover:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleTrack(track.id)}
                  className={`flex items-center gap-2.5 text-left flex-1`}
                >
                  <div
                    className={`p-2 rounded-lg ${
                      track.isPlaying ? 'bg-indigo-600/30 text-indigo-300' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-medium block text-slate-200">{track.name}</span>
                    <span className="text-[10px] text-slate-400">
                      {track.isPlaying ? 'Active channel' : 'Muted'}
                    </span>
                  </div>
                </button>

                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={track.volume}
                    disabled={!track.isPlaying}
                    onChange={e => handleTrackVolumeChange(track.id, parseFloat(e.target.value))}
                    className={`w-16 accent-indigo-400 cursor-pointer h-1.5 rounded-lg ${
                      track.isPlaying ? 'bg-slate-700' : 'bg-slate-800 opacity-40'
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
