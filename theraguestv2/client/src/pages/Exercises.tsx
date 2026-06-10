import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wind, Brain, Heart, CheckCircle2, AlertCircle, ArrowRight, Save, Sparkles } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Exercises.css';

type ExTab = 'breathing' | 'thought' | 'gratitude';

// ── The Breathing Room ─────────────────────────────────────────────────────
const BreathingExercise: React.FC = () => {
  const { addXP } = useGlobalState();
  const [technique, setTechnique] = useState<'4-7-8' | 'box' | 'relax'>('4-7-8');
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold1' | 'exhale' | 'hold2' | 'done'>('idle');
  const [count, setCount] = useState(0);
  const [cycle, setCycle] = useState(0);
  const playSound = useAudio();

  const TECHNIQUES = {
    '4-7-8': {
      name: '4-7-8 Sleep',
      desc: 'Activates parasympathetic nervous system. Best for sleep & deep anxiety.',
      cycles: 4,
      phases: [
        { phase: 'inhale', label: 'Breathe In', duration: 4, color: '#3b82f6' },
        { phase: 'hold1', label: 'Hold', duration: 7, color: '#8b5cf6' },
        { phase: 'exhale', label: 'Breathe Out', duration: 8, color: '#10b981' }
      ]
    },
    'box': {
      name: 'Box Breathing',
      desc: 'Navy SEAL technique for immediate focus and stress reduction.',
      cycles: 4,
      phases: [
        { phase: 'inhale', label: 'Inhale', duration: 4, color: '#3b82f6' },
        { phase: 'hold1', label: 'Hold', duration: 4, color: '#8b5cf6' },
        { phase: 'exhale', label: 'Exhale', duration: 4, color: '#10b981' },
        { phase: 'hold2', label: 'Hold', duration: 4, color: '#6366f1' }
      ]
    },
    'relax': {
      name: '4-6 Relax',
      desc: 'Simple coherent breathing to center your mind quickly.',
      cycles: 6,
      phases: [
        { phase: 'inhale', label: 'Inhale', duration: 4, color: '#3b82f6' },
        { phase: 'exhale', label: 'Exhale', duration: 6, color: '#10b981' }
      ]
    }
  };

  const tech = TECHNIQUES[technique];
  const phaseIndex = tech.phases.findIndex(p => p.phase === phase);
  const currentPhase = phaseIndex >= 0 ? tech.phases[phaseIndex] : null;

  useEffect(() => {
    if (phase === 'idle' || phase === 'done') return;
    if (!currentPhase) return;

    if (count <= 0) {
      const nextIndex = phaseIndex + 1;
      if (nextIndex < tech.phases.length) {
        const next = tech.phases[nextIndex];
        setPhase(next.phase as any);
        setCount(next.duration);
      } else {
        const nextCycle = cycle + 1;
        if (nextCycle >= tech.cycles) {
          setPhase('done');
          playSound('success');
          addXP(15, `Completed ${tech.name} Breathing`);
        } else {
          setCycle(nextCycle);
          setPhase('inhale');
          setCount(tech.phases[0].duration);
        }
      }
      return;
    }

    const timer = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, phase, technique]);

  const start = () => {
    playSound('click');
    setCycle(0);
    setPhase('inhale');
    setCount(tech.phases[0].duration);
  };

  const getOrbSize = () => {
    if (phase === 'idle') return 200;
    if (phase === 'done') return 200;
    if (!currentPhase) return 200;
    
    const progress = 1 - (count / currentPhase.duration);
    if (phase === 'inhale') return 200 + (progress * 150);
    if (phase === 'exhale') return 350 - (progress * 150);
    if (phase === 'hold1') return 350; // Holds at full
    if (phase === 'hold2') return 200; // Holds at empty
    return 200;
  };

  return (
    <motion.div className="ex-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ex-panel-header">
        <h1>The Breathing Room</h1>
        <p>Follow the glowing orb to sync your nervous system.</p>
      </div>

      {phase === 'idle' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem' }}>
          <div className="tech-selector">
            {(Object.keys(TECHNIQUES) as Array<keyof typeof TECHNIQUES>).map(k => (
              <button 
                key={k} 
                className={`tech-btn ${technique === k ? 'active' : ''}`}
                onClick={() => setTechnique(k)}
              >
                {TECHNIQUES[k].name}
              </button>
            ))}
          </div>
          <p style={{ color: '#88a0b0', textAlign: 'center', maxWidth: 400 }}>{tech.desc}</p>
          <button className="btn-wizard btn-primary" onClick={start} style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}>
            Begin Session (+15 XP)
          </button>
        </div>
      )}

      {phase !== 'idle' && phase !== 'done' && currentPhase && (
        <div className="breathing-container">
          <div style={{ color: '#aaa', fontSize: '1.1rem', letterSpacing: 2 }}>
            CYCLE {cycle + 1} OF {tech.cycles}
          </div>
          
          <div className="orb-wrapper">
            <motion.div 
              className="glowing-orb"
              animate={{ width: getOrbSize(), height: getOrbSize() }}
              transition={{ duration: 1, ease: 'linear' }}
              style={{ 
                background: `radial-gradient(circle, ${currentPhase.color} 0%, transparent 70%)`,
                boxShadow: `0 0 ${getOrbSize() / 2}px ${currentPhase.color}88`,
                border: `2px solid ${currentPhase.color}`
              }}
            >
              <span className="orb-count">{count}</span>
            </motion.div>
          </div>
          
          <motion.div 
            key={phase} 
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="orb-label" style={{ color: currentPhase.color }}
          >
            {currentPhase.label}
          </motion.div>
          
          <button className="btn-wizard btn-secondary" onClick={() => setPhase('idle')} style={{ marginTop: '2rem' }}>
            Stop Session
          </button>
        </div>
      )}

      {phase === 'done' && (
        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <CheckCircle2 size={64} color="#10b981" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ color: '#fff', fontSize: '2rem' }}>Deeply Relaxed</h2>
          <p style={{ color: '#88a0b0', fontSize: '1.2rem', marginBottom: '2rem' }}>Your nervous system is now centered. Excellent work.</p>
          <button className="btn-wizard btn-primary" onClick={() => setPhase('idle')} style={{ margin: '0 auto' }}>
            Return to Menu
          </button>
        </div>
      )}
    </motion.div>
  );
};

