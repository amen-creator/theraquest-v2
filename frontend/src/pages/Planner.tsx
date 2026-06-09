import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ClipboardList, Zap, Download } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';

const APPROACHES = ['CBT (Cognitive Behavioral)', 'DBT (Dialectical Behavior)', 'Mindfulness-Based', 'ACT (Acceptance & Commitment)', 'Mixed Approach'];

const Planner: React.FC = () => {
  const { addXP, plannerPlan: plan, setPlannerPlan: setPlan } = useGlobalState();
  const [form, setForm] = useState({ concerns: '', goals: '', approach: APPROACHES[0] });
  const playSound = useAudio();
  const [loading, setLoading] = useState(false);

  const generate = async () => {
    if (!form.concerns || !form.goals) return;
    playSound('click');
    setLoading(true);
    setPlan('');
    try {
      const res = await fetch('http://localhost:8000/api/planner', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      setPlan(data.plan || '');
      playSound('success');
      addXP(15, 'Generated Recovery Plan');
    } catch {
      setPlan('⚠️ Backend offline. Please start the backend with `python run.py` and try again.');
    }
    setLoading(false);
  };

  return (
    <motion.div className="page-container" style={{ padding: '2rem', overflowY: 'auto', height: 'calc(100vh - 70px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #fff, #10b981)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>AI Recovery Planner</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Generate a personalized 7-day CBT recovery plan tailored to your needs.</p>
      </div>

      <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>😓 Main Concerns</label>
            <textarea rows={4} value={form.concerns} onChange={e => setForm(p => ({ ...p, concerns: e.target.value }))} placeholder="Social anxiety, overthinking, procrastination..." style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>🎯 Wellness Goals</label>
            <textarea rows={4} value={form.goals} onChange={e => setForm(p => ({ ...p, goals: e.target.value }))} placeholder="Reduce anxiety, build confidence, improve sleep..." style={{ width: '100%', background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', borderRadius: '10px', padding: '0.75rem', color: 'white', fontFamily: 'inherit', boxSizing: 'border-box', resize: 'vertical' }} />
          </div>
        </div>
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>📚 Preferred Therapeutic Approach</label>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {APPROACHES.map(a => (
              <button key={a} onClick={() => setForm(p => ({ ...p, approach: a }))} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', borderColor: form.approach === a ? 'var(--success)' : 'var(--border)', background: form.approach === a ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.03)', color: form.approach === a ? 'var(--success)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {a}
              </button>
            ))}
          </div>
        </div>
        <button onClick={generate} disabled={loading || !form.concerns || !form.goals} style={{ background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 700, cursor: 'pointer', opacity: loading || !form.concerns || !form.goals ? 0.5 : 1 }}>
          {loading ? '🧠 AI Building Your Plan...' : '🚀 Generate 7-Day Recovery Plan (+15 XP)'}
        </button>
      </div>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ background: 'var(--panel-bg)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0, color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><ClipboardList size={20}/> Your Personalized Recovery Plan</h3>
            <button onClick={() => { const blob = new Blob([plan], { type: 'text/markdown' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'theraquest_recovery_plan.md'; a.click(); }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--success)', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
              <Download size={16}/> Download
            </button>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.8', whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{plan}</div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Planner;
