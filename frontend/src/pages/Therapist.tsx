import React, { useState, useRef, useEffect, useCallback } from 'react';
import { PlayCircle, Star, MessageSquare, Brain, Trophy, X, Mic, MicOff, Volume2, Camera, CameraOff, Globe, Database, Eye, Cpu } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';

interface NimbleSource { title: string; url: string; snippet: string; }
interface QuestStep { description: string; xp_reward: number; }
interface Quest { quest_title: string; quest_lore: string; steps: QuestStep[]; total_xp: number; }
interface Metrics { anxiety: number; engagement: number; }
interface ChatEntry { user: string; therapist: string; quest: Quest; metrics: Metrics; nimble_sources?: NimbleSource[]; }

// Pipeline step definitions for the status bar
const PIPELINE_STEPS = [
  { key: 'vision',    icon: Eye,      label: 'Agent 5: Biometric Vision' },
  { key: 'memory',    icon: Database, label: 'Agent 6: Deep Memory RAG' },
  { key: 'nimble',    icon: Globe,    label: 'Agent 4: Nimble Live Web' },
  { key: 'therapist', icon: Brain,    label: 'Agent 1–3: Core MAS Pipeline' },
];

const Therapist: React.FC = () => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [pipelineStatus, setPipelineStatus] = useState('');
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [chatLog, setChatLog] = useState<ChatEntry[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [biometricLabel, setBiometricLabel] = useState<string | null>(null);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { addXP } = useGlobalState();
  const [activeQuest, setActiveQuest] = useState<Quest | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  
  const playSound = useAudio();

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatLog]);

  // Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraEnabled(true);
    } catch (e) { console.error('Camera error:', e); }
  };

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    setCameraEnabled(false);
  };

  const captureFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current || !cameraEnabled) return null;
    const ctx = canvasRef.current.getContext('2d');
    canvasRef.current.width = 320;
    canvasRef.current.height = 240;
    ctx?.drawImage(videoRef.current, 0, 0, 320, 240);
    return canvasRef.current.toDataURL('image/jpeg', 0.6);
  };

  // Speech Recognition
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;
  if (recognition) {
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.onstart = () => { setIsListening(true); setOrbState('listening'); };
    recognition.onresult = (event: any) => {
      const t = Array.from(event.results).map((r: any) => r[0].transcript).join('');
      setInput(t);
    };
    recognition.onerror = () => { setIsListening(false); setOrbState('idle'); };
    recognition.onend = () => { setIsListening(false); };
  }

  const toggleListen = () => {
    if (isListening) { recognition?.stop(); }
    else { setInput(''); recognition?.start(); }
  };

  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US'; u.pitch = 1; u.rate = 0.95;
    u.onstart = () => setOrbState('speaking');
    u.onend = () => setOrbState('idle');
    window.speechSynthesis.speak(u);
  }, [voiceEnabled]);

  const handleSend = async () => {
    if (!input.trim()) return;
    playSound('click');
    if (isListening) recognition?.stop();
    setLoading(true);
    setOrbState('thinking');
    setActiveAgents([]);
    setBiometricLabel(null);
    setPipelineStatus('Initializing Amaterasu 6-Agent Pipeline...');
    const msg = input;
    setInput('');
    const imageData = captureFrame();

    try {
      const response = await fetch('http://localhost:8000/api/interact/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'user-demo', message: msg, image_data: imageData })
      });

      if (!response.body) throw new Error('Streams not supported.');
      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const lines = decoder.decode(value, { stream: true }).split('\n');

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') break;
          try {
            const data = JSON.parse(dataStr);

            if (data.step === 'vision') {
              setActiveAgents(p => [...new Set([...p, 'vision'])]);
              if (data.status === 'analyzing') setPipelineStatus('👁️ Agent 5: Biometric Vision analyzing your expression...');
              if (data.status === 'done' && data.detected) {
                setPipelineStatus(`👁️ Agent 5: Expression detected — "${data.detected}"`);
                setBiometricLabel(data.detected);
              }
            }
            else if (data.step === 'memory') {
              setActiveAgents(p => [...new Set([...p, 'memory'])]);
              if (data.status === 'retrieving') setPipelineStatus('🗂️ Agent 6: Searching long-term memory vault...');
              if (data.status === 'done') setPipelineStatus(data.has_memory ? '🗂️ Agent 6: Memory context loaded.' : '🗂️ Agent 6: No prior sessions found.');
            }
            else if (data.step === 'nimble' && data.status === 'routing') {
              setActiveAgents(p => [...new Set([...p, 'nimble'])]);
              setPipelineStatus('🌐 Agent 4: Evaluating need for live web data...');
            }
            else if (data.step === 'nimble' && data.status === 'extracting') {
              setPipelineStatus('🌐 Agent 4: Scraping & extracting clinical context...');
            }
            else if (data.step === 'therapist') {
              setActiveAgents(p => [...new Set([...p, 'therapist'])]);
              setPipelineStatus('🧠 Agents 1–3: Therapist → Quest Generator → Safety Supervisor...');
            }
            else if (data.step === 'error') {
              setPipelineStatus('');
              alert('Pipeline Error: ' + data.detail);
            }
            else if (data.step === 'complete') {
              setPipelineStatus('');
              playSound('notification');
              setChatLog(prev => [...prev, {
                user: msg,
                therapist: data.result.therapist_reply,
                quest: data.result.quest,
                metrics: data.result.vector_metrics,
                nimble_sources: data.result.nimble_sources
              }]);
              speak(data.result.therapist_reply);
              confetti({ particleCount: 60, spread: 50, origin: { y: 0.3 }, colors: ['#8b5cf6', '#10b981'] });
            }
          } catch (e) { console.error(e); }
        }
      }
    } catch (err: any) {
      alert('Pipeline Error: ' + err.message);
      setPipelineStatus('');
      setOrbState('idle');
    }
    setLoading(false);
    if (orbState === 'thinking') setOrbState('idle');
  };

  const playQuest = (quest: Quest) => { setActiveQuest(quest); setCurrentStep(0); };

  const completeStep = () => {
    if (!activeQuest) return;
    playSound('success');
    const earned = activeQuest.steps[currentStep].xp_reward;
    addXP(earned, `Quest: ${activeQuest.steps[currentStep].description.substring(0, 20)}...`);
    if (currentStep < activeQuest.steps.length - 1) {
      setCurrentStep(p => p + 1);
    } else {
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.5 }, colors: ['#8b5cf6', '#10b981', '#fbbf24'] });
      setTimeout(() => setActiveQuest(null), 2000);
    }
  };

  return (
    <div className="page-container" style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      
      {/* Top Bar: Orb + Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', background: 'rgba(255,255,255,0.03)', borderRadius: '16px', padding: '16px 24px', border: '1px solid rgba(255,255,255,0.06)' }}>
        
        {/* The Amaterasu Orb */}
        <div className={`amaterasu-orb ${orbState}`}>
          <div className="orb-core"></div>
          <div className="orb-ring ring-1"></div>
          <div className="orb-ring ring-2"></div>
          <div className="orb-ring ring-3"></div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem' }}><MessageSquare size={16} style={{ marginRight: 6 }} />Amaterasu MAS — 6-Agent Therapeutic Pipeline</h2>
          {biometricLabel && (
            <span style={{ fontSize: '0.78rem', color: '#10b981', marginTop: 4, display: 'block' }}>👁️ Expression: <em>{biometricLabel}</em></span>
          )}
        </div>

        {/* Pipeline Badges */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {PIPELINE_STEPS.map(step => {
            const active = activeAgents.includes(step.key);
            const Icon = step.icon;
            return (
              <div key={step.key} title={step.label} style={{ width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${active ? '#10b981' : 'rgba(255,255,255,0.1)'}`, transition: 'all 0.3s' }}>
                <Icon size={15} color={active ? '#10b981' : '#6b7280'} />
              </div>
            );
          })}
        </div>

        {/* Camera Feed */}
        <div style={{ position: 'relative' }}>
          <video ref={videoRef} autoPlay muted playsInline style={{ width: 80, height: 60, borderRadius: 8, objectFit: 'cover', display: cameraEnabled ? 'block' : 'none', border: '1px solid #10b981' }} />
          <canvas ref={canvasRef} style={{ display: 'none' }} />
          <button onClick={cameraEnabled ? stopCamera : startCamera} title="Toggle Biometric Camera" style={{ background: cameraEnabled ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${cameraEnabled ? '#10b981' : 'rgba(255,255,255,0.1)'}`, color: cameraEnabled ? '#10b981' : '#6b7280', cursor: 'pointer', padding: '6px 10px', borderRadius: 8, display: cameraEnabled ? 'none' : 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <Camera size={14} /> Camera
          </button>
          {cameraEnabled && <button onClick={stopCamera} style={{ position: 'absolute', top: -4, right: -4, background: '#ef4444', border: 'none', color: '#fff', borderRadius: '50%', width: 18, height: 18, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} /></button>}
        </div>

        {/* Voice & PDF Toggle */}
        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={() => setVoiceEnabled(!voiceEnabled)} className="hide-print" style={{ background: 'transparent', border: 'none', color: voiceEnabled ? '#10b981' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <Volume2 size={16} /> {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button onClick={() => window.print()} className="hide-print" style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            Export PDF
          </button>
        </div>
      </div>

      {/* Chat Box */}
      <div className="interaction-panel" style={{ flex: 1, margin: 0, borderRadius: '16px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="chat-box" style={{ flex: 1, overflowY: 'auto' }}>
          {chatLog.length === 0 ? (
            <div className="empty-state">
              <div className="brain-glow"><Brain size={64} color="#8b5cf6" /></div>
              <h3>Begin Your Wellness Journey</h3>
              <p>Type or <strong>speak</strong> how you're feeling. The 6-agent Amaterasu pipeline will analyze your state — combining memory, live web data, and biometric vision — to generate your personalized CBT quest.</p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
                {PIPELINE_STEPS.map(s => { const Icon = s.icon; return (<span key={s.key} style={{ background: 'rgba(255,255,255,0.05)', padding: '4px 10px', borderRadius: 20, fontSize: '0.78rem', color: '#aaa', display: 'flex', alignItems: 'center', gap: 4 }}><Icon size={12} />{s.label}</span>); })}
              </div>
            </div>
          ) : (
            chatLog.map((log, i) => (
              <div key={i} className="chat-entry">
                <div className="user-msg"><strong>You:</strong> {log.user}</div>
                <div className="therapist-msg"><strong>🧠 Therapist Agent:</strong> {log.therapist}</div>

                {/* Anxiety/Engagement bar */}
                <div style={{ display: 'flex', gap: 16, margin: '8px 0', fontSize: '0.78rem', color: '#aaa' }}>
                  <span>😰 Anxiety: <b style={{ color: log.metrics.anxiety > 0.6 ? '#ef4444' : '#10b981' }}>{Math.round(log.metrics.anxiety * 100)}%</b></span>
                  <span>⚡ Engagement: <b style={{ color: '#8b5cf6' }}>{Math.round(log.metrics.engagement * 100)}%</b></span>
                </div>

                {/* Nimble Sources */}
                {log.nimble_sources && log.nimble_sources.length > 0 && (
                  <div className="nimble-sources-container" style={{ margin: '8px 0' }}>
                    <h4 style={{ margin: '0 0 8px 0', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: 4 }}><Globe size={14} /> Live Clinical Context (Agent 4)</h4>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {log.nimble_sources.map((src, idx) => (
                        <a key={idx} href={src.url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none', background: 'rgba(16, 185, 129, 0.05)', padding: '10px 14px', borderRadius: 10, borderLeft: '3px solid #10b981', display: 'block' }}>
                          <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.85rem' }}>{src.title}</div>
                          <div style={{ color: '#aaa', fontSize: '0.78rem', marginTop: 3 }}>{src.snippet}</div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quest Card */}
                <div className="quest-card">
                  <div className="quest-header">
                    <h3><Trophy size={18} /> Quest Unlocked: {log.quest.quest_title}</h3>
                    <span className="total-xp">+{log.quest.total_xp} XP</span>
                  </div>
                  <p>{log.quest.quest_lore}</p>
                  <button className="complete-btn pulse" onClick={() => playQuest(log.quest)}>
                    <PlayCircle size={18} /> Begin Quest
                  </button>
                </div>
              </div>
            ))
          )}

          {/* Pipeline Status */}
          {pipelineStatus && (
            <div className="pipeline-status-indicator">
              <span className="pulse-dot"></span> {pipelineStatus}
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Area */}
        <div className="input-area hide-print" style={{ display: 'flex', gap: 10, padding: '12px' }}>
          {recognition && (
            <button onClick={toggleListen} className={`mic-btn ${isListening ? 'listening' : ''}`} title="Click to speak" style={{ background: isListening ? '#ef4444' : 'rgba(255,255,255,0.05)', border: `1px solid ${isListening ? '#ef4444' : 'rgba(255,255,255,0.1)'}`, padding: '0 14px', borderRadius: 8, color: '#fff', cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center' }}>
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          <input 
            id="chat-input"
            name="chat-input"
            autoComplete="off"
            type="text" 
            value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && !loading && handleSend()} placeholder={isListening ? '🎙️ Listening... speak now' : 'How are you feeling today?'} disabled={loading} autoFocus style={{ flex: 1 }} />
          <button onClick={handleSend} disabled={loading || !input.trim()}>
            {loading ? '⏳' : 'Send →'}
          </button>
        </div>
      </div>

      {/* Quest Modal */}
      {activeQuest && (
        <div className="modal-overlay">
          <div className="quest-modal">
            <button className="close-btn" onClick={() => setActiveQuest(null)}><X size={24} /></button>
            <div className="modal-header">
              <h2><Trophy size={24} color="#fbbf24" /> {activeQuest.quest_title}</h2>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${(currentStep / activeQuest.steps.length) * 100}%` }}></div></div>
              <p>Step {currentStep + 1} of {activeQuest.steps.length}</p>
            </div>
            <div className="modal-body">
              <div className="step-card">
                <h3>{activeQuest.steps[currentStep].description}</h3>
                <div className="reward-tag"><Star size={16} fill="#fbbf24" color="#fbbf24" /> +{activeQuest.steps[currentStep].xp_reward} XP</div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="action-btn" onClick={completeStep}>
                {currentStep === activeQuest.steps.length - 1 ? 'Finish Quest & Claim XP' : 'Complete Step →'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Therapist;
