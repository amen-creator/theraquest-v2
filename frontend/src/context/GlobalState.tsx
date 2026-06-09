import React, { createContext, useContext, useState, useEffect } from 'react';

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
  const [xp, setXp] = useState<number>(() => parseInt(localStorage.getItem('tq_xp') || '0', 10));
  const [level, setLevel] = useState<number>(() => parseInt(localStorage.getItem('tq_level') || '1', 10));
  const [streak, setStreak] = useState<number>(1);
  const [badges, setBadges] = useState<string[]>(() => JSON.parse(localStorage.getItem('tq_badges') || '[]'));
  const [moodLog, setMoodLog] = useState<{ mood: string; time: string; score: number }[]>(() => JSON.parse(localStorage.getItem('tq_moods') || '[]'));
  const [plannerPlan, setPlannerPlan] = useState<string | null>(() => localStorage.getItem('tq_planner') || null);
  const [goalRoadmap, setGoalRoadmap] = useState<string | null>(() => localStorage.getItem('tq_goal') || null);

  useEffect(() => {
    localStorage.setItem('tq_xp', xp.toString());
    localStorage.setItem('tq_level', level.toString());
    localStorage.setItem('tq_badges', JSON.stringify(badges));
    localStorage.setItem('tq_moods', JSON.stringify(moodLog));
    if (plannerPlan) localStorage.setItem('tq_planner', plannerPlan);
    if (goalRoadmap) localStorage.setItem('tq_goal', goalRoadmap);
  }, [xp, level, badges, moodLog, plannerPlan, goalRoadmap]);

  const addXP = (amount: number, reason: string) => {
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      const newLevel = Math.floor(newXp / 100) + 1;
      if (newLevel > level) {
        setLevel(newLevel);
        // Play level up sound or effect here in the future
      }
      console.log(`+${amount} XP: ${reason}`);
      return newXp;
    });
  };

  const unlockBadge = (badgeName: string) => {
    if (!badges.includes(badgeName)) {
      setBadges((prev) => [...prev, badgeName]);
      console.log(`🏆 Badge Unlocked: ${badgeName}`);
    }
  };

  const logMood = (mood: string, score: number) => {
    const entry = { mood, time: new Date().toLocaleTimeString(), score };
    setMoodLog(prev => [entry, ...prev].slice(0, 7)); // keep last 7
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
