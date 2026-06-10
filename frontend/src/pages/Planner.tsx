import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardList, Download, ArrowRight, BrainCircuit, Target, Sparkles, AlertCircle, Sun, Activity, Battery, Coffee, Moon } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Planner.css';

// Lightweight inline Markdown renderer — no external dependencies
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  return (
    <div>
      {lines.map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        if (line.startsWith('### ')) return <h3 key={i} style={{ color: '#10b981', margin: '1rem 0 0.5rem' }}>{line.slice(4)}</h3>;
        if (line.startsWith('## '))  return <h2 key={i} style={{ color: '#fff', margin: '1.5rem 0 0.5rem' }}>{line.slice(3)}</h2>;
        if (line.startsWith('# '))   return <h1 key={i} style={{ color: '#fff' }}>{line.slice(2)}</h1>;
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} style={{ display: 'flex', gap: 8, margin: '0.3rem 0', alignItems: 'flex-start' }}>
              <span style={{ color: '#10b981', flexShrink: 0 }}>•</span>
              <span style={{ color: '#d1d5db' }}>{line.slice(2)}</span>
            </div>
          );
        }
        if (/^\d+\./.test(line)) {
          return <p key={i} style={{ margin: '0.3rem 0', color: '#d1d5db' }}>{line}</p>;
        }
        // Bold text
        const boldParsed = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        return <p key={i} style={{ margin: '0.3rem 0', color: '#d1d5db' }} dangerouslySetInnerHTML={{ __html: boldParsed }} />;
      })}
    </div>
  );
};

const APPROACHES = [
  { id: 'CBT', label: 'CBT (Cognitive Behavioral)', desc: 'Focuses on changing negative thought patterns.' },
  { id: 'DBT', label: 'DBT (Dialectical Behavior)', desc: 'Focuses on emotional regulation and mindfulness.' },
  { id: 'ACT', label: 'ACT (Acceptance & Commitment)', desc: 'Accept what is out of your control, commit to action.' },
  { id: 'Mindfulness', label: 'Mindfulness-Based', desc: 'Focuses on present-moment awareness and meditation.' }
];

const COMMON_CONCERNS = ['Social Anxiety', 'Overthinking', 'Procrastination', 'Low Energy', 'Burnout', 'Insomnia', 'Panic Attacks'];
const COMMON_GOALS = ['Build Confidence', 'Improve Sleep', 'Reduce Stress', 'Better Focus', 'Emotional Balance', 'Establish Routine'];

