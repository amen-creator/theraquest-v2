import React, { useState, useEffect, useRef } from 'react';
import { Volume2, VolumeX, CloudRain, Flame, Wind, Sparkles } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';

// --- Web Audio API Synthesizer Engine ---
// Completely generates sounds mathematically in the browser, 0 network requests required!
class AmbientAudioEngine {
  ctx: AudioContext | null = null;
  nodes: Record<string, { gain: GainNode }> = {};
  started = false;
  intervals: NodeJS.Timeout[] = [];

  init() {
    if (this.ctx) return;
    this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    ['rain', 'fire', 'zen', 'wind'].forEach(id => {
      const gain = this.ctx!.createGain();
      gain.connect(this.ctx!.destination);
      gain.gain.value = 0;
      this.nodes[id] = { gain };
    });
  }

  startGenerators() {
    if (!this.ctx || this.started) return;
    this.started = true;
    
    // 1. Buffer for White Noise (Used by Rain, Wind, Fire)
    const bufferSize = this.ctx.sampleRate * 2; 
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
    }
    
    // --- RAIN SYNTHESIS ---
    const rainNoise = this.ctx.createBufferSource();
    rainNoise.buffer = noiseBuffer;
    rainNoise.loop = true;
    const rainFilter = this.ctx.createBiquadFilter();
    rainFilter.type = 'lowpass';
    rainFilter.frequency.value = 800;
    rainNoise.connect(rainFilter);
    rainFilter.connect(this.nodes['rain'].gain);
    rainNoise.start();
    
    // --- WIND SYNTHESIS ---
    const windNoise = this.ctx.createBufferSource();
    windNoise.buffer = noiseBuffer; 
    windNoise.loop = true;
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'lowpass';
    windFilter.frequency.value = 400; 
    windFilter.Q.value = 2; // Resonance for howling effect
    windNoise.connect(windFilter);
    windFilter.connect(this.nodes['wind'].gain);
    windNoise.start();

    // Modulate wind filter for dynamic howling
    let windTime = 0;
    this.intervals.push(setInterval(() => {
        windTime += 0.1;
        if(this.ctx) {
            windFilter.frequency.setTargetAtTime(300 + Math.sin(windTime)*250, this.ctx.currentTime, 0.5);
        }
    }, 100));

    // --- ZEN BOWL SYNTHESIS (Binaural Beats) ---
    // Generates a deep resonant drone with a 4Hz Delta/Theta beat for deep relaxation
    const osc1 = this.ctx.createOscillator();
    osc1.type = 'sine';
    osc1.frequency.value = 174; // 174Hz Healing frequency
    
    const osc2 = this.ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.value = 178; // 4Hz difference creates a binaural beat

    // Sub-bass
    const osc3 = this.ctx.createOscillator();
    osc3.type = 'triangle';
    osc3.frequency.value = 87;

    osc1.connect(this.nodes['zen'].gain);
    osc2.connect(this.nodes['zen'].gain);
    osc3.connect(this.nodes['zen'].gain);
    osc1.start();
    osc2.start();
    osc3.start();

    // --- FIRE SYNTHESIS ---
    const fireNoise = this.ctx.createBufferSource();
    fireNoise.buffer = noiseBuffer;
    fireNoise.loop = true;
    
    const fireFilter = this.ctx.createBiquadFilter();
    fireFilter.type = 'lowpass';
    fireFilter.frequency.value = 400;

    const fireGain = this.ctx.createGain();
    fireGain.gain.value = 0; // Starts silent, jumps up on crackle

    fireNoise.connect(fireFilter);
    fireFilter.connect(fireGain);
    fireGain.connect(this.nodes['fire'].gain);
    fireNoise.start();