// ── CBT Wizard (Thought Diary) ─────────────────────────────────────────────
const ThoughtRecordWizard: React.FC = () => {
  const { addXP } = useGlobalState();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ situation: '', emotion: '', autoThought: '', evFor: '', evAgainst: '', balanced: '' });
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const playSound = useAudio();

  const STEPS = [
    { key: 'situation', title: 'The Situation', desc: 'Describe the trigger. What happened? Where were you? Who was involved?', placeholder: 'I was at work and my boss emailed me asking for a meeting...' },
    { key: 'emotion', title: 'The Emotion', desc: 'What did you feel? Rate the intensity from 0-100%.', placeholder: 'Anxious (90%), Dread (80%)' },
    { key: 'autoThought', title: 'Automatic Thought', desc: 'What was the immediate negative thought that popped into your head?', placeholder: 'I am going to get fired. I did something wrong.' },
    { key: 'evFor', title: 'Evidence FOR', desc: 'What are the objective facts supporting this thought? (No feelings, just facts).', placeholder: 'I missed a deadline yesterday.' },
    { key: 'evAgainst', title: 'Evidence AGAINST', desc: 'What facts contradict this thought?', placeholder: 'My performance review last week was excellent. The email tone was normal.' },
    { key: 'balanced', title: 'Balanced Reframing', desc: 'Based on the evidence, what is a more realistic and balanced way to look at this?', placeholder: 'He probably just wants to discuss the upcoming project. One missed deadline doesn\'t mean I will be fired.' }
  ];

  const update = (val: string) => setForm(prev => ({ ...prev, [STEPS[step].key]: val }));

  const nextStep = () => {
    playSound('click');
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else submit();
  };

  const prevStep = () => {
    playSound('click');
    if (step > 0) setStep(s => s - 1);
  };

  const submit = async () => {
    setLoading(true);
    playSound('click');
    try {
      const res = await fetch('http://localhost:8000/api/exercises/thought', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setAnalysis(data.analysis || 'Analysis received.');
      playSound('success');
      addXP(25, 'Mastered a Thought Record');
      setStep(STEPS.length); // Move to success/analysis step
    } catch {
      setAnalysis('AI Therapist is offline. However, walking through these steps alone is a massive victory for your mental health. Great job!');
      playSound('success');
      addXP(25, 'Mastered a Thought Record');
      setStep(STEPS.length);
    }
    setLoading(false);
  };

  const currentVal = form[STEPS[Math.min(step, STEPS.length - 1)]?.key as keyof typeof form];
  const isComplete = step === STEPS.length;

  return (
    <motion.div className="ex-panel" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ex-panel-header">
        <h1>Guided CBT Diary</h1>
        <p>Untangle your cognitive distortions step-by-step.</p>
      </div>

      <div className="cbt-wizard">
        <div className="wizard-progress">
          {STEPS.map((s, i) => (
            <div 
              key={s.key} 
              className={`wizard-step-dot ${i === step ? 'active' : ''} ${i < step ? 'completed' : ''}`} 
            />
          ))}
        </div>

        <AnimatePresence mode="wait">
          {!isComplete ? (
            <motion.div 
              key={step}
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}
              className="wizard-body"
            >
              <h2>{STEPS[step].title}</h2>
              <p>{STEPS[step].desc}</p>
              <textarea 
                className="wizard-textarea"
                value={currentVal}
                onChange={e => update(e.target.value)}
                placeholder={STEPS[step].placeholder}
                autoFocus
              />
              
              <div className="wizard-controls">
                <button className="btn-wizard btn-secondary" onClick={prevStep} disabled={step === 0}>Back</button>
                <button 
                  className="btn-wizard btn-primary" 
                  onClick={nextStep} 
                  disabled={!currentVal.trim() || loading}
                >
                  {loading ? 'Analyzing...' : step === STEPS.length - 1 ? <><Save size={18}/> Analyze Thought (+25 XP)</> : <><ArrowRight size={18}/> Next</>}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="wizard-body" style={{ alignItems: 'center', textAlign: 'center' }}
            >
              <Sparkles size={48} color="#8b5cf6" style={{ marginBottom: '1rem' }} />
              <h2>Cognitive Shift Complete</h2>
              <p style={{ color: '#10b981', fontSize: '1.1rem', fontWeight: 600 }}>+25 XP Awarded</p>
              
              <div style={{ background: 'rgba(139, 92, 246, 0.1)', border: '1px solid #8b5cf6', padding: '2rem', borderRadius: 16, marginTop: '1rem', textAlign: 'left', width: '100%' }}>
                <h3 style={{ color: '#8b5cf6', margin: '0 0 1rem 0' }}>AI Therapist Insight</h3>
                <p style={{ color: '#fff', lineHeight: 1.6, margin: 0 }}>{analysis}</p>
              </div>

              <button className="btn-wizard btn-secondary" onClick={() => { setStep(0); setForm({ situation: '', emotion: '', autoThought: '', evFor: '', evAgainst: '', balanced: '' }); }} style={{ marginTop: '2rem' }}>
                Start New Record
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// ── Gratitude Wall ─────────────────────────────────────────────────────────
const PROMPTS = [
  "What is a small thing that made you smile today?",
  "Who is someone you are incredibly thankful for?",
  "What is a personal strength you are grateful to have?",
  "What was the most beautiful thing you saw today?",
  "What is a challenge that you are grateful you overcame?"
];

const GratitudeWall: React.FC = () => {
  const { addXP } = useGlobalState();
  const [entry, setEntry] = useState('');
  const playSound = useAudio();
  const [saved, setSaved] = useState<{ text: string; date: string; emoji: string }[]>([
    { text: "My morning coffee tasted exceptionally good today.", date: "Yesterday", emoji: "☕" },
    { text: "Had a great conversation with an old friend.", date: "2 days ago", emoji: "🗣️" }
  ]);
  const [prompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  const EMOJIS = ["🌟", "🌸", "☀️", "🌿", "🦋", "💖"];

  const save = () => {
    if (!entry.trim()) return;
    playSound('success');
    const randomEmoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
    setSaved([{ text: entry, date: "Just now", emoji: randomEmoji }, ...saved]);
    setEntry('');
    addXP(10, 'Pinned Gratitude Polaroid');
  };

  return (
    <motion.div className="ex-panel" style={{ maxWidth: 1000 }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <div className="ex-panel-header">
        <h1>The Gratitude Wall</h1>
        <p>Rewire your brain to spot the good things.</p>
      </div>

      <div className="gratitude-wall">
        
        <div className="gratitude-prompt">
          <h3>Daily Inspiration</h3>
          <p style={{ color: '#fff', fontSize: '1.2rem', marginBottom: '1.5rem', fontStyle: 'italic' }}>"{prompt}"</p>
          <div className="gratitude-input">
            <input 
              value={entry} 
              onChange={e => setEntry(e.target.value)} 
              placeholder="I am grateful for..."
              onKeyDown={e => e.key === 'Enter' && save()}
            />
            <button className="btn-wizard btn-primary" onClick={save} disabled={!entry.trim()}>
              Pin to Wall (+10 XP)
            </button>
          </div>
        </div>

        <div className="polaroid-grid">
          <AnimatePresence>
            {saved.map((item, i) => (
              <motion.div 
                key={i + item.text} 
                className="polaroid"
                initial={{ opacity: 0, scale: 0.8, rotate: Math.random() * 20 - 10 }}
                animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? 3 : i % 3 === 0 ? -4 : -2 }}
                transition={{ type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className="polaroid-img">{item.emoji}</div>
                <div className="polaroid-text">{item.text}</div>
                <div className="polaroid-date">{item.date}</div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
};

// ── Main Exercises Layout ──────────────────────────────────────────────────
const Exercises: React.FC = () => {
  const [tab, setTab] = useState<ExTab>('breathing');

  return (
    <div className="exercises-layout">
      {/* Sidebar Navigation */}
      <div className="exercises-sidebar">
        <div className="ex-sidebar-header">
          <h2>Clinical Tools</h2>
          <p>Science-backed techniques</p>
        </div>
        
        <div className="ex-nav">
          <button className={`ex-nav-btn ${tab === 'breathing' ? 'active' : ''}`} onClick={() => setTab('breathing')}>
            <Wind size={20} /> The Breathing Room
          </button>
          <button className={`ex-nav-btn ${tab === 'thought' ? 'active' : ''}`} onClick={() => setTab('thought')}>
            <Brain size={20} /> Guided CBT Diary
          </button>
          <button className={`ex-nav-btn ${tab === 'gratitude' ? 'active' : ''}`} onClick={() => setTab('gratitude')}>
            <Heart size={20} /> The Gratitude Wall
          </button>
        </div>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: 16, border: '1px solid rgba(16,185,129,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#10b981', fontWeight: 'bold', marginBottom: 8 }}>
            <AlertCircle size={16} /> Daily Quest
          </div>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: 1.4 }}>Complete 1 exercise from each category to earn the "Zen Master" badge!</p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="ex-content-area">
        <AnimatePresence mode="wait">
          {tab === 'breathing' && <BreathingExercise key="breathing" />}
          {tab === 'thought' && <ThoughtRecordWizard key="thought" />}
          {tab === 'gratitude' && <GratitudeWall key="gratitude" />}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Exercises;
