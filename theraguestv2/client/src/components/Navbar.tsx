import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Brain, Star, Activity, MessageSquare, ClipboardList, Target, Compass, ShieldCheck, Medal, Database, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
    { to: '/sanctuary',  label: 'Sanctuary',    icon: <Sparkles size={16}/> },
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
          <motion.div 
            whileHover={{ scale: 1.05, y: -2 }}
            className="stat-item streak" 
            title="Daily Streak"
            style={{ 
              background: streak >= 3 ? 'linear-gradient(90deg, rgba(251,191,36,0.1), rgba(245,158,11,0.2))' : undefined,
              borderColor: streak >= 3 ? '#fbbf24' : undefined,
              color: streak >= 3 ? '#fbbf24' : undefined,
              boxShadow: streak >= 3 ? '0 0 10px rgba(251,191,36,0.2)' : undefined
            }}
          >
            <span className="streak-icon">
              {streak >= 3 ? (
                <motion.span 
                  animate={{ scale: [1, 1.2, 1] }} 
                  transition={{ repeat: Infinity, duration: 1 }}
                  style={{ display: 'inline-block', filter: 'drop-shadow(0 0 5px rgba(251,191,36,0.8))' }}
                >
                  🔥
                </motion.span>
              ) : '🔥'}
            </span> {streak}d
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03, y: -2 }}
            className="xp-level-wrap" 
            title={`${xp} XP total`}
          >
            <div className="xp-level-row">
              <span className="lvl-tag">LVL {level}</span>
              <span className="xp-count"><Star size={12} fill="#fbbf24" color="#fbbf24" /> {xp}</span>
            </div>
            <div className="xp-mini-bar">
              <motion.div 
                className="xp-mini-fill" 
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.05, y: -2, boxShadow: '0 0 20px rgba(251,191,36,0.3)' }}
            whileTap={{ scale: 0.95 }}
            className="badges-btn"
            onClick={() => setShowBadges(v => !v)}
            title="View Achievements"
          >
            <Medal size={16} />
            <span>{badges.length}</span>
          </motion.button>
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
