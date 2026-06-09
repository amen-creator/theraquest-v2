import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Target, Download, Trophy } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';

const TIMELINES = ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year'];

const Goals: React.FC = () => {
  const { addXP, unlockBadge, goalRoadmap: roadmap, setGoalRoadmap: setRoadmap } = useGlobalState();
  const [goal, setGoal] = useState('');
  const playSound = useAudio();
  const [timeline, setTimeline] = useState('1 Month');
  const [loading, setLoading] = useState(false);

  const build = async () => {
    if (!goal) return;
    playSound('click');
    setLoading(true);
    setRoadmap('');
    try {
      const res = await fetch('http://localhost:8000/api/goals', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, timeline })
      });
      const data = await res.json();
      setRoadmap(data.roadmap || '');
      playSound('success');
      addXP(20, 'Built Wellness Roadmap');
      unlockBadge('Goal Setter 🎯');
    } catch {
      setRoadmap('⚠️ Backend offline. Please start the backend and try again.');
    }
    setLoading(false);
  };

  return (
    <motion.div style={{ padding: '2rem', overflowY: 'auto', height: 'calc(100vh - 70px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #fff, #ef4444)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI Goal Coach</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Build a CBT-backed SMART goal roadmap tailored to your wellness vision.</p>
      </div>

      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🌟 What does mental wellness look like for you?</label>
          <textarea rows={5} value={goal} onChange={e => setGoal(e.target.value)} placeholder="e.g. I want to manage my social anxiety so I can attend events comfortably, build meaningful connections, and feel confident in myself..." style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '1rem', color: 'white', fontFamily: 'inherit', fontSize: '0.95rem', boxSizing: 'border-box', resize: 'vertical' }} />
        </div>
        <div style={{ marginBottom: '2rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>⏱️ Goal Timeline</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {TIMELINES.map(t => (
              <button key={t} onClick={() => setTimeline(t)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', borderColor: timeline === t ? '#ef4444' : 'var(--border)', background: timeline === t ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.03)', color: timeline === t ? '#ef4444' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <button onClick={build} disabled={loading || !goal} style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', opacity: loading || !goal ? 0.5 : 1 }}>
          {loading ? '🗺️ Building Your Roadmap...' : '🗺️ Build My Wellness Roadmap (+20 XP)'}
        </button>
      </div>

      {roadmap && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--panel-bg)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: '#ef4444', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Trophy size={20}/> Your {timeline} Wellness Roadmap</h3>
            <button onClick={() => { const b = new Blob([roadmap], { type: 'text/markdown' }); const u = URL.createObjectURL(b); const a = document.createElement('a'); a.href = u; a.download = 'theraquest_roadmap.md'; a.click(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <Download size={16}/> Download
            </button>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.85', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{roadmap}</div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Goals;
