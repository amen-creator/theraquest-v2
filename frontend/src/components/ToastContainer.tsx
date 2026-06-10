import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';
import type { ToastMessage } from '../context/ToastContext';
import { Trophy, Star, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: ToastMessage['type']) => {
    switch (type) {
      case 'xp': return <Star size={20} color="#fbbf24" fill="#fbbf24" />;
      case 'badge': return <Trophy size={20} color="#8b5cf6" />;
      default: return <Info size={20} color="#10b981" />;
    }
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: 24,
      right: 24,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      pointerEvents: 'none'
    }}>
      <AnimatePresence>
        {toasts.map(toast => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
              background: 'rgba(15,20,35,0.9)',
              backdropFilter: 'blur(10px)',
              border: `1px solid ${toast.type === 'badge' ? '#8b5cf6' : toast.type === 'xp' ? '#fbbf24' : '#10b981'}`,
              boxShadow: `0 10px 30px rgba(0,0,0,0.5), 0 0 20px ${toast.type === 'badge' ? 'rgba(139,92,246,0.3)' : toast.type === 'xp' ? 'rgba(251,191,36,0.2)' : 'rgba(16,185,129,0.2)'} inset`,
              padding: '16px 20px',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '16px',
              width: '320px',
              pointerEvents: 'auto',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {/* Glossy shine */}
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(180deg, rgba(255,255,255,0.05) 0%, transparent 100%)', pointerEvents: 'none' }} />
            
            <div style={{ 
              background: 'rgba(255,255,255,0.05)', 
              padding: '10px', 
              borderRadius: '12px',
              boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)'
            }}>
              {getIcon(toast.type)}
            </div>

            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px 0', fontSize: '0.95rem', color: '#fff', fontWeight: 700 }}>{toast.title}</h4>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa', lineHeight: 1.4 }}>{toast.message}</p>
            </div>

            <button 
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'transparent', border: 'none', color: '#666', cursor: 'pointer', padding: 4
              }}
            >
              <X size={14} />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
