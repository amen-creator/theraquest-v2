import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar
} from 'recharts';
import {
  Activity, Zap, ShieldAlert, CheckCircle, TrendingDown, TrendingUp,
  Play, Square, Coffee, RefreshCw, Heart, Brain, Trophy, Star, Flame, Clock
} from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Dashboard.css';

const MOODS = ['😰 Overwhelmed', '😟 Anxious', '😐 Neutral', '😊 Calm', '🌟 Thriving'];
const MOOD_SCORES: Record<string, number> = {
  '😰 Overwhelmed': 10, '😟 Anxious': 30, '😐 Neutral': 50, '😊 Calm': 75, '🌟 Thriving': 100
};

const PLACEHOLDER_METRICS = [
  { time: 'Day 1', anxiety: 0.8, engagement: 0.2, wellness: 20 },
  { time: 'Day 2', anxiety: 0.65, engagement: 0.4, wellness: 35 },
  { time: 'Day 3', anxiety: 0.5, engagement: 0.55, wellness: 50 },
  { time: 'Day 4', anxiety: 0.35, engagement: 0.7, wellness: 65 },
  { time: 'Day 5', anxiety: 0.2, engagement: 0.85, wellness: 80 },
];

const Dashboard: React.FC = () => {
  const { xp, level, streak, badges, moodLog, addXP, logMood } = useGlobalState();
  const [selectedMood, setSelectedMood] = useState('😐 Neutral');
  const playSound = useAudio();
  const [pomodoro, setPomodoro] = useState<'idle' | 'focus' | 'break'>('idle');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [pipelineOnline, setPipelineOnline] = useState(false);

  const xpProgress = xp % 100;

  // Pomodoro Timer
  useEffect(() => {
    if (pomodoro === 'idle') {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          if (pomodoro === 'focus') {
            playSound('success');
            addXP(10, 'Completed Focus Session');
          } else {
            playSound('notification');
          }
          setPomodoro('idle');
          return pomodoro === 'focus' ? 25 * 60 : 5 * 60;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [pomodoro]);

  const startPomodoro = (type: 'focus' | 'break') => {
    playSound('click');
    setPomodoro(type);
    setTimeLeft(type === 'focus' ? 25 * 60 : 5 * 60);
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  const handleLogMood = () => {
    playSound('success');
    logMood(selectedMood, MOOD_SCORES[selectedMood]);
    addXP(10, 'Logged Mood');
  };

  // Check backend health
  useEffect(() => {
    fetch('http://localhost:8000/')
      .then(r => r.ok ? setPipelineOnline(true) : setPipelineOnline(false))
      .catch(() => setPipelineOnline(false));
  }, []);

  const moodChartData = moodLog.length > 0
    ? [...moodLog].reverse().map((m, i) => ({ time: `#${i + 1}`, wellness: m.score }))
    : PLACEHOLDER_METRICS.map(d => ({ time: d.time, wellness: d.wellness }));

  const metricsData = PLACEHOLDER_METRICS;

  return (
    <motion.div
      className="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* ── Hero Bar ── */}
      <div className="hero-bar">
        <div className="hero-left">
          <h1>
            <span className="greeting-text">Welcome back, </span>
            <span className="hero-name">Warrior</span>
          </h1>
          <p className="hero-sub">Your mental wellness command center — powered by the Amaterasu MAS Pipeline.</p>
        </div>
        <div className="pipeline-status">
          <div className={`pipeline-dot ${pipelineOnline ? 'online' : 'offline'}`}></div>
          <span>{pipelineOnline ? 'Amaterasu Pipeline Online' : 'Connecting to Pipeline...'}</span>
        </div>
      </div>

      {/* ── KPI Stat Cards ── */}
      <div className="kpi-grid">
        <motion.div className="kpi-card" whileHover={{ scale: 1.03 }} style={{ borderColor: '#8b5cf6' }}>
          <div className="kpi-icon" style={{ background: 'rgba(139,92,246,0.1)' }}><Trophy size={28} color="#8b5cf6" /></div>
          <div className="kpi-info">
            <div className="kpi-value">Level {level}</div>
            <div className="kpi-label">Wellness Rank</div>
            <div className="kpi-sub">{xp} Total XP</div>
          </div>
        </motion.div>

        <motion.div className="kpi-card" whileHover={{ scale: 1.03 }} style={{ borderColor: '#ff6b35' }}>
          <div className="kpi-icon" style={{ background: 'rgba(255,107,53,0.1)' }}><Flame size={28} color="#ff6b35" /></div>
          <div className="kpi-info">
            <div className="kpi-value">{streak}</div>
            <div className="kpi-label">Day Streak</div>
            <div className="kpi-sub">Consecutive sessions</div>
          </div>
        </motion.div>

        <motion.div className="kpi-card" whileHover={{ scale: 1.03 }} style={{ borderColor: '#10b981' }}>
          <div className="kpi-icon" style={{ background: 'rgba(16,185,129,0.1)' }}><Heart size={28} color="#10b981" /></div>
          <div className="kpi-info">
            <div className="kpi-value">{moodLog.length}</div>
            <div className="kpi-label">Moods Tracked</div>
            <div className="kpi-sub">Latest: {moodLog[0]?.mood || '—'}</div>
          </div>
        </motion.div>

        <motion.div className="kpi-card" whileHover={{ scale: 1.03 }} style={{ borderColor: '#fbbf24' }}>
          <div className="kpi-icon" style={{ background: 'rgba(251,191,36,0.1)' }}><Star size={28} color="#fbbf24" /></div>
          <div className="kpi-info">
            <div className="kpi-value">{badges.length}</div>
            <div className="kpi-label">Badges Earned</div>
            <div className="kpi-sub">Keep unlocking!</div>
          </div>
        </motion.div>
      </div>

      {/* ── XP Progress Bar ── */}
      <div className="xp-progress-bar-wrap">
        <div className="xp-bar-labels">
          <span>Level {level}</span>
          <span>{xpProgress}/100 XP to Level {level + 1}</span>
        </div>
        <div className="xp-bar-track">
          <motion.div
            className="xp-bar-fill"
            initial={{ width: 0 }}
            animate={{ width: `${xpProgress}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        {/* ── Mental Health Vector Chart ── */}
        <div className="chart-card full-width">
          <h3><Activity size={18} /> Mental Health Vectors (Amaterasu Real-time Tracking)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={metricsData}>
              <defs>
                <linearGradient id="colorAnxiety" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 12 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} domain={[0, 1]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px' }}
                labelStyle={{ color: '#f9fafb' }}
              />
              <Area type="monotone" dataKey="anxiety" stroke="#ef4444" strokeWidth={2} fill="url(#colorAnxiety)" name="Anxiety" />
              <Area type="monotone" dataKey="engagement" stroke="#10b981" strokeWidth={2} fill="url(#colorEngagement)" name="Engagement" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* ── Mood Tracker ── */}
        <div className="chart-card">
          <h3><Heart size={18} /> Mood Tracker</h3>
          <div className="mood-buttons">
            {MOODS.map(mood => (
              <button
                key={mood}
                className={`mood-btn ${selectedMood === mood ? 'selected' : ''}`}
                onClick={() => setSelectedMood(mood)}
              >
                {mood.split(' ')[0]}
              </button>
            ))}
          </div>
          <p className="selected-mood-label">{selectedMood}</p>
          <button className="log-mood-btn" onClick={handleLogMood}>📌 Log Mood &nbsp;(+10 XP)</button>
          {moodLog.length > 0 && (
            <div className="mood-log">
              {moodLog.slice(0, 4).map((m, i) => (
                <div key={i} className="mood-log-entry">
                  <span>{m.mood}</span>
                  <span className="mood-time">{m.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Wellness Score Bar Chart ── */}
        <div className="chart-card">
          <h3><TrendingUp size={18} /> Wellness Score Trend</h3>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={moodChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#6b7280" tick={{ fontSize: 11 }} />
              <YAxis stroke="#6b7280" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '10px' }}
              />
              <Bar dataKey="wellness" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ── Pomodoro Timer ── */}
        <div className="chart-card pomodoro-card">
          <h3><Clock size={18} /> Focus Timer (Pomodoro)</h3>
          <div className={`timer-display ${pomodoro === 'focus' ? 'focus-active' : pomodoro === 'break' ? 'break-active' : ''}`}>
            {formatTime(timeLeft)}
          </div>
          <div className="timer-status-label">
            {pomodoro === 'focus' ? '🔴 DEEP FOCUS — Stay locked in!' : pomodoro === 'break' ? '🟢 BREAK TIME — Breathe easy' : '⚪ READY — Choose your mode'}
          </div>
          <div className="pomodoro-btns">
            <button
              className={`pomo-btn focus ${pomodoro === 'focus' ? 'active' : ''}`}
              onClick={() => pomodoro !== 'focus' ? startPomodoro('focus') : (setPomodoro('idle'), setTimeLeft(25 * 60))}
            >
              {pomodoro === 'focus' ? <><Square size={14}/> Stop</> : <><Play size={14}/> Focus (25m)</>}
            </button>
            <button
              className={`pomo-btn break ${pomodoro === 'break' ? 'active' : ''}`}
              onClick={() => pomodoro !== 'break' ? startPomodoro('break') : (setPomodoro('idle'), setTimeLeft(5 * 60))}
            >
              <Coffee size={14}/> {pomodoro === 'break' ? 'End Break' : 'Break (5m)'}
            </button>
          </div>
        </div>

        {/* ── Daily AI Insight ── */}
        <div className="chart-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, rgba(0,0,0,0) 70%)', borderRadius: '50%' }}></div>
          <h3 style={{ marginBottom: 16 }}><Brain size={18} color="#8b5cf6" /> Daily Therapist Insight</h3>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px 0' }}>
            <p style={{ fontSize: '1.05rem', fontStyle: 'italic', color: 'rgba(255,255,255,0.85)', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              "Your anxious thoughts are a protective mechanism, not a prediction of the future. Acknowledge them, and let them pass like clouds."
            </p>
          </div>
          <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Generated by Agent 1</span>
            <button onClick={() => playSound('click')} style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#8b5cf6', padding: '6px 12px', borderRadius: 8, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s' }}>
              Reflect (+5 XP)
            </button>
          </div>
        </div>

        {/* ── Agent Pipeline Status ── */}
        <div className="chart-card agent-status-card full-width">
          <h3><Zap size={18} /> Amaterasu Agent Pipeline — Status Monitor</h3>
          <div className="agents-status-grid">
            {[
              { name: 'Agent 1: Therapist', role: 'Sentiment & Cognitive Analysis', icon: '🧠', color: '#8b5cf6' },
              { name: 'Agent 2: Quest Generator', role: 'CBT Gamification Engine', icon: '🎮', color: '#fbbf24' },
              { name: 'Agent 3: Supervisor', role: 'Safety Guardrails & Persistence', icon: '🛡️', color: '#10b981' },
            ].map((agent, i) => (
              <motion.div
                key={i}
                className="agent-status-card-inner"
                style={{ borderColor: agent.color + '55' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="agent-status-icon" style={{ background: agent.color + '22' }}>{agent.icon}</div>
                <div>
                  <div className="agent-status-name">{agent.name}</div>
                  <div className="agent-status-role">{agent.role}</div>
                </div>
                <div className={`agent-online-badge ${pipelineOnline ? 'online' : 'offline'}`}>
                  {pipelineOnline ? '● Online' : '○ Offline'}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
