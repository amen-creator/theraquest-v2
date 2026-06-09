import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import { Database, TrendingUp, AlertTriangle, Users } from 'lucide-react';

const mockTowerData = [
  { day: 'Mon', anxiety: 65, engagement: 40, activeUsers: 1200 },
  { day: 'Tue', anxiety: 59, engagement: 45, activeUsers: 1400 },
  { day: 'Wed', anxiety: 80, engagement: 30, activeUsers: 2100 }, // Spike day
  { day: 'Thu', anxiety: 55, engagement: 60, activeUsers: 1800 },
  { day: 'Fri', anxiety: 40, engagement: 75, activeUsers: 2500 },
  { day: 'Sat', anxiety: 35, engagement: 85, activeUsers: 3100 },
  { day: 'Sun', anxiety: 45, engagement: 70, activeUsers: 2800 },
];

const TowerInsights: React.FC = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate Tower Pipeline Data Fetch
    setTimeout(() => setLoading(false), 1200);
  }, []);

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Database color="#3b82f6" /> Global Wellness Insights
          </h1>
          <p style={{ margin: 0, color: '#9ca3af' }}>Powered by Tower Lakehouse Analytics Pipeline</p>
        </div>
        <div style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', padding: '6px 12px', borderRadius: 8, color: '#3b82f6', fontSize: '0.85rem', fontWeight: 600 }}>
          Tower Pipeline Status: Healthy
        </div>
      </div>

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 40 }}>
          <div className="pulse-skeleton" style={{ height: 120, width: '100%', borderRadius: 16 }}></div>
          <div className="pulse-skeleton" style={{ height: 300, width: '100%', borderRadius: 16 }}></div>
        </div>
      ) : (
        <>
          {/* Metrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 12 }}><Users size={18} /> Active Users (7d)</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>14.9K</div>
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 4 }}>+12% vs last week</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 12 }}><AlertTriangle size={18} color="#ef4444" /> Avg Anxiety Index</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>54.1</div>
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: 4 }}>Spiked on Wed (Global Event)</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#9ca3af', marginBottom: 12 }}><TrendingUp size={18} color="#8b5cf6" /> Avg Engagement</div>
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>63%</div>
              <div style={{ color: '#10b981', fontSize: '0.85rem', marginTop: 4 }}>Highest on Weekends</div>
            </div>
          </div>

          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16 }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Anxiety vs Engagement Trend</h3>
              <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="99%" height={300}>
                  <AreaChart data={mockTowerData}>
                    <defs>
                      <linearGradient id="colorAnx" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorEng" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} />
                    <Area type="monotone" dataKey="anxiety" stroke="#ef4444" fillOpacity={1} fill="url(#colorAnx)" />
                    <Area type="monotone" dataKey="engagement" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorEng)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 24 }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '1.1rem' }}>Active Users (Lakehouse)</h3>
              <div style={{ width: '100%', height: 300, minWidth: 0, minHeight: 0 }}>
                <ResponsiveContainer width="99%" height={300}>
                  <BarChart data={mockTowerData}>
                    <XAxis dataKey="day" stroke="#6b7280" />
                    <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 8 }} cursor={{fill: 'rgba(255,255,255,0.05)'}} />
                    <Bar dataKey="activeUsers" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TowerInsights;
