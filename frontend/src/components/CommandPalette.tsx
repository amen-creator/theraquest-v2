import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Brain, Trophy, Calendar, BookOpen, Target, Settings } from 'lucide-react';

export const CommandPalette: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const commands = [
    { name: 'AI Therapist', path: '/therapist', icon: Brain },
    { name: 'Dashboard', path: '/', icon: Trophy },
    { name: 'Recovery Planner', path: '/planner', icon: Calendar },
    { name: 'CBT Exercises', path: '/exercises', icon: BookOpen },
    { name: 'Goal Coach', path: '/goals', icon: Target },
    { name: 'Settings (Persona)', path: '/', icon: Settings },
  ];

  const filtered = commands.filter(c => c.name.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', zIndex: 9999, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh' }}>
      <div style={{ width: '90%', maxWidth: 600, background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <Search size={20} color="#8b5cf6" style={{ marginRight: 12 }} />
          <input 
            autoFocus 
            value={query} 
            onChange={e => setQuery(e.target.value)} 
            placeholder="Where do you want to go? (Cmd+K)" 
            style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem', outline: 'none' }} 
          />
        </div>
        <div style={{ padding: '8px' }}>
          {filtered.map(cmd => {
            const Icon = cmd.icon;
            return (
              <div 
                key={cmd.name} 
                onClick={() => { navigate(cmd.path); setIsOpen(false); setQuery(''); }}
                style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', borderRadius: 8, transition: 'background 0.2s', color: '#e2e8f0' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(139,92,246,0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                <Icon size={18} color="#9ca3af" />
                <span style={{ fontSize: '1rem' }}>{cmd.name}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
