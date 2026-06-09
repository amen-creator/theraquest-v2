import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GlobalStateProvider } from './context/GlobalState';
import Navbar from './components/Navbar';
import { CommandPalette } from './components/CommandPalette';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Therapist from './pages/Therapist';
import Exercises from './pages/Exercises';
import Planner from './pages/Planner';
import Quizzes from './pages/Quizzes';
import Goals from './pages/Goals';
import TowerInsights from './pages/TowerInsights';
import './App.css';

function App() {
  return (
    <GlobalStateProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page - no navbar */}
          <Route path="/welcome" element={<Landing />} />
          <Route path="/login" element={<Login />} />

          {/* Main app shell with Navbar */}
          <Route path="/*" element={
            <div className="app-shell">
              <CommandPalette />
              <Navbar />
              <main className="app-main">
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/therapist" element={<Therapist />} />
                  <Route path="/exercises" element={<Exercises />} />
                  <Route path="/planner" element={<Planner />} />
                  <Route path="/quizzes" element={<Quizzes />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/tower-insights" element={<TowerInsights />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
            </div>
          } />
        </Routes>
      </BrowserRouter>
    </GlobalStateProvider>
  );
}

export default App;
