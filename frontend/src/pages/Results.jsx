import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import {
  Trophy, Clock, CheckCircle, XCircle, AlertTriangle, ArrowLeft,
  ChevronDown, ChevronUp, Eye, RefreshCw
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-700 text-sm">
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {Math.round(p.value)}%</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Results() {
  const { attemptId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedQ, setExpandedQ] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const result = location.state?.result;

  useEffect(() => {
    if (result) {
      api.get(`/exam/results/${attemptId}`).then(res => {
        setData({ ...res.data, quickResult: result });
      }).catch(() => {}).finally(() => setLoading(false));
    } else {
      api.get(`/exam/results/${attemptId}`).then(res => {
        setData(res.data);
      }).catch(() => {}).finally(() => setLoading(false));
    }
  }, [attemptId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Results not found</div>;
  }

  const { attempt, paper, questions, quickResult } = data;
  const score = quickResult?.score || attempt.score;
  const timedOut = location.state?.timedOut;

  // Compute section scores from questions
  const mcqQs = questions.filter(q => q.type === 'mcq');
  const fibQs = questions.filter(q => q.type === 'fill_blank');
  const codingQs = questions.filter(q => q.type === 'coding');

  const computeSection = (qs) => {
    const correct = qs.filter(q => q.is_correct).length;
    return { correct, total: qs.length, pct: qs.length > 0 ? Math.round((correct / qs.length) * 100) : 0 };
  };

  const mcqScore = computeSection(mcqQs);
  const fibScore = computeSection(fibQs);
  const codingScore = computeSection(codingQs);

  // Topic-wise
  const topicData = {};
  for (const q of questions) {
    if (!topicData[q.topic]) topicData[q.topic] = { correct: 0, total: 0 };
    topicData[q.topic].total++;
    if (q.is_correct) topicData[q.topic].correct++;
  }
  const topicChartData = Object.entries(topicData).map(([topic, d]) => ({
    topic: topic.length > 12 ? topic.slice(0, 12) + '...' : topic,
    accuracy: d.total > 0 ? Math.round((d.correct / d.total) * 100) : 0
  }));

  const difficultyData = {};
  for (const q of questions) {
    if (!difficultyData[q.difficulty]) difficultyData[q.difficulty] = { correct: 0, total: 0 };
    difficultyData[q.difficulty].total++;
    if (q.is_correct) difficultyData[q.difficulty].correct++;
  }
  const diffChartData = Object.entries(difficultyData).map(([d, data]) => ({
    name: d.charAt(0).toUpperCase() + d.slice(1),
    value: data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0
  }));

  const diffColors = { Basic: '#22c55e', Hard: '#f97316', Extreme: '#ef4444', Medium: '#3b82f6' };

  const visibleQuestions = showAll ? questions : questions.slice(0, 5);

  return (
    <div className="space-y-6 animate-fadeIn max-w-5xl mx-auto" style={{ paddingBottom: '2rem' }}>
      {/* Score hero */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm p-8 text-center animate-scaleIn">
        <div className="relative inline-block">
          <div className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto mb-4 ${
            score >= 80 ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
            score >= 50 ? 'bg-gradient-to-br from-yellow-400 to-orange-500' :
            'bg-gradient-to-br from-red-400 to-rose-500'
          }`}>
            <div className="w-24 h-24 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center">
              <span className="text-4xl font-bold">{Math.round(score)}</span>
            </div>
          </div>
          <span className="absolute -bottom-1 -right-1 text-2xl">%</span>
        </div>

        <div className="flex items-center justify-center gap-2 mt-2">
          <Trophy size={20} className={score >= 80 ? 'text-yellow-500' : 'text-gray-400'} />
          <span className="text-lg font-medium" style={{ color: 'var(--text-primary)' }}>
            {score >= 90 ? 'Outstanding!' : score >= 80 ? 'Excellent!' : score >= 60 ? 'Good Effort!' : score >= 40 ? 'Keep Practicing!' : 'Review and Try Again'}
          </span>
        </div>

        {timedOut && (
          <div className="flex items-center justify-center gap-2 mt-3 text-orange-500">
            <Clock size={16} />
            <span className="text-sm font-medium">Auto-submitted due to time limit</span>
          </div>
        )}

        <div className="flex flex-wrap justify-center gap-8 mt-6">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{questions.length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Questions</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{questions.filter(q => q.is_correct).length}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Correct</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{attempt.time_taken ? `${Math.round(attempt.time_taken / 60)}m` : '-'}</p>
            <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Time Taken</p>
          </div>
        </div>
      </div>

      {/* Section scores */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'MCQs', data: mcqScore, color: 'blue' },
          { label: 'Fill in Blanks', data: fibScore, color: 'emerald' },
          { label: 'Coding', data: codingScore, color: 'purple' },
        ].map(s => (
          <div key={s.label} className="bg-white dark:bg-gray-800 rounded-2xl p-5 border dark:border-gray-700 shadow-sm text-center">
            <p className="text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>{s.label}</p>
            <p className={`text-3xl font-bold text-${s.color}-500`}>{s.data.pct}%</p>
            <p className="text-xs mt-1" style={{ color: 'var(--text-secondary)' }}>{s.data.correct}/{s.data.total} correct</p>
            <div className="mt-3 progress-bar">
              <div className={`progress-bar-fill bg-${s.color}-500`} style={{ width: `${s.data.pct}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Topic-wise Accuracy</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topicChartData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis type="number" domain={[0, 100]} stroke="var(--text-secondary)" fontSize={11} />
              <YAxis dataKey="topic" type="category" width={100} stroke="var(--text-secondary)" fontSize={10} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="accuracy" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Difficulty-wise Performance</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={diffChartData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={50}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {diffChartData.map((entry, i) => (
                  <Cell key={i} fill={diffColors[entry.name] || '#6366f1'} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Question review */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Eye size={18} className="text-indigo-500" /> Question Review
          </h3>
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-sm text-indigo-500 hover:text-indigo-600 font-medium"
          >
            {showAll ? 'Show Top 5' : `Show All (${questions.length})`}
          </button>
        </div>
        <div className="divide-y dark:divide-gray-700">
          {visibleQuestions.map((q, i) => (
            <div key={q.id} className="p-4">
              <div
                className="flex items-start gap-3 cursor-pointer"
                onClick={() => setExpandedQ(expandedQ === q.id ? null : q.id)}
              >
                {q.is_correct ? (
                  <CheckCircle size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <XCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Q{i + 1}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      q.difficulty === 'basic' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      q.difficulty === 'hard' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
                      q.difficulty === 'extreme' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                    }`}>{q.difficulty}</span>
                    <span className="topic-tag bg-gray-100 dark:bg-gray-700" style={{ color: 'var(--text-secondary)' }}>{q.topic}</span>
                  </div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{q.question_text}</p>
                  <div className="flex items-center gap-3 mt-1 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <span>Your answer: {q.type === 'coding' ? 'Code submitted' : (q.user_answer || 'Not answered')}</span>
                    <span className="flex items-center gap-1">
                      {expandedQ === q.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {expandedQ === q.id ? 'Hide' : 'Show'} explanation
                    </span>
                  </div>
                </div>
              </div>
              {expandedQ === q.id && (
                <div className="mt-3 ml-9 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 animate-fadeIn">
                  {!q.is_correct && (
                    <p className="text-sm mb-2">
                      <span className="font-medium text-green-600 dark:text-green-400">Correct answer: </span>
                      <span style={{ color: 'var(--text-primary)' }}>{q.correct_answer}</span>
                    </p>
                  )}
                  {q.explanation && (
                    <div>
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Explanation:</p>
                      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{q.explanation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm" style={{ color: 'var(--text-primary)' }}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button onClick={() => navigate('/model-papers')} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition text-sm shadow-lg shadow-indigo-500/25">
          <RefreshCw size={16} /> Try Another Paper
        </button>
      </div>
    </div>
  );
}
