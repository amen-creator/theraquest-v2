import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayCircle, Star, MessageSquare, Brain, Trophy, X, Mic, MicOff, Volume2, Camera, Globe, Database, Eye, Send } from 'lucide-react';
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
  const [chatLog, setChatLog] = useState<ChatEntry[]>(() => {
    try {
      const saved = localStorage.getItem('theraquest_chat');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [pastSessions, setPastSessions] = useState<ChatEntry[][]>(() => {
    try {
      const saved = localStorage.getItem('theraquest_sessions');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimText, setInterimText] = useState('');
  const [micError, setMicError] = useState<string | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [orbState, setOrbState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [biometricLabel, setBiometricLabel] = useState<string | null>(null);
  const [expandedQuest, setExpandedQuest] = useState<number | null>(null);
  const [triggerSend, setTriggerSend] = useState(false);
  const recognitionRef = useRef<any>(null);
  const shouldListenRef = useRef(false);
  const silenceTimeoutRef = useRef<any>(null);
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
    localStorage.setItem('theraquest_chat', JSON.stringify(chatLog));
  }, [chatLog]);

  useEffect(() => {
    localStorage.setItem('theraquest_sessions', JSON.stringify(pastSessions));
  }, [pastSessions]);

  // Preload premium voices (browsers load them async)
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

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

  // ── Robust Speech Recognition ──────────────────────────────────────────────
  const stopListening = useCallback(() => {
    if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
    shouldListenRef.current = false;
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    setInterimText('');
    setOrbState('idle');
  }, []);

  const startListening = useCallback(async () => {
    setMicError(null);

    // 1. Check browser support
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) {
      setMicError('Speech recognition is not supported in this browser. Please use Chrome.');
      return;
    }

    // 2. Explicitly request microphone permission first
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setMicError('Microphone access denied. Please allow mic access in your browser settings.');
      return;
    }

    // 3. Stop any existing instance
    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch {}
    }

    // 4. Create fresh recognizer
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = 'en-US';
    rec.maxAlternatives = 1;

    rec.onstart = () => {
      setIsListening(true);
      setOrbState('listening');
      setMicError(null);
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);
    };

    rec.onresult = (event: any) => {
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = setTimeout(() => {
        stopListening();
      }, 30000);

      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const t = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalText += t + ' ';
        else interimText += t;
      }

      const combinedLower = (finalText + ' ' + interimText).toLowerCase();
      if (combinedLower.match(/\bsend\b\s*$/i)) {
        const cleanFinal = finalText.replace(/(?:\b|^)send\b\s*$/i, '').trim();
        const cleanInterim = interimText.replace(/(?:\b|^)send\b\s*$/i, '').trim();
        if (cleanFinal) setInput(prev => (prev + ' ' + cleanFinal).trim());
        setInterimText(cleanInterim);
        
        stopListening();
        setTriggerSend(true);
        return;
      }

      if (finalText.trim()) setInput(prev => (prev + ' ' + finalText).trim());
      setInterimText(interimText);
    };

    rec.onerror = (e: any) => {
      if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
        setMicError('Mic blocked. In Brave: Settings → Privacy → Allow microphone. In Chrome: click 🔒 in address bar.');
        stopListening();
      }
      // 'no-speech' and 'aborted' are non-fatal — ignore them
    };

    rec.onend = () => {
      // Auto-restart to keep mic alive as long as user wants it
      if (shouldListenRef.current) {
        try { rec.start(); } catch {}
      } else {
        setIsListening(false);
        setOrbState('idle');
        setInterimText('');
      }
    };

    recognitionRef.current = rec;
    shouldListenRef.current = true;
    try { rec.start(); } catch (e) {
      setMicError('Could not start microphone. Try clicking the Speak button again.');
    }
  }, [stopListening]);

  const toggleListen = () => {
    if (isListening) stopListening();
    else startListening();
  };

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setOrbState('idle');
    }
  }, []);

  // ── Premium Chunked TTS System ───────────────────────────────────────────
  const speak = useCallback((text: string) => {
    if (!voiceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    
    // 1. Voice Selection: Find premium voices
    const voices = window.speechSynthesis.getVoices();
    const bestVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Microsoft Zira') || v.name.includes('Microsoft Aria')) || voices.find(v => v.lang.startsWith('en-'));
    
    // 2. Advanced Chunking: Prevent 15-second Chrome TTS bug by splitting into sentences
    const chunks = text.match(/[^.!?\n]+[.!?\n]+/g) || [text];
    let chunkIndex = 0;
    
    const speakNextChunk = () => {
      if (chunkIndex >= chunks.length) {
        setOrbState('idle');
        return;
      }
      
      const chunkText = chunks[chunkIndex].trim();
      if (!chunkText) {
        chunkIndex++;
        speakNextChunk();
        return;
      }

      const utterance = new SpeechSynthesisUtterance(chunkText);
      if (bestVoice) utterance.voice = bestVoice;
      utterance.lang = 'en-US';
      utterance.pitch = 0.95; // Slightly deeper for a calming therapist voice
      utterance.rate = 0.92;  // Deliberate, measured pacing
      
      utterance.onstart = () => setOrbState('speaking');
      utterance.onend = () => {
        chunkIndex++;
        speakNextChunk();
      };
      utterance.onerror = (e) => {
        console.warn('TTS Error:', e);
        chunkIndex++;
        speakNextChunk(); // Skip failed chunk and continue
      };
      
      window.speechSynthesis.speak(utterance);
    };
    
    speakNextChunk();
  }, [voiceEnabled]);

  const handleSend = useCallback(async () => {
    if (!input.trim() && !interimText.trim()) return;
    const finalInput = (input + ' ' + interimText).trim();
    if (!finalInput) return;
    setInput(finalInput);
    setInterimText('');
    playSound('click');
    if (isListening) {
      stopListening();
    }
    setLoading(true);
    setOrbState('thinking');
    setActiveAgents([]);
    setBiometricLabel(null);
    setPipelineStatus('Initializing Amaterasu 6-Agent Pipeline...');
    const msg = finalInput;
    setInput('');
    const imageData = captureFrame();

    try {
      // MOCK PIPELINE SIMULATION FOR HACKATHON DEMO (Replacing localhost fetch)
      const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      
      const processStep = (data: any) => {
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
      };

      // Simulate Vision
      processStep({ step: 'vision', status: 'analyzing' });
      await wait(1500);
      processStep({ step: 'vision', status: 'done', detected: imageData ? 'Slightly anxious but engaged' : 'Neutral (Camera off)' });
      await wait(800);
      
      // Simulate Memory
      processStep({ step: 'memory', status: 'retrieving' });
      await wait(1200);
      processStep({ step: 'memory', status: 'done', has_memory: true });
      await wait(800);

      // Simulate Nimble Web
      processStep({ step: 'nimble', status: 'routing' });
      await wait(1000);
      processStep({ step: 'nimble', status: 'extracting' });
      await wait(1500);

      // Simulate Core MAS
      processStep({ step: 'therapist' });
      await wait(2500);

      // Complete
      processStep({
        step: 'complete',
        result: {
          therapist_reply: "I hear you. It sounds like you're carrying a lot of weight right now. Let's break this down into smaller, manageable steps. I've created a personalized quest to help you regain your center.",
          quest: {
            quest_title: "The Grounding Anchor",
            quest_lore: "When the mind races, the body must become the anchor. This quest will guide you back to the present moment.",
            total_xp: 150,
            steps: [
              { description: "Take 3 deep, mindful breaths using the 4-7-8 technique.", xp_reward: 50 },
              { description: "Identify 3 things you can see and name them out loud.", xp_reward: 50 },
              { description: "Drink a full glass of water mindfully.", xp_reward: 50 }
            ]
          },
          vector_metrics: { anxiety: 0.65, engagement: 0.88 },
          nimble_sources: [
            { title: "Managing Acute Stress", url: "https://www.apa.org/topics/stress", snippet: "Grounding techniques are clinically proven to interrupt the anxiety cycle." }
          ]
        }
      });
    } catch (err: any) {
      alert('Pipeline Error: ' + err.message);
      setPipelineStatus('');
      setOrbState('idle');
    }
    setLoading(false);
    if (orbState === 'thinking') setOrbState('idle');
  }, [input, interimText, isListening, stopListening, playSound, speak, orbState]);

  useEffect(() => {
    if (triggerSend) {
      setTriggerSend(false);
      handleSend();
    }
  }, [triggerSend, handleSend]);

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
          {orbState === 'speaking' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={stopSpeaking}
              className="hide-print"
              style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem', padding: '4px 10px', borderRadius: '8px' }}
            >
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
              Stop Audio
            </motion.button>
          )}
          <button onClick={() => { setVoiceEnabled(!voiceEnabled); if(voiceEnabled) stopSpeaking(); }} className="hide-print" style={{ background: 'transparent', border: 'none', color: voiceEnabled ? '#10b981' : '#6b7280', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            <Volume2 size={16} /> {voiceEnabled ? 'Voice On' : 'Voice Off'}
          </button>
          <button onClick={() => window.print()} className="hide-print" style={{ background: 'transparent', border: 'none', color: '#8b5cf6', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            Export PDF
          </button>
          <button onClick={() => setShowHistoryModal(true)} className="hide-print" style={{ background: 'transparent', border: 'none', color: '#fbbf24', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8rem' }}>
            📜 History
          </button>
          {chatLog.length > 0 && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setPastSessions(prev => [chatLog, ...prev]);
                setChatLog([]);
                stopSpeaking();
                setActiveAgents([]);
                setPipelineStatus('');
                setBiometricLabel(null);
                playSound('success');
                confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 }, colors: ['#8b5cf6', '#10b981'] });
              }}
              className="hide-print"
              style={{ background: 'linear-gradient(45deg, rgba(139,92,246,0.15), rgba(16,185,129,0.15))', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', padding: '6px 14px', borderRadius: '20px', fontWeight: 500, boxShadow: '0 0 10px rgba(139,92,246,0.1)' }}
            >
              ✨ New Session
            </motion.button>
          )}
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

                {/* Quest Card — Elegant Expand/Collapse */}
                <motion.div
                  className="quest-card"
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.45, ease: [0.34, 1.56, 0.64, 1] }}
                  style={{ cursor: 'pointer' }}
                  onClick={() => setExpandedQuest(expandedQuest === i ? null : i)}
                >
                  <div className="quest-header">
                    <h3><Trophy size={18} /> Quest Unlocked: {log.quest.quest_title}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span className="total-xp">+{log.quest.total_xp} XP</span>
                      <motion.span
                        animate={{ rotate: expandedQuest === i ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{ color: '#8b5cf6', fontSize: '1.2rem', lineHeight: 1 }}
                      >▾</motion.span>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {expandedQuest === i && (
                      <motion.div
                        key="quest-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                        style={{ overflow: 'hidden' }}
                      >
                        <p style={{ marginTop: 12 }}>{log.quest.quest_lore}</p>
                        <div style={{ display: 'flex', gap: 8, marginTop: 4, flexWrap: 'wrap' }}>
                          {log.quest.steps.map((s, si) => (
                            <span key={si} style={{ fontSize: '0.75rem', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)', color: '#a78bfa', padding: '3px 10px', borderRadius: 20 }}>
                              Step {si+1}: +{s.xp_reward} XP
                            </span>
                          ))}
                        </div>
                        <motion.button
                          className="complete-btn"
                          style={{ marginTop: 16, width: '100%' }}
                          whileHover={{ scale: 1.03, boxShadow: '0 0 24px rgba(139,92,246,0.4)' }}
                          whileTap={{ scale: 0.97 }}
                          onClick={e => { e.stopPropagation(); playQuest(log.quest); }}
                        >
                          <PlayCircle size={18} /> Begin Quest
                        </motion.button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
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
        <div className="input-area hide-print" style={{ display: 'flex', flexDirection: 'column', gap: 0, padding: '10px 12px' }}>
          {/* Interim transcript preview */}
          <AnimatePresence>
            {interimText && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ fontSize: '0.82rem', color: '#8b5cf6', padding: '4px 8px 6px', fontStyle: 'italic' }}
              >
                🎙️ {interimText}...
              </motion.div>
            )}
          </AnimatePresence>
          {/* Mic Error */}
          <AnimatePresence>
            {micError && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{ fontSize: '0.8rem', color: '#ef4444', padding: '4px 8px 6px', background: 'rgba(239,68,68,0.08)', borderRadius: 6, marginBottom: 4 }}
              >
                ⚠️ {micError}
              </motion.div>
            )}
          </AnimatePresence>
          <div style={{ display: 'flex', gap: 10 }}>
            <motion.button
              onClick={toggleListen}
              className={`mic-btn ${isListening ? 'listening' : ''}`}
              title={isListening ? 'Click to stop' : 'Click to speak (continuous)'}
              whileTap={{ scale: 0.92 }}
              style={{
                background: isListening ? 'rgba(239,68,68,0.15)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isListening ? '#ef4444' : 'rgba(255,255,255,0.15)'}`,
                padding: '0 14px', borderRadius: 8, color: isListening ? '#ef4444' : '#9ca3af',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                fontSize: '0.8rem', whiteSpace: 'nowrap', minWidth: 90,
                boxShadow: isListening ? '0 0 12px rgba(239,68,68,0.3)' : 'none',
                transition: 'all 0.3s'
              }}
            >
              {isListening ? <MicOff size={16} /> : <Mic size={16} />}
              {isListening ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  Stop
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
                </span>
              ) : 'Speak'}
            </motion.button>
            <input
              id="chat-input"
              name="chat-input"
              autoComplete="off"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !loading && handleSend()}
              placeholder={isListening ? 'Listening... keep talking or type' : 'How are you feeling today?'}
              disabled={loading}
              autoFocus
              style={{ flex: 1 }}
            />
            <motion.button
              onClick={handleSend}
              disabled={loading || (!input.trim() && !interimText.trim())}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              {loading ? '⏳' : <><Send size={15} /> Send</>}
            </motion.button>
          </div>
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

      {/* History Modal */}
      {showHistoryModal && (
        <div className="modal-overlay">
          <div className="quest-modal" style={{ maxWidth: 600 }}>
            <button className="close-btn" onClick={() => setShowHistoryModal(false)}><X size={24} /></button>
            <div className="modal-header">
              <h2>📜 Past Sessions</h2>
              <p>Your previous therapy journeys and conversations.</p>
            </div>
            <div className="modal-body" style={{ maxHeight: 400, overflowY: 'auto' }}>
              {pastSessions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 0', color: '#aaa' }}>No past sessions found. Start a New Session to archive one!</div>
              ) : (
                pastSessions.map((session, idx) => (
                  <div key={idx} className="step-card" style={{ marginBottom: 12, padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ color: '#fff' }}>Session {pastSessions.length - idx}</strong>
                      <span style={{ fontSize: '0.8rem', background: 'rgba(139,92,246,0.2)', color: '#a78bfa', padding: '2px 8px', borderRadius: 12 }}>{session.length} exchanges</span>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', margin: '10px 0', fontStyle: 'italic' }}>
                      "{session[0]?.user.substring(0, 80)}{session[0]?.user.length > 80 ? '...' : ''}"
                    </p>
                    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                      <button onClick={() => { setChatLog(session); setShowHistoryModal(false); }} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: 4 }}><PlayCircle size={14} /> Restore Session</button>
                      <button onClick={() => { if(window.confirm('Delete this session permanently?')) setPastSessions(p => p.filter((_, i) => i !== idx)); }} style={{ background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', padding: '6px 12px', borderRadius: 6, cursor: 'pointer', fontSize: '0.8rem' }}>Delete</button>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button className="action-btn" onClick={() => { if(window.confirm('Are you sure you want to delete all past sessions?')) setPastSessions([]); }} style={{ background: 'transparent', border: '1px solid #ef4444', color: '#ef4444' }}>Clear All History</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Therapist;
