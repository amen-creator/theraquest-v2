import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, RefreshCw, ArrowRight, Trophy, Zap, Brain } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';
import { useAudio } from '../hooks/useAudio';
import './Quizzes.css';

interface Question { question: string; options: string[]; answer: string; explanation: string; }

const TOPICS = [
  { id: 'CBT Fundamentals', label: 'CBT Fundamentals', icon: '🧠' },
  { id: 'Anxiety & Coping', label: 'Anxiety & Coping', icon: '🌊' },
  { id: 'Depression & Behavioral Activation', label: 'Depression & BA', icon: '🌅' },
  { id: 'Mindfulness', label: 'Mindfulness', icon: '🧘' },
  { id: 'Self-Compassion', label: 'Self-Compassion', icon: '💗' },
  { id: 'Stress Management', label: 'Stress Management', icon: '⚡' },
];

const LETTERS = ['A', 'B', 'C', 'D'];

const Quizzes: React.FC = () => {
  const { addXP } = useGlobalState();
  const playSound = useAudio();

  const [topic, setTopic] = useState(TOPICS[0].id);
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [revealedIdx, setRevealedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    playSound('click');
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setQuestions([]);
    setCurrentIdx(0);
    setRevealedIdx(null);
    try {
      const res = await fetch('http://localhost:8000/api/quiz', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, num_questions: numQ })
      });
      const data = await res.json();
      setQuestions(data.questions || []);
    } catch {
      setQuestions([]);
    }
    setLoading(false);
  };

  const handleAnswer = (opt: string) => {
    if (revealedIdx === currentIdx) return; // already answered
    playSound('click');
    setAnswers(prev => ({ ...prev, [currentIdx]: opt }));
    setRevealedIdx(currentIdx);

    const isCorrect = opt[0] === questions[currentIdx].answer;
    if (isCorrect) playSound('success');
  };

  const goNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(i => i + 1);
      setRevealedIdx(null);
      playSound('click');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = () => {
    const sc = questions.reduce((acc, q, i) => acc + ((answers[i] || '')[0] === q.answer ? 1 : 0), 0);
    setScore(sc);
    setSubmitted(true);
    addXP(20 + sc * 8, `Quiz: ${sc}/${questions.length} on ${topic}`);
    playSound('success');
  };

  const reset = () => {
    setQuestions([]);
    setAnswers({});
    setSubmitted(false);
    setCurrentIdx(0);
    setRevealedIdx(null);
  };

  const currentQ = questions[currentIdx];
  const answered = revealedIdx === currentIdx;
  const pct = questions.length > 0 ? (score / questions.length) * 100 : 0;
  const xpEarned = 20 + score * 8;

  const getScoreColor = () => pct >= 80 ? '#10b981' : pct >= 50 ? '#fbbf24' : '#ef4444';
  const getScoreLabel = () => pct >= 80 ? '🌟 Exceptional Mastery!' : pct >= 60 ? '💪 Great Progress!' : pct >= 40 ? '📚 Keep Practising!' : '🔄 Try Again!';

  return (
    <div className="quizzes-page">

      {/* ── SIDEBAR ── */}
      <div className="quiz-sidebar">
        <div className="quiz-sidebar-header">
          <h2>Knowledge Arena</h2>
          <p>Test your CBT expertise and earn XP</p>
        </div>

        <div className="quiz-topic-list">
          {TOPICS.map(t => (
            <button
              key={t.id}
              className={`quiz-topic-btn ${topic === t.id ? 'active' : ''}`}
              onClick={() => { setTopic(t.id); playSound('click'); }}
              disabled={questions.length > 0 && !submitted}
            >
              <span className="quiz-topic-icon">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        <div className="quiz-num-selector">
          <label>
            <span>Questions</span>
            <span>{numQ}</span>
          </label>
          <input
            type="range" min={3} max={10} value={numQ}
            onChange={e => setNumQ(+e.target.value)}
            disabled={questions.length > 0 && !submitted}
            style={{ width: '100%', accentColor: '#fbbf24' }}
          />
        </div>

        {/* XP preview */}
        <div style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: 14, padding: '1rem', fontSize: '0.85rem', color: '#88a0b0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#fbbf24', fontWeight: 700, marginBottom: 6 }}>
            <Zap size={14} /> XP Reward
          </div>
          Base: 20 XP + 8 XP per correct answer<br />
          <span style={{ color: '#fbbf24' }}>Max: {20 + numQ * 8} XP</span>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="quiz-main">
        <AnimatePresence mode="wait">

          {/* LOBBY */}
          {!loading && !questions.length && !submitted && (
            <motion.div key="lobby" className="quiz-lobby" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <motion.div className="quiz-lobby-badge" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2.5, repeat: Infinity }}>
                {TOPICS.find(t => t.id === topic)?.icon}
              </motion.div>
              <h1>{TOPICS.find(t => t.id === topic)?.label}</h1>
              <p>You're about to take a {numQ}-question quiz on this topic. Each correct answer earns you +8 XP. Are you ready?</p>

              <div style={{ display: 'flex', gap: '2rem', textAlign: 'center' }}>
                {[{ label: 'Questions', val: numQ, color: '#3b82f6' }, { label: 'Max XP', val: `${20 + numQ * 8}`, color: '#fbbf24' }, { label: 'Topic', val: '1', color: '#10b981' }].map(s => (
                  <div key={s.label} style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem 1.5rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div style={{ fontSize: '1.8rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                    <div style={{ fontSize: '0.8rem', color: '#88a0b0', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              <button className="quiz-start-btn" onClick={generateQuiz}>
                ⚡ Start Challenge
              </button>
            </motion.div>
          )}

          {/* LOADING */}
          {loading && (
            <motion.div key="loading" className="quiz-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="quiz-loader-orb" />
              <h2 style={{ color: '#fff', margin: 0 }}>Building Your Quiz...</h2>
              <p style={{ color: '#88a0b0' }}>Our AI is crafting unique questions for you</p>
            </motion.div>
          )}

          {/* ONE QUESTION AT A TIME */}
          {questions.length > 0 && !submitted && (
            <motion.div key="quiz" className="quiz-question-wrapper" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

              {/* Progress bar */}
              <div className="quiz-progress-bar">
                <div className="quiz-progress-fill" style={{ width: `${((currentIdx + (answered ? 1 : 0)) / questions.length) * 100}%` }} />
              </div>

              {/* Question counter */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', maxWidth: 700 }}>
                <span style={{ color: '#88a0b0', fontSize: '0.9rem' }}>{currentIdx + 1} / {questions.length}</span>
                <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.9rem' }}>
                  {Object.values(answers).filter((a, i) => a[0] === questions[i]?.answer).length} correct so far
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIdx}
                  initial={{ opacity: 0, x: 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.3 }}
                  className="quiz-question-card"
                >
                  <div className="quiz-q-number">Question {currentIdx + 1}</div>
                  <div className="quiz-q-text">{currentQ.question}</div>

                  <div className="quiz-options">
                    {currentQ.options.map((opt, oi) => {
                      let cls = '';
                      if (answered) {
                        if (opt[0] === currentQ.answer) cls = 'correct';
                        else if (answers[currentIdx] === opt) cls = 'wrong';
                      } else if (answers[currentIdx] === opt) {
                        cls = 'selected';
                      }
                      return (
                        <motion.button
                          key={opt}
                          className={`quiz-option ${cls}`}
                          onClick={() => handleAnswer(opt)}
                          disabled={answered}
                          whileHover={!answered ? { x: 5 } : {}}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: oi * 0.08 }}
                        >
                          <span className="quiz-option-letter">{LETTERS[oi]}</span>
                          {opt.length > 2 ? opt.slice(3) : opt}
                        </motion.button>
                      );
                    })}
                  </div>

                  {/* Explanation revealed after answering */}
                  <AnimatePresence>
                    {answered && (
                      <motion.div
                        className="quiz-explanation"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ duration: 0.4 }}
                      >
                        💡 {currentQ.explanation}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Nav buttons */}
                  {answered && (
                    <motion.div className="quiz-nav" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <button
                        className="btn-wizard btn-primary"
                        onClick={goNext}
                        style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                      >
                        {currentIdx < questions.length - 1
                          ? <><ArrowRight size={18} /> Next Question</>
                          : <><Trophy size={18} /> See Results</>
                        }
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}

          {/* RESULTS */}
          {submitted && (
            <motion.div key="results" className="quiz-results" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>

              {/* Score Hero Card */}
              <motion.div
                className="quiz-score-card"
                style={{ background: `radial-gradient(circle at center, ${getScoreColor()}22, rgba(20,25,40,0.9))`, border: `2px solid ${getScoreColor()}` }}
                initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200 }}
              >
                <div className="quiz-score-big" style={{ color: getScoreColor() }}>{score}<span style={{ fontSize: '3rem', opacity: 0.6 }}>/{questions.length}</span></div>
                <div className="quiz-score-label" style={{ color: '#fff' }}>{getScoreLabel()}</div>
                <div style={{ color: '#fbbf24', fontSize: '1.2rem', fontWeight: 700 }}>
                  <Zap size={18} style={{ display: 'inline' }} /> +{xpEarned} XP Earned!
                </div>

                {/* Circular percentage */}
                <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'center', gap: '2rem' }}>
                  {[{ label: 'Correct', val: score, color: '#10b981' }, { label: 'Wrong', val: questions.length - score, color: '#ef4444' }, { label: 'Accuracy', val: `${Math.round(pct)}%`, color: getScoreColor() }].map(s => (
                    <div key={s.label} style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', fontWeight: 900, color: s.color }}>{s.val}</div>
                      <div style={{ fontSize: '0.8rem', color: '#88a0b0' }}>{s.label}</div>
                    </div>
                  ))}
                </div>
              </motion.div>

              {/* Per-question review */}
              <h3 style={{ color: '#fff', margin: 0 }}>Question Review</h3>
              <div className="quiz-review-list">
                {questions.map((q, i) => {
                  const isCorrect = (answers[i] || '')[0] === q.answer;
                  return (
                    <motion.div
                      key={i}
                      className={`quiz-review-item ${isCorrect ? 'correct' : 'wrong'}`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                    >
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', marginBottom: 8 }}>
                        {isCorrect ? <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                        <span style={{ color: '#fff', fontWeight: 700 }}>Q{i + 1}. {q.question}</span>
                      </div>
                      <div style={{ paddingLeft: 28 }}>
                        <div style={{ color: '#10b981', fontSize: '0.9rem', marginBottom: 4 }}>✓ Correct: {q.answer}</div>
                        <div style={{ color: '#88a0b0', fontSize: '0.85rem', lineHeight: 1.5 }}>💡 {q.explanation}</div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Retry button */}
              <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', paddingBottom: '3rem' }}>
                <button className="btn-wizard btn-secondary" onClick={reset} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <RefreshCw size={18} /> New Quiz
                </button>
                <button className="quiz-start-btn" onClick={generateQuiz} style={{ fontSize: '1rem', padding: '0.9rem 2.5rem' }}>
                  ⚡ Retry Same Topic
                </button>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
};

export default Quizzes;
