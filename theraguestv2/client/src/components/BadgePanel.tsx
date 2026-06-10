import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import './BadgePanel.css';

const ALL_BADGES = [
  { id: 'First Steps 🌱', label: 'First Steps', emoji: '🌱', desc: 'Complete your first therapy session', xpRequired: 5 },
  { id: 'Breather 🌬️', label: 'Breather', emoji: '🌬️', desc: 'Complete a breathing exercise', xpRequired: 10 },
  { id: 'Mind Mapper 🧠', label: 'Mind Mapper', emoji: '🧠', desc: 'Submit a Thought Record', xpRequired: 20 },
  { id: 'Grateful Soul 🙏', label: 'Grateful Soul', emoji: '🙏', desc: 'Write a Gratitude Journal', xpRequired: 15 },
  { id: 'Quest Slayer ⚔️', label: 'Quest Slayer', emoji: '⚔️', desc: 'Complete your first quest', xpRequired: 40 },
  { id: 'Planner Pro 📋', label: 'Planner Pro', emoji: '📋', desc: 'Generate a Recovery Plan', xpRequired: 55 },
  { id: 'Goal Setter 🎯', label: 'Goal Setter', emoji: '🎯', desc: 'Build a Wellness Roadmap', xpRequired: 75 },
  { id: 'Quiz Champion 🏆', label: 'Quiz Champion', emoji: '🏆', desc: 'Score 100% on a Quiz', xpRequired: 90 },
  { id: 'Centurion 💯', label: 'Centurion', emoji: '💯', desc: 'Earn 100 XP total', xpRequired: 100 },
  { id: 'Wellness Warrior 🛡️', label: 'Wellness Warrior', emoji: '🛡️', desc: 'Earn 300 XP total', xpRequired: 300 },
  { id: 'Legendary 🌟', label: 'Legendary', emoji: '🌟', desc: 'Earn 500 XP total', xpRequired: 500 },
];

interface BadgePanelProps {
  onClose: () => void;
}

const BadgePanel: React.FC<BadgePanelProps> = ({ onClose }) => {
  const { badges, xp } = useGlobalState();

  // Auto-unlock XP-based badges
  const unlocked = new Set([
    ...badges,
    ...ALL_BADGES.filter(b => xp >= b.xpRequired).map(b => b.id)
  ]);

  return (
    <div className="badge-overlay" onClick={onClose}>
      <motion.div
        className="badge-panel"
        onClick={e => e.stopPropagation()}
        initial={{ opacity: 0, y: -20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -20, scale: 0.96 }}
        transition={{ duration: 0.25 }}
      >
        <div className="badge-panel-header">
          <h3><Trophy size={20} color="#fbbf24" /> Achievements</h3>
          <button onClick={onClose}><X size={20}/></button>
        </div>
        <p className="badge-subtitle">{unlocked.size} / {ALL_BADGES.length} unlocked · {xp} XP earned</p>
        <div className="badge-grid">
          {ALL_BADGES.map(badge => {
            const earned = unlocked.has(badge.id);
            return (
              <motion.div
                key={badge.id}
                className={`badge-item ${earned ? 'earned' : 'locked'}`}
                whileHover={{ scale: 1.06 }}
              >
                <div className="badge-emoji">{earned ? badge.emoji : '🔒'}</div>
                <div className="badge-label">{badge.label}</div>
                <div className="badge-desc">{badge.desc}</div>
                {!earned && (
                  <div className="badge-xp-req">{badge.xpRequired} XP needed</div>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default BadgePanel;
