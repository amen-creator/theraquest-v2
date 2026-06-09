import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Brain, Heart, ChevronRight, Star } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Exercises.css';

type ExTab = 'breathing' | 'thought' | 'gratitude';

// ── Breathing Exercise ─────────────────────────────────────────────────────
const BreathingExercise: React.FC = () => {
  const { addXP } = useGlobalState();
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale' | 'done'>('idle');
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const playSound = useAudio();
  const TOTAL_CYCLES = 4;

  const PHASES: { phase: 'inhale' | 'hold' | 'exhale'; label: string; duration: number; color: string }[] = [
    { phase: 'inhale', label: 'Breathe In 🫁', duration: 4, color: '#00bfa5' },
    { phase: 'hold', label: 'Hold Steady 🤲', duration: 7, color: '#8b5cf6' },
    { phase: 'exhale', label: 'Breathe Out 💨', duration: 8, color: '#fbbf24' },
  ];

  let phaseIndex = PHASES.findIndex(p => p.phase === phase);
  const currentPhase = phaseIndex >= 0 ? PHASES[phaseIndex] : null;

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    if (!currentPhase) return;

    if (count <= 0) {
      // Move to next phase or next cycle
      const nextIndex = phaseIndex + 1;
      if (nextIndex < PHASES.length) {
        const next = PHASES[nextIndex];
        setPhase(next.phase);
        setCount(next.duration);
      } else {
        const nextCycle = cycle + 1;
        if (nextCycle >= TOTAL_CYCLES) {
          setPhase('done');
          playSound('success');
          addXP(10, 'Completed 4-7-8 Breathing Session');
        } else {
          setCycle(nextCycle);
          setPhase('inhale');
          setCount(PHASES[0].duration);
        }
      }
      return;
    }

    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, phase]);

  const start = () => {
    playSound('click');
    setCycle(0);
    setPhase('inhale');
    setCount(PHASES[0].duration);
  };

  const circleSize = phase === 'inhale'
    ? 120 + ((PHASES[0].duration - count) / PHASES[0].duration) * 80
    : phase === 'exhale'
    ? 200 - ((PHASES[2].duration - count) / PHASES[2].duration) * 80
    : 200;

  return (
    <div className="exercise-panel">
      <div className="exercise-header">
        <Wind size={28} color="#00bfa5" />
        <div>
          <h2>4-7-8 Breathing Technique</h2>
          <p>Activates your parasympathetic nervous system — reduces cortisol in minutes.</p>
        </div>
      </div>

      {phase === 'idle' && (
        <div className="idle-state">
          <div className="technique-info">
            {PHASES.map((p, i) => (
              <div key={i} className="phase-info-card" style={{ borderColor: p.color }}>
                <div className="phase-icon" style={{ color: p.color }}>{i === 0 ? '🫁' : i === 1 ? '🤲' : '💨'}</div>
                <div>
                  <div className="phase-name">{p.label}</div>
                  <div className="phase-duration">{p.duration} seconds</div>
                </div>
              </div>
            ))}
          </div>
          <button className="start-btn" onClick={start}>▶ Start Session (+10 XP)</button>
        </div>
      )}

      {phase !== 'idle' && phase !== 'done' && currentPhase && (
        <div className="breathing-visual">
          <div className="cycle-indicator">Cycle {cycle + 1} of {TOTAL_CYCLES}</div>
          <motion.div
            className="breathing-circle"
            animate={{ width: circleSize, height: circleSize }}
            transition={{ duration: 1, ease: 'easeInOut' }}
            style={{ borderColor: currentPhase.color, boxShadow: `0 0 ${count * 5}px ${currentPhase.color}66` }}
          >
            <div className="circle-count" style={{ color: currentPhase.color }}>{count}</div>
          </motion.div>
          <div className="phase-label" style={{ color: currentPhase.color }}>{currentPhase.label}</div>
          <button style={{ marginTop: 24, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#aaa', padding: '6px 16px', borderRadius: 20, cursor: 'pointer' }} onClick={() => setPhase('idle')}>🛑 Stop Session</button>
        </div>
      )}

      {phase === 'done' && (
        <motion.div className="done-state" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="done-icon">✅</div>
          <h3>Session Complete!</h3>
          <p>Your nervous system has been calmed. +10 XP earned!</p>
          <button className="start-btn" onClick={() => setPhase('idle')}>🔄 New Session</button>
        </motion.div>
      )}
    </div>
  );
};

// ── Thought Record ─────────────────────────────────────────────────────────
const ThoughtRecord: React.FC = () => {
  const { addXP } = useGlobalState();
  const [form, setForm] = useState({
    situation: '', emotion: '', autoThought: '', evFor: '', evAgainst: '', balanced: ''
  });
  const playSound = useAudio();
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const update = (field: string, val: string) => setForm(prev => ({ ...prev, [field]: val }));

  const submit = async () => {
    if (!form.situation || !form.autoThought) return;
    playSound('click');
    setLoading(true);
    try {
      const res = await fetch('http://localhost:8000/api/exercises/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setAnalysis(data.analysis || 'Analysis received.');
      playSound('success');
      addXP(20, 'Completed Thought Record');
    } catch {
      setAnalysis('AI analysis unavailable — backend may be offline. Great work on completing the record!');
    }
    setLoading(false);
  };

  const fields = [
    { key: 'situation', label: '📍 Situation', placeholder: 'What happened? Where were you? Who was involved?' },
    { key: 'emotion', label: '💢 Emotions & Intensity', placeholder: 'e.g. Anxiety 80%, Sadness 60%' },
    { key: 'autoThought', label: '💭 Automatic Thought', placeholder: 'What went through your mind automatically?' },
    { key: 'evFor', label: '✅ Evidence FOR', placeholder: 'Facts that support this thought...' },
    { key: 'evAgainst', label: '❌ Evidence AGAINST', placeholder: 'Facts that challenge or contradict...' },
    { key: 'balanced', label: '⚖️ Balanced Thought', placeholder: 'A more realistic, balanced view...' },
  ];

  return (
    <div className="exercise-panel">
      <div className="exercise-header">
        <Brain size={28} color="#8b5cf6" />
        <div>
          <h2>5-Column Thought Record</h2>
          <p>Identify and reframe automatic negative thoughts using core CBT principles.</p>
        </div>
      </div>
      <div className="thought-grid">
        {fields.map(f => (
          <div key={f.key} className="thought-field">
            <label>{f.label}</label>
            <textarea
              value={form[f.key as keyof typeof form]}
              onChange={e => update(f.key, e.target.value)}
              placeholder={f.placeholder}
              rows={3}
            />
          </div>
        ))}
      </div>
      <button className="start-btn" onClick={submit} disabled={loading || !form.situation || !form.autoThought}>
        {loading ? '🤖 Analyzing...' : '💾 Save & Get AI Analysis (+20 XP)'}
      </button>
      {analysis && (
        <motion.div className="analysis-result" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h4>🤖 AI Therapist Analysis</h4>
          <p>{analysis}</p>
        </motion.div>
      )}
    </div>
  );
};

// ── Gratitude Journal ──────────────────────────────────────────────────────
const GratitudeJournal: React.FC = () => {
  const { addXP } = useGlobalState();
  const [entries, setEntries] = useState(['', '', '']);
  const playSound = useAudio();
  const [saved, setSaved] = useState<{ text: string; time: string }[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const save = () => {
    const valid = entries.filter(e => e.trim());
    if (!valid.length) return;
    playSound('success');
    setSaved(prev => [...valid.map(t => ({ text: t, time: new Date().toLocaleDateString() })), ...prev]);
    setEntries(['', '', '']);
    setSubmitted(true);
    addXP(15, 'Wrote Gratitude Journal');
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="exercise-panel">
      <div className="exercise-header">
        <Heart size={28} color="#ef4444" />
        <div>
          <h2>Daily Gratitude Journal</h2>
          <p>Research shows 3 daily gratitude entries boost happiness by 25%.</p>
        </div>
      </div>
      <div className="gratitude-fields">
        {['🌸 I am grateful for...', '💪 Something I did well today...', '🌟 Something I look forward to...'].map((ph, i) => (
          <div key={i} className="gratitude-field">
            <label>{ph}</label>
            <input
              value={entries[i]}
              onChange={e => { const n = [...entries]; n[i] = e.target.value; setEntries(n); }}
              placeholder={ph}
            />
          </div>
        ))}
      </div>
      <button className="start-btn" onClick={save}>📌 Save Today's Entry (+15 XP)</button>
      <AnimatePresence>
        {submitted && (
          <motion.div className="success-toast" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            ✅ Entries saved! You're building positive neural pathways!
          </motion.div>
        )}
      </AnimatePresence>
      {saved.length > 0 && (
        <div className="past-entries">
          <h4>📖 Past Entries</h4>
          {saved.map((e, i) => (
            <div key={i} className="past-entry">
              <Star size={12} color="#fbbf24" fill="#fbbf24" />
              <span>{e.text}</span>
              <span className="entry-time">{e.time}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Main Exercises Page ────────────────────────────────────────────────────
const Exercises: React.FC = () => {
  const [tab, setTab] = useState<ExTab>('breathing');

  const tabs = [
    { key: 'breathing', label: '🌬️ Breathing', icon: <Wind size={18}/> },
    { key: 'thought', label: '🧠 Thought Record', icon: <Brain size={18}/> },
    { key: 'gratitude', label: '🙏 Gratitude', icon: <Heart size={18}/> },
  ];

  return (
    <motion.div className="exercises-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="exercises-header">
        <h1>CBT Exercises Hub</h1>
        <p>Evidence-based therapeutic tools — powered by cognitive behavioral therapy science.</p>
      </div>
      <div className="exercises-tabs">
        {tabs.map(t => (
          <button
            key={t.key}
            className={`ex-tab-btn ${tab === t.key ? 'active' : ''}`}
            onClick={() => setTab(t.key as ExTab)}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.25 }}>
          {tab === 'breathing' && <BreathingExercise />}
          {tab === 'thought' && <ThoughtRecord />}
          {tab === 'gratitude' && <GratitudeJournal />}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default Exercises;
