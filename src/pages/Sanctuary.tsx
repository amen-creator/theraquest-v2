import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGlobalState } from '../context/GlobalState';
import { TreeOfLife } from '../components/TreeOfLife';
import { AmbientMixer } from '../components/AmbientMixer';
import { Trophy, Sparkles, Quote } from 'lucide-react';

const AFFIRMATIONS = [
  "You are capable of amazing things.",
  "Your potential is limitless.",
  "Every day is a fresh start.",
  "Breathe in peace, exhale stress.",
  "You are stronger than your challenges.",
  "Growth is a journey, not a destination."
];

const Sanctuary: React.FC = () => {
  const { level, badges, moodLog } = useGlobalState();
  const [oracleActive, setOracleActive] = useState(false);
  const [affirmation, setAffirmation] = useState("");

  const handleOracleClick = () => {
    if (oracleActive) return;
    setOracleActive(true);
    // Simple logic for affirmation based on mood
    const lastMood = moodLog.length > 0 ? moodLog[0].score : 5;
    const pool = lastMood < 5 
      ? ["It's okay to have tough days. You are healing.", "Take it one step at a time.", "Give yourself grace."]
      : AFFIRMATIONS;
    
    setAffirmation(pool[Math.floor(Math.random() * pool.length)]);
    
    setTimeout(() => setOracleActive(false), 8000);
  };

  return (
    <div style={{ padding: '2rem 3rem', height: 'calc(100vh - 70px)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      
      <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0, background: 'linear-gradient(90deg, #10b981, #3b82f6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          The Sanctuary
        </h1>
        <p style={{ color: '#aaa', fontSize: '1.1rem', marginTop: 8 }}>
          Your peaceful retreat for mindfulness, reflection, and rewards.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '2rem', flex: 1 }}>
        
        {/* Left Column: The Tree & Breath Halo & Oracle */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column' }}>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ flex: 1, background: 'rgba(15,20,35,0.6)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 24, padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}
          >
            <div style={{ position: 'absolute', top: 20, left: 20, background: 'rgba(16,185,129,0.1)', border: '1px solid #10b981', color: '#10b981', padding: '4px 12px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 'bold', zIndex: 30 }}>
              Tree Level: {Math.min(level, 10)}
            </div>
            
            {/* Breath Sync Halo */}
            <motion.div
              animate={{ 
                scale: [1, 1.4, 1], 
                opacity: [0.05, 0.25, 0.05] 
              }}
              transition={{ 
                duration: 10, // 4s inhale + 6s exhale representation
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                width: 350,
                height: 350,
                marginLeft: -175,
                marginTop: -175,
                borderRadius: '50%',
                border: '4px solid #10b981',
                zIndex: 0,
                filter: 'blur(15px)'
              }}
            />
            <div style={{ position: 'absolute', bottom: 20, right: 20, color: 'rgba(16,185,129,0.5)', fontSize: '0.8rem', fontWeight: 600, zIndex: 30, textTransform: 'uppercase', letterSpacing: 2 }}>
              Sync your breath with the halo
            </div>

            {/* Floating Zen Stones */}
            <motion.div
              animate={{ y: [-10, 10, -10], rotate: [0, 5, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
              style={{ position: 'absolute', left: 30, top: '40%', width: 40, height: 25, background: 'linear-gradient(to bottom, #4b5563, #374151)', borderRadius: '50% 50% 40% 40%', boxShadow: '0 10px 15px rgba(0,0,0,0.5), inset 0 2px 4px rgba(255,255,255,0.2)', zIndex: 20 }}
            />
            <motion.div
              animate={{ y: [15, -15, 15], rotate: [0, -8, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              style={{ position: 'absolute', right: 40, top: '30%', width: 25, height: 15, background: 'linear-gradient(to bottom, #6b7280, #4b5563)', borderRadius: '50% 50% 40% 40%', boxShadow: '0 8px 12px rgba(0,0,0,0.5), inset 0 1px 3px rgba(255,255,255,0.3)', zIndex: 20 }}
            />
            <motion.div
              animate={{ y: [-8, 8, -8], rotate: [5, -5, 5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
              style={{ position: 'absolute', right: 60, bottom: '25%', width: 35, height: 20, background: 'linear-gradient(to bottom, #374151, #1f2937)', borderRadius: '50%', boxShadow: '0 12px 20px rgba(0,0,0,0.6), inset 0 2px 2px rgba(255,255,255,0.1)', zIndex: 20 }}
            />

            <TreeOfLife level={level} />
            
            {/* Oracle Crystal */}
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleOracleClick}
              style={{
                position: 'absolute',
                bottom: 40,
                left: 40,
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 8,
                zIndex: 30
              }}
            >
              <motion.div 
                animate={{ y: [0, -10, 0], filter: ['drop-shadow(0 0 5px #a78bfa)', 'drop-shadow(0 0 20px #a78bfa)', 'drop-shadow(0 0 5px #a78bfa)'] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <Sparkles size={36} color="#a78bfa" />
              </motion.div>
              <span style={{ fontSize: '0.7rem', color: '#a78bfa', fontWeight: 'bold', letterSpacing: 1 }}>THE ORACLE</span>
            </motion.div>

            <AnimatePresence>
              {oracleActive && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.9 }}
                  style={{
                    position: 'absolute',
                    bottom: 120,
                    left: 40,
                    background: 'rgba(20,20,35,0.95)',
                    border: '1px solid #a78bfa',
                    padding: '1.2rem',
                    borderRadius: 16,
                    width: 280,
                    boxShadow: '0 15px 35px rgba(139,92,246,0.4)',
                    zIndex: 40,
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <Quote size={20} color="#a78bfa" style={{ marginBottom: 12, opacity: 0.7 }} />
                  <p style={{ margin: 0, color: '#fff', fontSize: '1rem', lineHeight: 1.5, fontStyle: 'italic', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                    "{affirmation}"
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Right Column: Audio & Trophies */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <AmbientMixer />

          {/* 3D Trophy Vault */}
          <div style={{ background: 'rgba(20,25,40,0.8)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 16, padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1rem 0', display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
              <Trophy size={18} color="#fbbf24" /> The Trophy Vault
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', marginBottom: '1rem' }}>
              Your earned achievements. Hover to inspect.
            </p>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', overflowY: 'auto', flex: 1, alignContent: 'flex-start', padding: '0.5rem' }}>
              {badges.length === 0 ? (
                <p style={{ color: '#666', fontSize: '0.9rem', width: '100%', textAlign: 'center', marginTop: '2rem' }}>
                  Your vault is empty. Earn XP and Streaks to unlock!
                </p>
              ) : (
                badges.map(badge => (
                  <motion.div
                    key={badge}
                    whileHover={{ scale: 1.05, rotateX: 15, rotateY: -15 }}
                    style={{
                      background: 'linear-gradient(135deg, rgba(251,191,36,0.2), rgba(251,191,36,0.05))',
                      border: '1px solid rgba(251,191,36,0.4)',
                      padding: '1.2rem',
                      borderRadius: 16,
                      width: 'calc(50% - 0.5rem)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 12,
                      boxShadow: '0 10px 20px rgba(0,0,0,0.4)',
                      cursor: 'pointer',
                      transformStyle: 'preserve-3d',
                      perspective: 1000
                    }}
                  >
                    <Trophy size={28} color="#fbbf24" style={{ filter: 'drop-shadow(0 0 8px rgba(251,191,36,0.8))', transform: 'translateZ(30px)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff', textAlign: 'center', transform: 'translateZ(20px)', textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>
                      {badge}
                    </span>
                  </motion.div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Sanctuary;
