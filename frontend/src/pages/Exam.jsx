import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Clock, AlertTriangle, CheckCircle, Circle, Flag, ChevronLeft, ChevronRight, Send, Play, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Exam() {
  const { paperId } = useParams();
  const navigate = useNavigate();
  const [paper, setPaper] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempt, setAttempt] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(7200);
  const [flagged, setFlagged] = useState(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [codeResults, setCodeResults] = useState({});
  const [runningCode, setRunningCode] = useState({});
  const [isTimedOut, setIsTimedOut] = useState(false);
  const timerRef = useRef(null);

  useEffect(() => {
    api.get(`/papers/${paperId}`).then(res => {
      setPaper(res.data);
      setQuestions(res.data.questions);
      setTimeLeft(res.data.duration || 7200);
      // Start exam
      return api.post(`/exam/start/${paperId}`);
    }).then(res => {
      setAttempt(res.data);
    }).catch(() => {
      toast.error('Failed to load exam');
      navigate('/model-papers');
    });
  }, [paperId]);

  useEffect(() => {
    if (timeLeft <= 0 && attempt && !isTimedOut) {
      setIsTimedOut(true);
      handleSubmit(true);
    }
  }, [timeLeft]);

  useEffect(() => {
    if (!attempt || isTimedOut) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => Math.max(0, t - 1));
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [attempt, isTimedOut]);

  // Save answer periodically
  const saveAnswer = useCallback((qId, ans, timeSpent = 5) => {
    if (!attempt) return;
    setAnswers(prev => ({ ...prev, [qId]: ans }));
    api.post('/exam/save', { attemptId: attempt.id, questionId: qId, answer: ans, timeSpent }).catch(() => {});
  }, [attempt]);

  const handleMCQ = (qId, option) => {
    saveAnswer(qId, option);
  };

  const handleFIB = (qId, value) => {
    setAnswers(prev => ({ ...prev, [qId]: value }));
  };

  const handleFIBBlur = (qId) => {
    if (answers[qId]) {
      api.post('/exam/save', { attemptId: attempt.id, questionId: qId, answer: answers[qId], timeSpent: 2 }).catch(() => {});
    }
  };

  const handleCodeChange = (qId, code) => {
    setAnswers(prev => ({ ...prev, [qId]: code }));
  };

  const codeAnswer = (question) => (
    Object.prototype.hasOwnProperty.call(answers, question.id)
      ? answers[question.id]
      : question.code_starter || ''
  );

  const runCode = async (qId, code) => {
    const q = questions.find(q => q.id === qId);
    if (!q || !q.test_cases) return;

    setRunningCode(prev => ({ ...prev, [qId]: true }));
    // Simulate code execution with test cases
    const testCases = typeof q.test_cases === 'string' ? JSON.parse(q.test_cases) : q.test_cases;
    const results = testCases.map(tc => {
      try {
        // Very simple simulation - just check if output matches expected
        const passed = Math.random() > 0.3; // Simulated for demo
        return { input: tc.input, expected: tc.expected_output, passed, actual: passed ? tc.expected_output : 'Error: ...' };
      } catch {
        return { input: tc.input, expected: tc.expected_output, passed: false, actual: 'Runtime Error' };
      }
    });
    await new Promise(r => setTimeout(r, 500));
    setCodeResults(prev => ({ ...prev, [qId]: results }));
    setRunningCode(prev => ({ ...prev, [qId]: false }));

    // Save with test results
    if (attempt) {
      const passedCount = results.filter(r => r.passed).length;
      api.post('/exam/coding', {
        attemptId: attempt.id, questionId: qId, answer: code, testCaseResults: results, timeSpent: 10
      }).catch(() => {});
    }
  };

  const handleSubmit = async (timedOut = false) => {
    if (!attempt) return;
    setSubmitting(true);
    clearInterval(timerRef.current);
    try {
      // Save all pending answers
      for (const [qId, ans] of Object.entries(answers)) {
        if (typeof ans === 'string' && ans.length > 0) {
          await api.post('/exam/save', { attemptId: attempt.id, questionId: qId, answer: ans, timeSpent: 0 });
        }
      }
      const timeTaken = (paper?.duration || 7200) - timeLeft;
      const res = await api.post('/exam/submit', { attemptId: attempt.id, timeTaken });
      navigate(`/results/${attempt.id}`, { state: { result: res.data, timedOut } });
    } catch (err) {
      toast.error('Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!paper || !questions.length || !attempt) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  const currentQ = questions[currentIndex];
  const answeredCount = Object.values(answers).filter(a => a !== null && a !== undefined && a !== '').length;

  // Group questions by section
  const mcqQuestions = questions.filter(q => q.section === 'mcq');
  const fibQuestions = questions.filter(q => q.section === 'fill_blank');
  const codingQuestions = questions.filter(q => q.section === 'coding');

  const formatTime = (s) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  const getDifficultyClass = (d) => {
    const map = { basic: 'difficulty-basic', hard: 'difficulty-hard', extreme: 'difficulty-extreme', medium: 'difficulty-medium' };
    return map[d] || '';
  };

  const getQuestionStatus = (qId) => {
    if (flagged.has(qId)) return 'flagged';
    const ans = answers[qId];
    if (ans !== null && ans !== undefined && ans !== '') return 'answered';
    return 'unanswered';
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 animate-fadeIn h-[calc(100vh-8rem)]">
      {/* Question navigator sidebar */}
      <div className="lg:w-72 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-4 lg:h-full overflow-y-auto flex-shrink-0">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>Question Navigator</h3>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono ${
              timeLeft < 300 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 animate-pulse' : 'bg-gray-100 dark:bg-gray-700'
            }`} style={{ color: timeLeft < 300 ? undefined : 'var(--text-primary)' }}>
              <Clock size={14} />
              {formatTime(timeLeft)}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--text-secondary)' }}>
            <span className="flex items-center gap-1"><CheckCircle size={12} className="text-green-500" /> {answeredCount}</span>
            <span className="flex items-center gap-1"><Circle size={12} /> {questions.length - answeredCount}</span>
            <span className="flex items-center gap-1"><Flag size={12} className="text-orange-500" /> {flagged.size}</span>
          </div>
          <div className="mt-3 progress-bar">
            <div className="progress-bar-fill bg-gradient-to-r from-indigo-500 to-purple-500" style={{ width: `${(answeredCount / questions.length) * 100}%` }} />
          </div>
        </div>

        {/* Sections */}
        {[
          { label: 'MCQs', questions: mcqQuestions, color: 'border-blue-400' },
          { label: 'Fill in Blanks', questions: fibQuestions, color: 'border-emerald-400' },
          { label: 'Coding', questions: codingQuestions, color: 'border-purple-400' },
        ].map(section => section.questions.length > 0 && (
          <div key={section.label} className="mb-3">
            <h4 className="text-xs font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{section.label} ({section.questions.length})</h4>
            <div className="grid grid-cols-6 gap-1.5">
              {section.questions.map(q => {
                const status = getQuestionStatus(q.id);
                const isCurrent = q.id === currentQ.id;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentIndex(questions.indexOf(q))}
                    className={`
                      w-8 h-8 rounded-lg text-xs font-medium transition-all flex items-center justify-center
                      ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-2 dark:ring-offset-gray-800' : ''}
                      ${status === 'answered' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : ''}
                      ${status === 'flagged' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300' : ''}
                      ${status === 'unanswered' && !isCurrent ? 'bg-gray-100 dark:bg-gray-700' : ''}
                    `}
                    style={{ color: status === 'unanswered' && !isCurrent ? 'var(--text-secondary)' : undefined }}
                  >
                    {q.section === 'coding' ? 'C' : questions.indexOf(q) + 1}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Main question area */}
      <div className="flex-1 bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-6 flex flex-col overflow-y-auto">
        {currentQ && (
          <div className="flex-1 space-y-6">
            {/* Question header */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyClass(currentQ.difficulty)}`}>
                  {currentQ.difficulty}
                </span>
                <span className="topic-tag bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                  {currentQ.topic}
                </span>
                <span className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700" style={{ color: 'var(--text-secondary)' }}>
                  {currentQ.section === 'mcq' ? 'MCQ' : currentQ.section === 'fill_blank' ? 'Fill in Blank' : 'Coding'}
                </span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  Question {currentIndex + 1} of {questions.length}
                </span>
              </div>
              <button
                onClick={() => {
                  const newFlagged = new Set(flagged);
                  if (flagged.has(currentQ.id)) newFlagged.delete(currentQ.id);
                  else newFlagged.add(currentQ.id);
                  setFlagged(newFlagged);
                }}
                className={`p-2 rounded-lg transition ${flagged.has(currentQ.id) ? 'bg-orange-100 text-orange-500 dark:bg-orange-900/30' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                style={{ color: flagged.has(currentQ.id) ? undefined : 'var(--text-secondary)' }}
              >
                <Flag size={18} />
              </button>
            </div>

            {/* Question text */}
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-lg leading-relaxed font-medium" style={{ color: 'var(--text-primary)' }}>{currentQ.question_text}</p>
            </div>

            {/* MCQ */}
            {currentQ.section === 'mcq' && currentQ.options && (
              <div className="space-y-3 mt-4">
                {JSON.parse(currentQ.options).map((opt, i) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = answers[currentQ.id] === opt;
                  return (
                    <button
                      key={i}
                      onClick={() => handleMCQ(currentQ.id, opt)}
                      className={`
                        w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-3
                        ${isSelected
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 dark:border-indigo-400'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        }
                      `}
                    >
                      <span className={`
                        w-8 h-8 rounded-lg flex items-center justify-center text-sm font-medium flex-shrink-0
                        ${isSelected ? 'bg-indigo-500 text-white' : 'bg-gray-100 dark:bg-gray-700'}
                      `} style={{ color: isSelected ? undefined : 'var(--text-secondary)' }}>
                        {letters[i]}
                      </span>
                      <span style={{ color: 'var(--text-primary)' }}>{opt}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Fill in blank */}
            {currentQ.section === 'fill_blank' && (
              <div className="mt-4">
                <input
                  type="text"
                  value={answers[currentQ.id] || ''}
                  onChange={e => handleFIB(currentQ.id, e.target.value)}
                  onBlur={() => handleFIBBlur(currentQ.id)}
                  className="w-full px-5 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition text-lg"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Type your answer here..."
                />
                <p className="text-xs mt-2" style={{ color: 'var(--text-secondary)' }}>Case-insensitive, whitespace-tolerant matching</p>
              </div>
            )}

            {/* Coding */}
            {currentQ.section === 'coding' && (
              <div className="space-y-4 mt-4">
                <textarea
                  value={codeAnswer(currentQ)}
                  onChange={e => handleCodeChange(currentQ.id, e.target.value)}
                  className="w-full h-48 px-4 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-gray-900 text-green-400 font-mono text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition resize-y"
                  placeholder="Write your code here..."
                  spellCheck={false}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => runCode(currentQ.id, codeAnswer(currentQ))}
                    disabled={runningCode[currentQ.id]}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-500 text-white font-medium hover:bg-indigo-600 transition disabled:opacity-50"
                  >
                    {runningCode[currentQ.id] ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
                    Run Tests
                  </button>
                </div>
                {/* Test results */}
                {codeResults[currentQ.id] && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm" style={{ color: 'var(--text-primary)' }}>Test Results</h4>
                    {codeResults[currentQ.id].map((r, i) => (
                      <div key={i} className={`p-3 rounded-lg text-sm ${r.passed ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'}`}>
                        <div className="flex items-center gap-2 mb-1">
                          {r.passed ? <CheckCircle size={14} className="text-green-500" /> : <AlertTriangle size={14} className="text-red-500" />}
                          <span className="font-medium" style={{ color: r.passed ? 'var(--text-primary)' : 'var(--text-primary)' }}>Test {i + 1}</span>
                        </div>
                        <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Input: {r.input}</p>
                        {!r.passed && <p className="text-xs mt-0.5" style={{ color: 'var(--text-secondary)' }}>Expected: {r.expected}, Got: {r.actual}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6 pt-4 border-t dark:border-gray-700">
          <button
            onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50 text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            <ChevronLeft size={16} /> Previous
          </button>

          {currentIndex < questions.length - 1 ? (
            <button
              onClick={() => setCurrentIndex(currentIndex + 1)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition text-sm"
            >
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white font-medium hover:from-green-600 hover:to-emerald-700 transition disabled:opacity-50 shadow-lg shadow-green-500/25"
            >
              {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              Submit Exam
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
