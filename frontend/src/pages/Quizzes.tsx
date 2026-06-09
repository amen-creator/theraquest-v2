import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import { useGlobalState } from '../context/GlobalState';

const TOPICS = ['CBT Fundamentals', 'Anxiety & Coping', 'Depression & Behavioral Activation', 'Mindfulness', 'Self-Compassion', 'Stress Management'];

interface Question { question: string; options: string[]; answer: string; explanation: string; }

const Quizzes: React.FC = () => {
  const { addXP } = useGlobalState();
  const [topic, setTopic] = useState(TOPICS[0]);
  const [numQ, setNumQ] = useState(5);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState(0);

  const generateQuiz = async () => {
    setLoading(true);
    setSubmitted(false);
    setAnswers({});
    setQuestions([]);
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

  const submit = () => {
    const sc = questions.reduce((acc, q, i) => acc + ((answers[i] || '')[0] === q.answer ? 1 : 0), 0);
    setScore(sc);
    setSubmitted(true);
    addXP(15 + sc * 5, `Quiz: ${sc}/${questions.length} on ${topic}`);
  };

  const pct = questions.length > 0 ? (score / questions.length) * 100 : 0;

  return (
    <motion.div style={{ padding: '2rem', overflowY: 'auto', height: 'calc(100vh - 70px)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: 0, background: 'linear-gradient(135deg, #fff, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Wellness Knowledge Quizzes</h1>
        <p style={{ color: 'var(--text-muted)', margin: '0.5rem 0 0' }}>Test your CBT knowledge and earn XP — new questions every time!</p>
      </div>

      {/* Settings */}
      {!questions.length && (
        <div style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: '16px', padding: '2rem' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>📖 Choose Topic</label>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {TOPICS.map(t => (
                <button key={t} onClick={() => setTopic(t)} style={{ padding: '0.5rem 1rem', borderRadius: '8px', border: '1px solid', borderColor: topic === t ? '#fbbf24' : 'var(--border)', background: topic === t ? 'rgba(251,191,36,0.15)' : 'rgba(255,255,255,0.03)', color: topic === t ? '#fbbf24' : 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>❓ Number of Questions: {numQ}</label>
            <input type="range" min={3} max={8} value={numQ} onChange={e => setNumQ(+e.target.value)} style={{ width: '100%', accentColor: '#fbbf24' }} />
          </div>
          <button onClick={generateQuiz} disabled={loading} style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'black', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontSize: '1rem', fontWeight: 800, cursor: 'pointer', opacity: loading ? 0.5 : 1 }}>
            {loading ? '🎲 Generating Quiz...' : `🎲 Generate ${numQ}-Question Quiz`}
          </button>
        </div>
      )}

      {/* Questions */}
      {questions.length > 0 && !submitted && (
        <AnimatePresence>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {questions.map((q, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} style={{ background: 'var(--panel-bg)', border: '1px solid var(--border)', borderRadius: '14px', padding: '1.5rem' }}>
                <p style={{ fontWeight: 700, fontSize: '1rem', margin: '0 0 1rem' }}>Q{i + 1}. {q.question}</p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                  {q.options.map(opt => (
                    <button key={opt} onClick={() => setAnswers(prev => ({ ...prev, [i]: opt }))} style={{ textAlign: 'left', padding: '0.75rem 1rem', borderRadius: '10px', border: '1px solid', borderColor: answers[i] === opt ? 'var(--accent)' : 'var(--border)', background: answers[i] === opt ? 'rgba(139,92,246,0.2)' : 'rgba(255,255,255,0.03)', color: answers[i] === opt ? 'white' : 'var(--text-muted)', cursor: 'pointer', transition: 'all 0.15s', fontWeight: answers[i] === opt ? 700 : 400 }}>
                      {opt}
                    </button>
                  ))}
                </div>
              </motion.div>
            ))}
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={submit} disabled={Object.keys(answers).length < questions.length} style={{ flex: 1, background: 'linear-gradient(135deg, #10b981, #059669)', color: 'white', border: 'none', padding: '1rem', borderRadius: '12px', fontWeight: 800, fontSize: '1rem', cursor: 'pointer', opacity: Object.keys(answers).length < questions.length ? 0.5 : 1 }}>
                ✅ Submit Answers
              </button>
              <button onClick={() => { setQuestions([]); setAnswers({}); }} style={{ padding: '1rem 2rem', background: 'transparent', border: '1px solid var(--border)', borderRadius: '12px', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <RefreshCw size={18}/>
              </button>
            </div>
          </div>
        </AnimatePresence>
      )}

      {/* Results */}
      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ background: pct >= 70 ? 'rgba(16,185,129,0.1)' : pct >= 50 ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)', border: `2px solid ${pct >= 70 ? '#10b981' : pct >= 50 ? '#fbbf24' : '#ef4444'}`, borderRadius: '16px', padding: '2rem', textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '4rem', fontWeight: 900, fontFamily: 'Outfit, sans-serif', color: pct >= 70 ? '#10b981' : pct >= 50 ? '#fbbf24' : '#ef4444' }}>{score}/{questions.length}</div>
            <p style={{ color: 'rgba(255,255,255,0.6)', margin: '0.5rem 0 0' }}>
              {pct >= 80 ? '🌟 Excellent! You mastered these concepts!' : pct >= 50 ? '💪 Good effort! Keep practicing.' : '📚 Keep learning — every session counts!'}
            </p>
            <div style={{ marginTop: '0.5rem', color: '#fbbf24', fontWeight: 700 }}>+{15 + score * 5} XP Earned!</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {questions.map((q, i) => {
              const isCorrect = (answers[i] || '')[0] === q.answer;
              return (
                <div key={i} style={{ background: 'var(--panel-bg)', border: `1px solid ${isCorrect ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '12px', padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {isCorrect ? <CheckCircle size={18} color="#10b981"/> : <XCircle size={18} color="#ef4444"/>}
                    <span style={{ fontWeight: 700 }}>Q{i + 1}. {q.question}</span>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#10b981' }}>✓ Correct: {q.answer})</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>💡 {q.explanation}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { setQuestions([]); setAnswers({}); setSubmitted(false); }} style={{ background: 'linear-gradient(135deg, #fbbf24, #d97706)', color: 'black', border: 'none', padding: '1rem 2.5rem', borderRadius: '12px', fontWeight: 800, cursor: 'pointer' }}>
            🔄 New Quiz
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default Quizzes;
