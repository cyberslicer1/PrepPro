import { useState, useEffect } from 'react';
import api from '../api';
import { Mic, MessageSquare, Lightbulb, BookOpen, ChevronRight, Clock, Send, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MockInterview() {
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [stats, setStats] = useState({ total: 0, byTopic: [] });
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    Promise.all([
      api.get('/interview/questions'),
      api.get('/interview/history'),
      api.get('/interview/stats')
    ]).then(([qRes, hRes, sRes]) => {
      setQuestions(qRes.data);
      setHistory(hRes.data);
      setStats(sRes.data);
      loadRandomQuestion(qRes.data, filterType);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const loadRandomQuestion = (qs, type) => {
    const filtered = type === 'all' ? qs : qs.filter(q => q.type === type);
    if (filtered.length === 0) return;
    const random = filtered[Math.floor(Math.random() * filtered.length)];
    setCurrentQ(random);
    setAnswer('');
    setFeedback(null);
  };

  const handleNewQuestion = () => {
    loadRandomQuestion(questions, filterType);
  };

  const handleSubmit = async () => {
    if (!currentQ || !answer.trim()) {
      toast.error('Please write an answer');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/interview/practice', {
        questionId: currentQ.id,
        answer
      });
      setFeedback(res.data);
      toast.success('Answer submitted!');
      // Refresh history
      const hRes = await api.get('/interview/history');
      setHistory(hRes.data);
    } catch (err) {
      toast.error('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Mock Interview</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Practice interview questions with feedback</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{stats.total}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Practiced</p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-4 py-2 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            style={{ color: 'var(--text-primary)' }}
          >
            {showHistory ? 'Practice' : 'History'}
          </button>
        </div>
      </div>

      {showHistory ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="font-semibold" style={{ color: 'var(--text-primary)' }}>Practice History</h3>
          </div>
          {history.length > 0 ? (
            <div className="divide-y dark:divide-gray-700">
              {history.map(h => (
                <div key={h.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={16} className="text-purple-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{h.question_text}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                        <span className="topic-tag bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">{h.topic}</span>
                        <span>{new Date(h.practiced_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
              <Mic size={40} className="mx-auto mb-3 opacity-50" />
              <p>No interview practice yet</p>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Filter */}
          <div className="flex gap-2 flex-wrap">
            {['all', 'technical', 'behavioral', 'case_study'].map(type => (
              <button
                key={type}
                onClick={() => {
                  setFilterType(type);
                  loadRandomQuestion(questions, type);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
                  filterType === type
                    ? 'bg-purple-500 text-white'
                    : 'bg-white dark:bg-gray-800 border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
                style={{ color: filterType === type ? undefined : 'var(--text-primary)' }}
              >
                {type === 'all' ? 'All Types' : type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>

          {/* Question card */}
          {currentQ && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden animate-fadeIn">
              <div className="p-6 space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                    <Mic size={24} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                        {currentQ.type.replace('_', ' ')}
                      </span>
                      <span className="topic-tag bg-pink-100 text-pink-700 dark:bg-pink-900/50 dark:text-pink-300">
                        {currentQ.topic}
                      </span>
                    </div>
                    <p className="text-lg font-medium leading-relaxed" style={{ color: 'var(--text-primary)' }}>
                      {currentQ.question_text}
                    </p>
                  </div>
                </div>

                <textarea
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  className="w-full h-40 p-4 rounded-xl border-2 border-gray-200 dark:border-gray-600 bg-transparent focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition resize-y text-sm"
                  style={{ color: 'var(--text-primary)' }}
                  placeholder="Type your answer here as you would in an interview..."
                />

                <div className="flex gap-3">
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !answer.trim()}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition disabled:opacity-50 shadow-lg shadow-purple-500/25"
                  >
                    {submitting ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
                    Submit Answer
                  </button>
                  <button
                    onClick={handleNewQuestion}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
                    style={{ color: 'var(--text-primary)' }}
                  >
                    <RefreshCw size={16} /> Next Question
                  </button>
                </div>
              </div>

              {/* Feedback */}
              {feedback && (
                <div className="border-t dark:border-gray-700 animate-slideUp">
                  <div className="p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
                      <Lightbulb size={18} className="text-yellow-500" /> Feedback
                    </h3>
                    <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <p className="text-sm" style={{ color: 'var(--text-primary)' }}>{feedback.feedback}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>Model Answer:</h4>
                      <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>{feedback.modelAnswer}</p>
                      </div>
                    </div>
                    {feedback.tips && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <Lightbulb size={16} className="text-blue-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm" style={{ color: 'var(--text-primary)' }}><strong>Tip:</strong> {feedback.tips}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
            <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
              <BookOpen size={18} className="text-purple-500" /> Topics Covered
            </h3>
            <div className="flex flex-wrap gap-2">
              {stats.byTopic.map(t => (
                <span key={t.topic} className="px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 text-sm font-medium">
                  {t.topic} ({t.count})
                </span>
              ))}
              {stats.byTopic.length === 0 && (
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>No topics practiced yet</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
