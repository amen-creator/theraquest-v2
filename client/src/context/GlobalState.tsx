import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useToast } from './ToastContext';

interface GlobalStateContextType {
  xp: number;
  level: number;
  streak: number;
  badges: string[];
  moodLog: { mood: string; time: string; score: number }[];
  plannerPlan: string | null;
  goalRoadmap: string | null;
  addXP: (amount: number, reason: string) => void;
  unlockBadge: (badgeName: string) => void;
  logMood: (mood: string, score: number) => void;
  setPlannerPlan: (plan: string | null) => void;
  setGoalRoadmap: (roadmap: string | null) => void;
}

const GlobalStateContext = createContext<GlobalStateContextType | undefined>(undefined);

export const GlobalStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { addToast } = useToast();
  
  const [xp, setXp] = useState<number>(() => parseInt(localStorage.getItem('tq_xp') || '0', 10));
  const [level, setLevel] = useState<number>(() => parseInt(localStorage.getItem('tq_level') || '1', 10));
  const [streak, setStreak] = useState<number>(() => parseInt(localStorage.getItem('tq_streak') || '1', 10));
  const [badges, setBadges] = useState<string[]>(() => JSON.parse(localStorage.getItem('tq_badges') || '[]'));
  const [moodLog, setMoodLog] = useState<{ mood: string; time: string; score: number }[]>(() => JSON.parse(localStorage.getItem('tq_moods') || '[]'));
  const [plannerPlan, setPlannerPlan] = useState<string | null>(() => localStorage.getItem('tq_planner') || null);
  const [goalRoadmap, setGoalRoadmap] = useState<string | null>(() => localStorage.getItem('tq_goal') || null);
  
  // Ref to prevent multiple automated evaluations in a single render cycle
  const evaluatingRef = useRef(false);

  // 1. True Date-Based Streak Calculation
  useEffect(() => {
    const today = new Date().toDateString();
    const lastLogin = localStorage.getItem('tq_last_login');

    if (!lastLogin) {
      localStorage.setItem('tq_last_login', today);
    } else if (lastLogin !== today) {
      const lastLoginDate = new Date(lastLogin);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate.getTime() - lastLoginDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 

      if (diffDays === 1) {
        setStreak(s => {
          const newStreak = s + 1;
          addToast("Streak Kept Alive!", `You're on a ${newStreak}-day streak! 🔥`, 'info');
          return newStreak;
        });
      } else if (diffDays > 1) {
        setStreak(1);
        addToast("Streak Reset", "You missed a day, but your new journey begins now! 🔥", 'info');
      }
      localStorage.setItem('tq_last_login', today);
    }
  }, [addToast]);

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem('tq_xp', xp.toString());
    localStorage.setItem('tq_level', level.toString());
    localStorage.setItem('tq_streak', streak.toString());
    localStorage.setItem('tq_badges', JSON.stringify(badges));
    localStorage.setItem('tq_moods', JSON.stringify(moodLog));
    if (plannerPlan) localStorage.setItem('tq_planner', plannerPlan);
    if (goalRoadmap) localStorage.setItem('tq_goal', goalRoadmap);
  }, [xp, level, streak, badges, moodLog, plannerPlan, goalRoadmap]);

  // 2. Automated Badge Engine
  const evaluateBadges = (currentXp: number, currentStreak: number, currentLevel: number) => {
    if (evaluatingRef.current) return;
    evaluatingRef.current = true;

    const checkAndUnlock = (name: string, condition: boolean) => {
      if (condition && !badges.includes(name)) unlockBadge(name);
    };

    checkAndUnlock("First Steps", currentXp > 0);
    checkAndUnlock("Rising Star", currentXp >= 500);
    checkAndUnlock("Level 5 Adept", currentLevel >= 5);
    checkAndUnlock("Level 10 Master", currentLevel >= 10);
    checkAndUnlock("3-Day Streak", currentStreak >= 3);
    checkAndUnlock("7-Day Streak", currentStreak >= 7);
    
    evaluatingRef.current = false;
  };

  // Watch for changes and evaluate badges
  useEffect(() => {
    evaluateBadges(xp, streak, level);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xp, streak, level]);

  const unlockBadge = (badgeName: string) => {
    if (!badges.includes(badgeName)) {
      setBadges((prev) => [...prev, badgeName]);
      addToast("Badge Unlocked!", badgeName, 'badge');
    }
  };

  // 3. XP & Leveling Engine
  const addXP = (amount: number, reason: string) => {
    addToast(`+${amount} XP`, reason, 'xp');
    
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      // Dynamic curve: Level = floor(sqrt(XP / 50)) + 1
      const newLevel = Math.floor(Math.sqrt(newXp / 50)) + 1;
      
      if (newLevel > level) {
        setLevel(newLevel);
        setTimeout(() => addToast("Level Up! 🌟", `You reached Level ${newLevel}!`, 'badge'), 1500);
      }
      return newXp;
    });
  };

  const logMood = (mood: string, score: number) => {
    const entry = { mood, time: new Date().toLocaleTimeString(), score };
    setMoodLog(prev => {
      const newLog = [entry, ...prev].slice(0, 7);
      if (newLog.length >= 3) {
        unlockBadge("Self-Aware");
      }
      return newLog;
    });
    addXP(10, 'Logged your mood');
  };

  return (
    <GlobalStateContext.Provider value={{ 
      xp, level, streak, badges, moodLog, plannerPlan, goalRoadmap, 
      addXP, unlockBadge, logMood, setPlannerPlan, setGoalRoadmap 
    }}>
      {children}
    </GlobalStateContext.Provider>
  );
};

export const useGlobalState = () => {
  const context = useContext(GlobalStateContext);
  if (!context) throw new Error("useGlobalState must be used within a GlobalStateProvider");
  return context;
};

