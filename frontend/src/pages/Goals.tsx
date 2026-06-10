import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Download, Trophy, CheckCircle2, Circle, Plus, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Goals.css';

const TIMELINES = ['2 Weeks', '1 Month', '3 Months', '6 Months', '1 Year'];
const EXAMPLE_GOALS = [
  "I want to manage my social anxiety so I can attend events comfortably",
  "I want to build a healthy sleep routine and feel energized",
  "I want to stop procrastinating and finish my important projects",
  "I want to feel less overwhelmed and develop healthy coping skills",
];

interface Task { text: string; done: boolean; }
interface Milestone { title: string; summary: string; tasks: Task[]; week?: string; }
interface SavedGoal { id: string; goal: string; timeline: string; milestones: Milestone[]; createdAt: string; }

// Parses AI markdown output into structured Milestone objects
const parseRoadmap = (raw: string): Milestone[] => {
  const milestones: Milestone[] = [];
  // Split by week/phase headers
  const blocks = raw.split(/(?=#{1,3}\s+(?:Week|Phase|Milestone|Month|Step)\s+\d+)/i);

  blocks.forEach(block => {
    if (!block.trim()) return;
    const lines = block.trim().split('\n').filter(l => l.trim());
    if (!lines.length) return;

    // First line is the title
    const title = lines[0].replace(/^#{1,3}\s*/, '').replace(/\*\*/g, '').trim();
    const tasks: Task[] = [];
    const bodyLines: string[] = [];

    lines.slice(1).forEach(line => {
      const stripped = line.trim();
      if (stripped.startsWith('- ') || stripped.startsWith('* ') || stripped.match(/^\d+\.\s/)) {
        tasks.push({ text: stripped.replace(/^[-*\d.]\s+/, '').replace(/\*\*/g, '').trim(), done: false });
      } else if (stripped && !stripped.startsWith('#')) {
        bodyLines.push(stripped.replace(/\*\*/g, ''));
      }
    });

    milestones.push({
      title,
      summary: bodyLines.join(' ').slice(0, 200) || 'Focus on building momentum this phase.',
      tasks: tasks.length > 0 ? tasks : [
        { text: 'Reflect on your progress', done: false },
        { text: 'Complete at least one exercise session', done: false },
      ],
    });
  });

  // Fallback: if parsing fails, show raw content as single milestone
  if (!milestones.length) {
    milestones.push({ title: 'Your Wellness Roadmap', summary: raw.slice(0, 300), tasks: [] });
  }

  return milestones.slice(0, 8); // max 8 milestones
};

const Goals: React.FC = () => {
  const { addXP, unlockBadge, goalRoadmap, setGoalRoadmap } = useGlobalState();
  const playSound = useAudio();

  const [goal, setGoal] = useState('');
  const [timeline, setTimeline] = useState('1 Month');
  const [loading, setLoading] = useState(false);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [savedGoals, setSavedGoals] = useState<SavedGoal[]>([]);
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [exampleIdx, setExampleIdx] = useState(0);

  const build = async () => {
    if (!goal.trim()) return;
    playSound('click');
    setLoading(true);
    setGoalRoadmap('');
    setMilestones([]);
    try {
      const res = await fetch('http://localhost:8000/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goal, timeline }),
      });
      const data = await res.json();
      const raw = data.roadmap || '';
      setGoalRoadmap(raw);
      const parsed = parseRoadmap(raw);
      setMilestones(parsed);

      // Save to sidebar list
      const newGoal: SavedGoal = {
        id: Date.now().toString(),
        goal: goal.slice(0, 60),
        timeline,
        milestones: parsed,
        createdAt: new Date().toLocaleDateString(),
      };
      setSavedGoals(prev => [newGoal, ...prev]);
      setActiveGoalId(newGoal.id);

      playSound('success');
      addXP(30, 'Built Wellness Roadmap');
      unlockBadge('Goal Setter 🎯');
    } catch {
      const fallback = parseRoadmap('### Week 1\nBuild your foundation. Start with awareness.\n- Begin a daily mood journal\n- Practice 10 minutes of mindfulness each morning\n- Identify your 3 main triggers\n\n### Week 2\nDeepen your practice.\n- Apply CBT thought records\n- Introduce a 10-minute walk daily\n- Schedule one social activity\n\n### Week 3\nBuild momentum.\n- Practice assertive communication\n- Reduce avoidance behaviors\n- Celebrate small wins\n\n### Week 4\nConsolidate growth.\n- Review your progress\n- Plan next month\'s goals\n- Reward yourself meaningfully');
      setMilestones(fallback);
      const newGoal: SavedGoal = { id: Date.now().toString(), goal: goal.slice(0, 60), timeline, milestones: fallback, createdAt: new Date().toLocaleDateString() };
      setSavedGoals(prev => [newGoal, ...prev]);
      setActiveGoalId(newGoal.id);
      addXP(30, 'Built Wellness Roadmap (Offline)');
    }
    setLoading(false);
  };

  const toggleTask = (mIdx: number, tIdx: number) => {
    playSound('click');
    setMilestones(prev => {
      const updated = [...prev];
      updated[mIdx] = {
        ...updated[mIdx],
        tasks: updated[mIdx].tasks.map((t, i) => i === tIdx ? { ...t, done: !t.done } : t),
      };
      return updated;
    });
    addXP(5, 'Completed a goal task');
  };

  const completedTasks = milestones.reduce((sum, m) => sum + m.tasks.filter(t => t.done).length, 0);
  const totalTasks = milestones.reduce((sum, m) => sum + m.tasks.length, 0);
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const loadSaved = (sg: SavedGoal) => {
    setActiveGoalId(sg.id);
    setMilestones(sg.milestones);
    setGoal(sg.goal);
    setTimeline(sg.timeline);
  };

  const deleteSaved = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedGoals(prev => prev.filter(g => g.id !== id));
    if (activeGoalId === id) { setMilestones([]); setActiveGoalId(null); }
  };

  const downloadRoadmap = () => {
    const text = milestones.map(m => `## ${m.title}\n${m.summary}\n\nTasks:\n${m.tasks.map(t => `- [${t.done ? 'x' : ' '}] ${t.text}`).join('\n')}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'goal_roadmap.md'; a.click();
  };

  const showRoadmap = milestones.length > 0 && !loading;

  return (
    <div className="goals-page">

      {/* ── SIDEBAR ── */}
      <div className="goals-sidebar">
        <div className="goals-sidebar-header">
          <h2>Goal Coach</h2>
          <p>Your active wellness roadmaps</p>
        </div>

        {/* New Goal button */}
        <button
          onClick={() => { setMilestones([]); setActiveGoalId(null); setGoal(''); }}
          className="btn-wizard btn-primary"
          style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center' }}
        >
          <Plus size={18} /> New Roadmap
        </button>

        {/* Saved goals */}
        <div className="goals-active-list">
          {savedGoals.length === 0 && (
            <div style={{ color: '#4b5563', fontSize: '0.85rem', textAlign: 'center', paddingTop: '1rem' }}>
              No roadmaps yet. Build your first one! 🎯
            </div>
          )}
          {savedGoals.map(sg => {
            const done = sg.milestones.reduce((s, m) => s + m.tasks.filter(t => t.done).length, 0);
            const total = sg.milestones.reduce((s, m) => s + m.tasks.length, 0);
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <div
                key={sg.id}
                className={`goal-mini-card ${activeGoalId === sg.id ? 'active-selected' : ''}`}
                onClick={() => loadSaved(sg)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="goal-mini-title">{sg.goal}</div>
                  <button onClick={(e) => deleteSaved(sg.id, e)} style={{ background: 'transparent', border: 'none', color: '#4b5563', cursor: 'pointer', padding: 0, flexShrink: 0 }}>
                    <Trash2 size={12} />
                  </button>
                </div>
                <div className="goal-mini-meta">{sg.timeline} • {sg.createdAt} • {pct}%</div>
                <div className="goal-mini-progress-bar">
                  <div className="goal-mini-progress-fill" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="goals-main" style={{ overflow: 'auto', flex: 1, padding: '2.5rem 3rem' }}>
        <AnimatePresence mode="wait">

          {/* INPUT FORM */}
          {!loading && !showRoadmap && (
            <motion.div key="form" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <div className="goal-input-hero">
                <h1>AI Goal Coach</h1>
                <p>Describe your wellness vision and receive a fully structured, CBT-backed milestone roadmap personalized just for you.</p>

                <textarea
                  className="goal-textarea"
                  value={goal}
                  onChange={e => setGoal(e.target.value)}
                  placeholder={EXAMPLE_GOALS[exampleIdx]}
                  rows={5}
                />

                {/* Example prompts cycling */}
                <button
                  onClick={() => { setExampleIdx(i => (i + 1) % EXAMPLE_GOALS.length); setGoal(EXAMPLE_GOALS[(exampleIdx + 1) % EXAMPLE_GOALS.length]); playSound('click'); }}
                  style={{ background: 'transparent', border: 'none', color: '#88a0b0', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 6, marginTop: '0.5rem', padding: 0 }}
                >
                  <RefreshCw size={14} /> Try an example
                </button>

                {/* Timeline */}
                <div style={{ margin: '1.8rem 0 0.5rem', color: '#88a0b0', fontSize: '0.9rem', fontWeight: 600 }}>
                  ⏱️ Timeline
                </div>
                <div className="goal-timeline-chips">
                  {TIMELINES.map(t => (
                    <button key={t} className={`goal-timeline-chip ${timeline === t ? 'active' : ''}`} onClick={() => { setTimeline(t); playSound('click'); }}>
                      {t}
                    </button>
                  ))}
                </div>

                <button className="goal-build-btn" onClick={build} disabled={!goal.trim()}>
                  🗺️ Build My Roadmap (+30 XP)
                </button>
              </div>
            </motion.div>
          )}

          {/* LOADING */}
          {loading && (
            <motion.div key="loading" className="goal-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="goal-loading-ring" />
              <h2 style={{ color: '#fff', margin: 0 }}>Crafting Your Roadmap...</h2>
              <p style={{ color: '#88a0b0' }}>AI is designing your personalized milestone journey</p>
            </motion.div>
          )}

          {/* ROADMAP VIEW */}
          {showRoadmap && (
            <motion.div key="roadmap" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Header */}
              <div className="goal-roadmap-header">
                <div>
                  <h2><Trophy size={26} color="#ef4444" /> Your {timeline} Roadmap</h2>
                  <p style={{ margin: '0.3rem 0 0', color: '#88a0b0', fontSize: '0.95rem' }}>
                    {completedTasks}/{totalTasks} tasks complete • {overallProgress}% progress
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button onClick={() => { setMilestones([]); setActiveGoalId(null); }} className="btn-wizard btn-secondary">
                    <Plus size={16} /> New Goal
                  </button>
                  <button onClick={downloadRoadmap} className="btn-wizard btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Download size={16} /> Export
                  </button>
                </div>
              </div>

              {/* Overall progress bar */}
              <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 8, height: 8, marginBottom: '2.5rem', overflow: 'hidden' }}>
                <motion.div
                  style={{ height: '100%', background: 'linear-gradient(90deg, #ef4444, #f97316)', borderRadius: 8 }}
                  initial={{ width: 0 }}
                  animate={{ width: `${overallProgress}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              </div>

              {/* Milestones */}
              <div className="milestone-list">
                {milestones.map((m, mIdx) => {
                  const doneTasks = m.tasks.filter(t => t.done).length;
                  const isComplete = doneTasks === m.tasks.length && m.tasks.length > 0;
                  return (
                    <motion.div
                      key={mIdx}
                      className={`milestone-card ${isComplete ? 'completed' : ''}`}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: mIdx * 0.1, type: 'spring', stiffness: 150 }}
                    >
                      <div className="milestone-dot" />

                      <div className="milestone-header">
                        <div className="milestone-title">
                          {isComplete ? '✅ ' : `${mIdx + 1}. `}{m.title}
                        </div>
                        <div
                          className="milestone-badge"
                          style={{
                            background: isComplete ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.1)',
                            color: isComplete ? '#10b981' : '#ef4444',
                            border: `1px solid ${isComplete ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.2)'}`
                          }}
                        >
                          {isComplete ? 'COMPLETE' : `${doneTasks}/${m.tasks.length}`}
                        </div>
                      </div>

                      <div className="milestone-body">{m.summary}</div>

                      {m.tasks.length > 0 && (
                        <div className="milestone-tasks">
                          {m.tasks.map((task, tIdx) => (
                            <div
                              key={tIdx}
                              className={`milestone-task ${task.done ? 'done' : ''}`}
                              onClick={() => toggleTask(mIdx, tIdx)}
                            >
                              <div className="milestone-task-check">
                                {task.done && <CheckCircle2 size={12} color="#fff" />}
                              </div>
                              {task.text}
                            </div>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Completion message */}
              {overallProgress === 100 && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  style={{ textAlign: 'center', marginTop: '2rem', padding: '2rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 20 }}
                >
                  <Sparkles size={40} color="#10b981" style={{ margin: '0 auto 1rem' }} />
                  <h2 style={{ color: '#10b981', margin: '0 0 0.5rem' }}>Roadmap Complete!</h2>
                  <p style={{ color: '#88a0b0', margin: 0 }}>You've achieved all milestones. Set a new, bolder goal!</p>
                </motion.div>
              )}

              <div style={{ height: '3rem' }} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Goals;
