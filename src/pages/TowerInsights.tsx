import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie
} from 'recharts';
import { Database, TrendingUp, Flame, Trophy, Activity, Zap, Star, Shield } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import './TowerInsights.css';

const TOOLTIP_STYLE = {
  background: 'rgba(8,12,28,0.98)',
  border: '1px solid rgba(59,130,246,0.25)',
  borderRadius: 12,
  color: '#fff',
  fontSize: 13,
};

const HEATMAP_COLORS = ['rgba(255,255,255,0.04)', '#1a2e4a', '#1e40af', '#3b82f6', '#93c5fd'];

const generateHeatmap = (streak: number) =>
  Array.from({ length: 84 }, (_, i) => {
    const fromEnd = 83 - i;
    if (fromEnd < streak) return { id: i, value: Math.floor(Math.random() * 2) + 3 };
    if (fromEnd < streak + 10) return { id: i, value: Math.floor(Math.random() * 2) + 1 };
    return { id: i, value: Math.random() > 0.55 ? Math.floor(Math.random() * 3) + 1 : 0 };
  });

const ALL_BADGES = [
  { emoji: '🌱', name: 'First Steps',      desc: 'Earn your first XP' },
  { emoji: '⭐', name: 'Rising Star',       desc: 'Reach 500 XP' },
  { emoji: '🔥', name: '3-Day Streak',      desc: 'Login 3 days in a row' },
  { emoji: '💪', name: '7-Day Streak',      desc: 'Login 7 days in a row' },
  { emoji: '🎯', name: 'Goal Setter',       desc: 'Build a wellness roadmap' },
  { emoji: '🧠', name: 'Level 5 Adept',     desc: 'Reach Level 5' },
  { emoji: '🌟', name: 'Level 10 Master',   desc: 'Reach Level 10' },
  { emoji: '💗', name: 'Self-Aware',        desc: 'Log 3 moods' },
];

// ── Stat Ring (circular progress) ─────────────────────────────────────────
const StatRing: React.FC<{ value: number; max: number; label: string; sublabel: string; color: string; size?: number }> =
  ({ value, max, label, sublabel, color, size = 120 }) => {
    const r = (size - 16) / 2;
    const circ = 2 * Math.PI * r;
    const pct = Math.min(value / Math.max(max, 1), 1);
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
        <svg width={size} height={size}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={8} />
          <motion.circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke={color} strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: circ - pct * circ }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            filter={`drop-shadow(0 0 6px ${color})`}
          />
          <text x={size / 2} y={size / 2 - 4} textAnchor="middle" fill="#fff" fontSize={size > 100 ? 20 : 15} fontWeight={900}>{label}</text>
          <text x={size / 2} y={size / 2 + 14} textAnchor="middle" fill="#88a0b0" fontSize={9} fontWeight={600}>{sublabel}</text>
        </svg>
      </div>
    );
  };

// ── KPI Pill ───────────────────────────────────────────────────────────────
const KpiPill: React.FC<{ icon: React.ReactNode; label: string; value: string; delta: string; good: boolean; color: string; delay: number }> =
  ({ icon, label, value, delta, good, color, delay }) => (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, type: 'spring', stiffness: 160 }}
      style={{
        background: 'rgba(18,24,44,0.7)', border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 20, padding: '1.6rem 1.8rem', backdropFilter: 'blur(20px)',
        borderTop: `3px solid ${color}`, display: 'flex', flexDirection: 'column', gap: 6,
        transition: 'transform 0.25s, box-shadow 0.25s', cursor: 'default',
      }}
      whileHover={{ y: -4, boxShadow: `0 16px 32px rgba(0,0,0,0.35), 0 0 20px ${color}22` }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#88a0b0', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5 }}>
        {icon} {label}
      </div>
      <div style={{ fontSize: '2.6rem', fontWeight: 900, color: '#fff', lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: good ? '#10b981' : '#f59e0b' }}>{delta}</div>
    </motion.div>
  );

