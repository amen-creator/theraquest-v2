import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Star, Activity, MessageSquare, ClipboardList, Target, Compass, ShieldCheck, Medal, Database } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../context/GlobalState';
import BadgePanel from './BadgePanel';
import './Navbar.css';

const Navbar: React.FC = () => {
  const { xp, level, streak, badges } = useGlobalState();
  const [showBadges, setShowBadges] = useState(false);
  const xpProgress = xp % 100;

  const navLinks = [
    { to: '/',           label: 'Dashboard',   icon: <Activity size={16}/> },
    { to: '/therapist',  label: 'AI Therapist', icon: <MessageSquare size={16}/> },
    { to: '/exercises',  label: 'Exercises',    icon: <Compass size={16}/> },
    { to: '/planner',    label: 'Planner',      icon: <ClipboardList size={16}/> },
    { to: '/quizzes',    label: 'Quizzes',      icon: <ShieldCheck size={16}/> },
    { to: '/goals',      label: 'Goal Coach',   icon: <Target size={16}/> },
    { to: '/tower-insights', label: 'Tower Insights', icon: <Database size={16}/> },
  ];

  return (
    <>
      <header className="navbar">
        {/* Brand */}
        <div className="navbar-brand">
          <Brain size={26} className="brand-icon" />
          <div>
            <h1>TheraQuest</h1>
            <div className="brand-sub">Amaterasu MAS · Enterprise</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="navbar-nav">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Stats */}
        <div className="navbar-stats">
          <div className="stat-item streak" title="Daily Streak">🔥 {streak}d</div>

          <div className="xp-level-wrap" title={`${xp} XP total`}>
            <div className="xp-level-row">
              <span className="lvl-tag">LVL {level}</span>
              <span className="xp-count"><Star size={12} fill="#fbbf24" color="#fbbf24" /> {xp}</span>
            </div>
            <div className="xp-mini-bar">
              <div className="xp-mini-fill" style={{ width: `${xpProgress}%` }} />
            </div>
          </div>

          <button
            className="badges-btn"
            onClick={() => setShowBadges(v => !v)}
            title="View Achievements"
          >
            <Medal size={16} />
            <span>{badges.length}</span>
          </button>
        </div>
      </header>

      {/* Badge Panel */}
      <AnimatePresence>
        {showBadges && <BadgePanel onClose={() => setShowBadges(false)} />}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