    // Simulate crackling logs
    this.intervals.push(setInterval(() => {
        if(this.ctx && Math.random() > 0.7) {
           fireGain.gain.setTargetAtTime(1, this.ctx.currentTime, 0.01);
           fireGain.gain.setTargetAtTime(0, this.ctx.currentTime + 0.05 + Math.random()*0.1, 0.1);
        }
    }, 80));
  }

  setVolume(id: string, vol: number) {
    if (!this.ctx) {
      if(vol > 0) {
        this.init();
        this.startGenerators();
      } else {
        return;
      }
    }
    // Resume context if suspended (Browser autoplay policy handled smoothly)
    if (this.ctx && this.ctx.state === 'suspended' && vol > 0) {
      this.ctx.resume();
    }
    
    const node = this.nodes[id];
    if (node) {
      // Smooth 0.5s fade to prevent clicking artifacts
      node.gain.gain.setTargetAtTime(vol / 100, this.ctx.currentTime, 0.5);
    }
  }

  stop() {
    this.intervals.forEach(clearInterval);
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
      this.started = false;
    }
  }
}

// Global instance
const engine = new AmbientAudioEngine();

// --- UI Component ---
interface Track {
  id: string;
  name: string;
  icon: React.ReactNode;
  levelRequired: number;
}

const TRACKS: Track[] = [
  { id: 'rain', name: 'Gentle Rain', icon: <CloudRain size={16} />, levelRequired: 1 },
  { id: 'fire', name: 'Campfire', icon: <Flame size={16} />, levelRequired: 2 },
  { id: 'zen', name: 'Zen Binaural Drone', icon: <Sparkles size={16} />, levelRequired: 4 },
  { id: 'wind', name: 'Mountain Wind', icon: <Wind size={16} />, levelRequired: 5 },
];

export const AmbientMixer: React.FC = () => {
  const { level } = useGlobalState();
  const [volumes, setVolumes] = useState<Record<string, number>>({ rain: 0, fire: 0, zen: 0, wind: 0 });

  useEffect(() => {
    return () => {
      engine.stop();
    };
  }, []);

  const handleVolumeChange = (id: string, value: number) => {
    setVolumes(prev => ({ ...prev, [id]: value }));
    engine.setVolume(id, value);
  };

  return (
    <div style={{ background: 'rgba(10,25,35,0.85)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', boxShadow: '0 10px 40px rgba(0,0,0,0.5)', backdropFilter: 'blur(20px)' }}>
      <h3 style={{ margin: 0, color: '#10b981', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900 }}>
        <Volume2 size={18} color="#10b981" /> Neural Audio Engine
      </h3>
      <p style={{ margin: 0, fontSize: '0.85rem', color: '#88a0b0', marginBottom: '0.5rem', lineHeight: 1.4 }}>
        These sounds are procedurally generated in real-time by your browser's audio algorithms for flawless, infinite relaxation.
      </p>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        {TRACKS.map(track => {
          const isUnlocked = level >= track.levelRequired;
          const currentVol = volumes[track.id] || 0;

          return (
            <div key={track.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', opacity: isUnlocked ? 1 : 0.4, transition: 'opacity 0.4s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, width: 140, color: isUnlocked ? '#fff' : '#666' }}>
                {track.icon}
                <span style={{ fontSize: '0.9rem', fontWeight: 600, letterSpacing: 0.5 }}>{track.name}</span>
              </div>
              
              {isUnlocked ? (
                <>
                  <button 
                    onClick={() => handleVolumeChange(track.id, currentVol === 0 ? 50 : 0)} 
                    style={{ background: 'transparent', border: 'none', color: currentVol > 0 ? '#10b981' : '#4b5563', cursor: 'pointer', padding: 0, display: 'flex' }}
                  >
                    {currentVol > 0 ? <Volume2 size={18} /> : <VolumeX size={18} />}
                  </button>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={currentVol} 
                    onChange={(e) => handleVolumeChange(track.id, parseInt(e.target.value))}
                    style={{ flex: 1, accentColor: currentVol > 0 ? '#10b981' : '#4b5563', cursor: 'pointer', height: 4 }}
                  />
                  <span style={{ width: 35, fontSize: '0.8rem', color: currentVol > 0 ? '#10b981' : '#6b7280', textAlign: 'right', fontWeight: 'bold' }}>
                    {currentVol}%
                  </span>
                </>
              ) : (
                <div style={{ flex: 1, fontSize: '0.8rem', color: '#f59e0b', fontStyle: 'italic', letterSpacing: 1 }}>
                  Locked (Lvl {track.levelRequired})
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