// ── Main Component ─────────────────────────────────────────────────────────
const TowerInsights: React.FC = () => {
  const { level, streak, xp, badges, moodLog } = useGlobalState();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => { setTimeout(() => setLoaded(true), 800); }, []);

  const heatmap = useMemo(() => generateHeatmap(streak), [streak]);

  // Derived stats
  const xpForLevel = (lvl: number) => Math.pow(lvl, 2) * 50;
  const xpThisLevel = xp - xpForLevel(level - 1);
  const xpNeeded = xpForLevel(level) - xpForLevel(level - 1);
  const xpPct = Math.min((xpThisLevel / Math.max(xpNeeded, 1)) * 100, 100);

  const avgMood = moodLog.length > 0
    ? Math.round(moodLog.reduce((s, m) => s + m.score, 0) / moodLog.length)
    : null;

  const moodChartData = useMemo(() =>
    [...moodLog].reverse().slice(-10).map((m, i) => ({
      idx: `#${i + 1}`, score: m.score, label: m.mood,
    })), [moodLog]);

  const moodDist = useMemo(() => {
    if (!moodLog.length) return [];
    const c = { Thriving: 0, Stable: 0, Low: 0 };
    moodLog.forEach(m => {
      if (m.score >= 70) c.Thriving++;
      else if (m.score >= 40) c.Stable++;
      else c.Low++;
    });
    return [
      { name: 'Thriving', val: c.Thriving, color: '#10b981' },
      { name: 'Stable',   val: c.Stable,   color: '#3b82f6' },
      { name: 'Low',      val: c.Low,       color: '#ef4444' },
    ].filter(d => d.val > 0);
  }, [moodLog]);

  const radarData = [
    { axis: 'Consistency', score: Math.min(streak * 14, 100) },
    { axis: 'XP Power',    score: Math.min(xp / 8, 100) },
    { axis: 'Level',       score: Math.min(level * 10, 100) },
    { axis: 'Mood',        score: avgMood ?? 50 },
    { axis: 'Badges',      score: Math.min(badges.length * 12, 100) },
    { axis: 'Mindfulness', score: Math.min(moodLog.length * 14, 100) },
  ];

  if (!loaded) {
    return (
      <div className="tower-page">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 20 }}>
          {[80, 200, 160, 280].map((h, i) => (
            <div key={i} className="pulse-skeleton" style={{ height: h, borderRadius: 20 }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="tower-page">

      {/* ── PAGE HEADER ── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '2.6rem', fontWeight: 900, margin: '0 0 0.4rem', background: 'linear-gradient(135deg, #fff 30%, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Tower Insights
          </h1>
          <p style={{ margin: 0, color: '#88a0b0', fontSize: '0.95rem' }}>Your complete wellness analytics dashboard · Data synced in real-time</p>
        </div>
        <div className="tower-status-badge">
          <div className="tower-status-dot" />
          Live · {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </motion.div>

      {/* ── ROW 1: STAT RINGS + KPI PILLS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1.5rem', marginBottom: '1.5rem', alignItems: 'stretch' }}>

        {/* Stat rings card */}
        <motion.div
          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
          style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 24, padding: '2rem 2.5rem', backdropFilter: 'blur(20px)', display: 'flex', gap: '2.5rem', alignItems: 'center' }}
        >
          <StatRing value={level} max={20} label={`Lv${level}`} sublabel="LEVEL" color="#fbbf24" size={130} />
          <StatRing value={streak} max={30} label={streak.toString()} sublabel="STREAK" color="#ef4444" size={110} />
          <StatRing value={badges.length} max={ALL_BADGES.length} label={badges.length.toString()} sublabel="BADGES" color="#10b981" size={110} />
        </motion.div>

        {/* KPI pills */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <KpiPill icon={<Zap size={13} />} label="Total XP" value={xp.toLocaleString()} delta={`+${Math.round(xpPct)}% to Level ${level + 1}`} good={true} color="#fbbf24" delay={0.05} />
          <KpiPill icon={<Flame size={13} />} label="Day Streak" value={`${streak}🔥`} delta={streak >= 7 ? '7-day badge achieved!' : `${7 - streak} more for 7-day badge`} good={streak >= 3} color="#ef4444" delay={0.1} />
          <KpiPill icon={<Activity size={13} />} label="Avg Mood" value={avgMood !== null ? `${avgMood}/100` : '—'} delta={avgMood !== null ? (avgMood >= 65 ? 'Thriving range ↑' : avgMood >= 40 ? 'Stable range' : 'Needs attention ↓') : 'Log a mood to start'} good={avgMood !== null && avgMood >= 55} color="#8b5cf6" delay={0.15} />
          <KpiPill icon={<Trophy size={13} />} label="Badges" value={badges.length.toString()} delta={badges.length > 0 ? `Latest: ${badges[badges.length - 1]}` : 'Complete activities to earn'} good={badges.length > 0} color="#10b981" delay={0.2} />
        </div>
      </div>

      {/* ── ROW 2: XP PROGRESS BAR ── */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
        style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.6rem 2rem', backdropFilter: 'blur(20px)', marginBottom: '1.5rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <div style={{ color: '#fff', fontWeight: 800, fontSize: '1.05rem' }}>Level {level} → Level {level + 1}</div>
            <div style={{ color: '#88a0b0', fontSize: '0.83rem', marginTop: 3 }}>
              {xpThisLevel} / {xpNeeded} XP this level · {Math.round(xpNeeded - xpThisLevel)} XP remaining
            </div>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#fbbf24' }}>{Math.round(xpPct)}%</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, height: 14, overflow: 'hidden' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${xpPct}%` }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f97316, #ef4444)', borderRadius: 10, boxShadow: '0 0 20px rgba(251,191,36,0.5)' }}
          />
        </div>
        {/* Level milestones */}
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          {[1, 3, 5, 10, 15, 20].map(lvl => (
            <div key={lvl} style={{ padding: '0.3rem 0.8rem', borderRadius: 30, fontSize: '0.75rem', fontWeight: 700, background: level >= lvl ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.04)', color: level >= lvl ? '#fbbf24' : '#4b5563', border: `1px solid ${level >= lvl ? 'rgba(251,191,36,0.4)' : 'rgba(255,255,255,0.06)'}` }}>
              Lv {lvl}
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── ROW 3: MOOD CHART + RADAR ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Mood Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.8rem 2rem', backdropFilter: 'blur(20px)' }}
        >
          <div style={{ marginBottom: '1.2rem' }}>
            <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Mood Trend</h3>
            <p style={{ margin: 0, color: '#88a0b0', fontSize: '0.82rem' }}>
              {moodLog.length > 0 ? `${moodLog.length} entries — last: "${moodLog[0]?.mood}" at ${moodLog[0]?.time}` : 'No entries yet — log your mood from the Dashboard'}
            </p>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            {moodChartData.length > 1 ? (
              <AreaChart data={moodChartData}>
                <defs>
                  <linearGradient id="moodGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="idx" stroke="#6b7280" tick={{ fontSize: 11 }} />
                <YAxis domain={[0, 100]} stroke="#6b7280" tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, _, p) => [`${v}/100`, p.payload.label]} />
                <Area type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={3} fill="url(#moodGrad)" dot={{ fill: '#8b5cf6', r: 5, strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 7 }} />
              </AreaChart>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#4b5563' }}>
                <span style={{ fontSize: '2.5rem' }}>📊</span>
                <span style={{ fontSize: '0.9rem' }}>Log at least 2 moods to see your trend</span>
              </div>
            )}
          </ResponsiveContainer>
        </motion.div>

        {/* Mood Distribution Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.8rem 2rem', backdropFilter: 'blur(20px)' }}
        >
          <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Mood Breakdown</h3>
          <p style={{ margin: '0 0 1rem', color: '#88a0b0', fontSize: '0.82rem' }}>Based on your {moodLog.length} log entries</p>
          {moodDist.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={moodDist} dataKey="val" cx="50%" cy="50%" innerRadius={45} outerRadius={72} paddingAngle={3}>
                    {moodDist.map((d, i) => <Cell key={i} fill={d.color} stroke="transparent" />)}
                  </Pie>
                  <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any, _, p) => [v, p.payload.name]} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: '0.5rem' }}>
                {moodDist.map(d => (
                  <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: d.color }} />
                      <span style={{ color: '#d1d5db' }}>{d.name}</span>
                    </div>
                    <span style={{ color: d.color, fontWeight: 700 }}>{d.val}×</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 180, color: '#4b5563', flexDirection: 'column', gap: 10 }}>
              <span style={{ fontSize: '2rem' }}>🌫️</span>
              <span style={{ fontSize: '0.85rem' }}>No mood data yet</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── ROW 4: RADAR + HEATMAP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Radar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.8rem 2rem', backdropFilter: 'blur(20px)' }}
        >
          <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Wellness Profile</h3>
          <p style={{ margin: '0 0 0.5rem', color: '#88a0b0', fontSize: '0.82rem' }}>Your scores across 6 wellness dimensions</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.07)" />
              <PolarAngleAxis dataKey="axis" tick={{ fill: '#88a0b0', fontSize: 11 }} />
              <Radar dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2.5} dot={{ fill: '#3b82f6', r: 4 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v: any) => [`${v}/100`]} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Activity Heatmap */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.8rem 2rem', backdropFilter: 'blur(20px)' }}
        >
          <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>Activity Heatmap</h3>
          <p style={{ margin: '0 0 1.2rem', color: '#88a0b0', fontSize: '0.82rem' }}>Last 12 weeks · brighter = more activity</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: 4 }}>
            {heatmap.map(cell => (
              <motion.div
                key={cell.id}
                whileHover={{ scale: 1.4 }}
                style={{ aspectRatio: '1', borderRadius: 3, background: HEATMAP_COLORS[cell.value], cursor: 'pointer' }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: '1.2rem', fontSize: '0.75rem', color: '#88a0b0' }}>
            Less {HEATMAP_COLORS.map((c, i) => <div key={i} style={{ width: 11, height: 11, borderRadius: 2, background: c }} />)} More
          </div>
        </motion.div>
      </div>

      {/* ── ROW 5: BADGE VAULT ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
        style={{ background: 'rgba(18,24,44,0.7)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 20, padding: '1.8rem 2rem', backdropFilter: 'blur(20px)', marginBottom: '3rem' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div>
            <h3 style={{ margin: '0 0 4px', color: '#fff', fontSize: '1.05rem', fontWeight: 800 }}>🏆 Achievement Vault</h3>
            <p style={{ margin: 0, color: '#88a0b0', fontSize: '0.82rem' }}>{badges.length} of {ALL_BADGES.length} badges earned</p>
          </div>
          <div style={{ background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.3)', padding: '0.4rem 1rem', borderRadius: 30, color: '#fbbf24', fontSize: '0.82rem', fontWeight: 700 }}>
            {Math.round((badges.length / ALL_BADGES.length) * 100)}% Complete
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
          {ALL_BADGES.map((b, i) => {
            const unlocked = badges.some(bd => bd.includes(b.name) || b.name.includes(bd.split(' ')[0]));
            return (
              <motion.div
                key={b.name}
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.45 + i * 0.05, type: 'spring' }}
                whileHover={unlocked ? { scale: 1.06, y: -4 } : {}}
                style={{
                  background: unlocked ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.02)',
                  border: `1px solid ${unlocked ? 'rgba(251,191,36,0.3)' : 'rgba(255,255,255,0.05)'}`,
                  borderRadius: 16, padding: '1.2rem 1rem', textAlign: 'center',
                  opacity: unlocked ? 1 : 0.35,
                  filter: unlocked ? 'none' : 'grayscale(100%)',
                  boxShadow: unlocked ? '0 4px 20px rgba(251,191,36,0.1)' : 'none',
                  cursor: 'default',
                }}
              >
                <div style={{ fontSize: '2.2rem', marginBottom: '0.5rem' }}>{b.emoji}</div>
                <div style={{ color: unlocked ? '#fff' : '#6b7280', fontWeight: 700, fontSize: '0.82rem', marginBottom: 4 }}>{b.name}</div>
                <div style={{ color: '#88a0b0', fontSize: '0.72rem', lineHeight: 1.3 }}>{b.desc}</div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>

    </div>
  );
};

export default TowerInsights;