export const Planner: React.FC = () => {
  const { addXP, plannerPlan: plan, setPlannerPlan: setPlan } = useGlobalState();
  
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({ mood: 50, energy: 50, concerns: [] as string[], customConcern: '', goals: [] as string[], customGoal: '', approach: APPROACHES[0].id });
  
  const playSound = useAudio();
  const [loading, setLoading] = useState(false);

  // If a plan already exists, show it immediately (step 4)
  React.useEffect(() => {
    if (plan && step === 0) setStep(4);
  }, [plan]);

  const toggleArrayItem = (field: 'concerns' | 'goals', item: string) => {
    playSound('click');
    setForm(prev => {
      const arr = prev[field];
      if (arr.includes(item)) return { ...prev, [field]: arr.filter(i => i !== item) };
      if (arr.length >= 3) return prev; // Max 3
      return { ...prev, [field]: [...arr, item] };
    });
  };

  const nextStep = () => {
    playSound('click');
    setStep(s => s + 1);
  };

  const generate = async () => {
    playSound('click');
    setLoading(true);
    setStep(4);
    
    // Format the prompt clearly for the backend
    const combinedConcerns = [...form.concerns, form.customConcern].filter(Boolean).join(', ');
    const combinedGoals = [...form.goals, form.customGoal].filter(Boolean).join(', ');

    try {
      const res = await fetch('http://localhost:8000/api/planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ concerns: combinedConcerns, goals: combinedGoals, approach: form.approach })
      });
      const data = await res.json();
      setPlan(data.plan || '');
      playSound('success');
      addXP(50, 'Generated AI Recovery Roadmap');
    } catch {
      setPlan('### Error\n⚠️ Backend offline. Please start the backend with `python run.py` and try again.');
    }
    setLoading(false);
  };

  const reset = () => {
    setPlan('');
    setStep(0);
    setForm({ mood: 50, energy: 50, concerns: [], customConcern: '', goals: [], customGoal: '', approach: APPROACHES[0].id });
  };

  // Helper to parse the raw markdown plan into Timeline nodes
  // Looking for headings like ### Day 1, Day 1:, **Day 1**, etc.
  const parsePlanToRoadmap = (rawPlan: string) => {
    const days: { title: string; content: string }[] = [];
    
    // Split by "Day X" pattern (assuming the AI generates them as headings or bold text)
    // Regex matches "### Day 1", "**Day 1**", "Day 1:", etc.
    const dayRegex = /(?:###\s+|\*\*\s*)?(Day\s+\d+)(?:[:\-]*\s*\**)?/gi;
    
    const splits = rawPlan.split(dayRegex);
    
    if (splits.length <= 1) {
      // If parsing fails, just return one big block
      return [{ title: 'Overview', content: rawPlan }];
    }

    let intro = splits[0].trim();
    if (intro) days.push({ title: 'Introduction', content: intro });

    for (let i = 1; i < splits.length; i += 2) {
      const title = splits[i].trim();
      const content = splits[i+1] ? splits[i+1].trim() : '';
      
      // Clean up markdown hashes from title if present
      const cleanTitle = title.replace(/#/g, '').trim();
      days.push({ title: cleanTitle, content });
    }

    return days;
  };

  const roadmapNodes = plan ? parsePlanToRoadmap(plan) : [];

  return (
    <div className="planner-page">
      <AnimatePresence mode="wait">
        
        {/* WIZARD VIEW */}
        {step < 4 && (
          <motion.div key="wizard" className="planner-wizard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>
            <div className="planner-wizard-header">
              <h1>Therapeutic Blueprint</h1>
              <p>Step {step + 1} of 4 • AI-Powered Assessment</p>
              
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: '1.5rem' }}>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} style={{ width: 40, height: 4, background: i <= step ? '#10b981' : 'rgba(255,255,255,0.1)', borderRadius: 2, transition: 'all 0.3s' }} />
                ))}
              </div>
            </div>

            {/* STEP 1: Mood & Energy */}
            {step === 0 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="planner-step-title"><Activity size={24} color="#3b82f6"/> Current State</h2>
                
                <div style={{ marginBottom: '2rem' }}>
                  <label style={{ color: '#88a0b0', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>Mood</span> <span>{form.mood}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={form.mood} onChange={e => setForm(f => ({...f, mood: parseInt(e.target.value)}))} style={{ width: '100%', accentColor: '#3b82f6' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    <span title="Depressed"><Moon size={16}/></span>
                    <span title="Neutral"><Coffee size={16}/></span>
                    <span title="Excellent"><Sun size={16}/></span>
                  </div>
                </div>

                <div>
                  <label style={{ color: '#88a0b0', display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <span>Energy Level</span> <span>{form.energy}%</span>
                  </label>
                  <input type="range" min="0" max="100" value={form.energy} onChange={e => setForm(f => ({...f, energy: parseInt(e.target.value)}))} style={{ width: '100%', accentColor: '#10b981' }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666', marginTop: '0.5rem' }}>
                    <span title="Exhausted"><Battery size={16} strokeWidth={1} /></span>
                    <span title="Full"><Battery size={16} fill="#10b981" /></span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Concerns */}
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="planner-step-title"><AlertCircle size={24} color="#ef4444"/> Primary Challenges</h2>
                <p style={{ color: '#88a0b0', marginBottom: '1.5rem' }}>Select up to 3 core issues you're facing right now.</p>
                
                <div className="chip-grid">
                  {COMMON_CONCERNS.map(c => (
                    <button key={c} className={`planner-chip ${form.concerns.includes(c) ? 'selected' : ''}`} onClick={() => toggleArrayItem('concerns', c)}>
                      {c}
                    </button>
                  ))}
                </div>
                
                <input 
                  type="text" 
                  value={form.customConcern} 
                  onChange={e => setForm(f => ({...f, customConcern: e.target.value}))} 
                  placeholder="Or describe something else..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', fontSize: '1rem', outline: 'none' }}
                />
              </motion.div>
            )}

            {/* STEP 3: Goals */}
            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="planner-step-title"><Target size={24} color="#10b981"/> Wellness Goals</h2>
                <p style={{ color: '#88a0b0', marginBottom: '1.5rem' }}>What does success look like for you this week? (Select up to 3)</p>
                
                <div className="chip-grid">
                  {COMMON_GOALS.map(c => (
                    <button key={c} className={`planner-chip ${form.goals.includes(c) ? 'selected' : ''}`} onClick={() => toggleArrayItem('goals', c)}>
                      {c}
                    </button>
                  ))}
                </div>
                
                <input 
                  type="text" 
                  value={form.customGoal} 
                  onChange={e => setForm(f => ({...f, customGoal: e.target.value}))} 
                  placeholder="Custom goal..."
                  style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: 'none', borderBottom: '2px solid rgba(255,255,255,0.1)', color: '#fff', padding: '1rem', fontSize: '1rem', outline: 'none' }}
                />
              </motion.div>
            )}

            {/* STEP 4: Approach & Submit */}
            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                <h2 className="planner-step-title"><BrainCircuit size={24} color="#8b5cf6"/> Therapeutic Approach</h2>
                <p style={{ color: '#88a0b0', marginBottom: '1.5rem' }}>Select the psychological framework for your roadmap.</p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {APPROACHES.map(a => (
                    <div 
                      key={a.id} 
                      onClick={() => { playSound('click'); setForm(f => ({...f, approach: a.id})) }}
                      style={{ padding: '1.5rem', borderRadius: 16, border: `2px solid ${form.approach === a.id ? '#8b5cf6' : 'rgba(255,255,255,0.05)'}`, background: form.approach === a.id ? 'rgba(139,92,246,0.1)' : 'rgba(0,0,0,0.2)', cursor: 'pointer', transition: 'all 0.2s' }}
                    >
                      <h3 style={{ margin: '0 0 0.5rem 0', color: form.approach === a.id ? '#fff' : '#ccc' }}>{a.label}</h3>
                      <p style={{ margin: 0, color: '#88a0b0', fontSize: '0.9rem' }}>{a.desc}</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Navigation Controls */}
            <div className="planner-controls">
              <button 
                className="btn-wizard btn-secondary" 
                onClick={() => setStep(s => s - 1)} 
                disabled={step === 0}
                style={{ opacity: step === 0 ? 0 : 1 }}
              >
                Back
              </button>
              
              {step < 3 ? (
                <button className="btn-wizard btn-primary" onClick={nextStep} disabled={step === 1 && form.concerns.length === 0 && !form.customConcern}>
                  Continue <ArrowRight size={18}/>
                </button>
              ) : (
                <button className="btn-wizard btn-primary" onClick={generate}>
                  <Sparkles size={18}/> Generate Roadmap (+50 XP)
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* ROADMAP VIEW (Step 4+) */}
        {step === 4 && (
          <motion.div key="roadmap" className="roadmap-container" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            
            {loading ? (
              <div className="loading-container">
                <BrainCircuit size={64} color="#10b981" style={{ animation: 'pulse 2s infinite' }} />
                <h2 style={{ color: '#fff' }}>Synthesizing Cognitive Blueprint...</h2>
                <div style={{ width: '300px', background: 'rgba(255,255,255,0.1)', height: 4, borderRadius: 2, overflow: 'hidden' }}>
                  <div className="scanning-line" />
                </div>
              </div>
            ) : (
              <>
                <div className="roadmap-header">
                  <div>
                    <h2><ClipboardList size={28} color="#10b981" /> 7-Day Clinical Roadmap</h2>
                    <p style={{ color: '#88a0b0', margin: '0.5rem 0 0 0', fontSize: '1.1rem' }}>Based on {form.approach} framework for {form.goals[0] || 'wellness'}.</p>
                  </div>
                  <div style={{ display: 'flex', gap: '1rem' }}>
                    <button onClick={reset} className="btn-wizard btn-secondary">New Plan</button>
                    <button 
                      onClick={() => { const blob = new Blob([plan], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'roadmap.md'; a.click(); }} 
                      className="btn-wizard btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    >
                      <Download size={18}/> Export
                    </button>
                  </div>
                </div>

                <div className="timeline">
                  {roadmapNodes.map((node, i) => (
                    <motion.div 
                      key={i} 
                      className="timeline-node"
                      initial={{ opacity: 0, x: -50 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.15, type: 'spring' }}
                    >
                      <div className="timeline-dot" />
                      <div className="timeline-card">
                        <h3>{node.title}</h3>
                        <div className="timeline-content">
                          <SimpleMarkdown text={node.content} />
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
                
                <div style={{ textAlign: 'center', marginTop: '4rem', paddingBottom: '4rem' }}>
                  <Sparkles size={32} color="#10b981" style={{ marginBottom: '1rem' }} />
                  <h3 style={{ color: '#fff' }}>You're ready to begin.</h3>
                  <p style={{ color: '#88a0b0' }}>Take it one day at a time. The XP has been added to your profile.</p>
                </div>
              </>
            )}

          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default Planner;
