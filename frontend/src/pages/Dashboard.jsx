import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  Area, AreaChart
} from 'recharts';
import {
  FileText, Trophy, TrendingUp, Zap, AlertTriangle,
  Clock, Award, BookOpen, Activity
} from 'lucide-react';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-700 text-sm">
        <p className="font-medium" style={{ color: 'var(--text-primary)' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {p.value}{p.name === 'accuracy' || p.name === 'score' ? '%' : ''}</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/dashboard').then(res => setData(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  if (!data) {
    return <div className="text-center py-12" style={{ color: 'var(--text-secondary)' }}>Failed to load dashboard data</div>;
  }

  const statCards = [
    { label: 'Papers Attempted', value: data.totalPapers, icon: FileText, color: 'from-blue-500 to-cyan-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Average Score', value: `${data.avgScore}%`, icon: Trophy, color: 'from-indigo-500 to-purple-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Best Score', value: `${data.bestScore}%`, icon: Award, color: 'from-amber-500 to-orange-500', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Current Streak', value: `${data.currentStreak} days`, icon: Zap, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  ];

  const radarData = data.topicAccuracy.map(t => ({ topic: t.topic.split(' ').slice(0, 2).join(' '), accuracy: t.accuracy }));
  const trendData = data.trend.map((t, i) => ({ attempt: `#${i + 1}`, score: Math.round(t.score) }));

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Dashboard</h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Your performance overview</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm hover:shadow-md transition-all animate-slideUp" style={{ animationDelay: `${i * 0.1}s` }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{card.label}</p>
                <p className="text-3xl font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}>
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                  <card.icon size={16} className="text-white" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Weakness alerts */}
      {data.weaknesses?.length > 0 && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4 animate-fadeIn">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-400">Weakness Alerts</span>
          </div>
          <div className="space-y-1">
            {data.weaknesses.map((w, i) => (
              <p key={i} className="text-sm text-red-600 dark:text-red-300">
                Your accuracy in <strong>{w.topic}</strong> is {w.accuracy}% (below your average of {w.userAvg}%)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score trend */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <TrendingUp size={18} className="text-indigo-500" /> Score Trend
          </h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="attempt" stroke="var(--text-secondary)" fontSize={12} />
                <YAxis domain={[0, 100]} stroke="var(--text-secondary)" fontSize={12} unit="%" />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="score" stroke="#6366f1" fill="url(#scoreGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]" style={{ color: 'var(--text-secondary)' }}>
              <p>Complete a paper to see your trend</p>
            </div>
          )}
        </div>

        {/* Radar - Topic accuracy */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm">
          <h3 className="font-semibold mb-4 flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Activity size={18} className="text-purple-500" /> Topic Strengths
          </h3>
          {radarData.some(d => d.accuracy > 0) ? (
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="topic" fontSize={10} stroke="var(--text-secondary)" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} fontSize={10} stroke="var(--text-secondary)" />
                <Radar name="accuracy" dataKey="accuracy" stroke="#6366f1" fill="#6366f1" fillOpacity={0.3} strokeWidth={2} />
                <Tooltip content={<CustomTooltip />} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[250px]" style={{ color: 'var(--text-secondary)' }}>
              <p>Complete a paper to see topic strengths</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent attempts */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="font-semibold flex items-center gap-2" style={{ color: 'var(--text-primary)' }}>
            <Clock size={18} className="text-indigo-500" /> Recent Attempts
          </h3>
        </div>
        {data.recentAttempts?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b dark:border-gray-700" style={{ color: 'var(--text-secondary)' }}>
                  <th className="text-left p-4 font-medium">Paper</th>
                  <th className="text-left p-4 font-medium">Date</th>
                  <th className="text-center p-4 font-medium">Score</th>
                  <th className="text-center p-4 font-medium">Duration</th>
                  <th className="text-right p-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {data.recentAttempts.map((a, i) => (
                  <tr key={a.id} className="border-b dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition cursor-pointer" onClick={() => navigate(`/results/${a.id}`)}>
                    <td className="p-4 font-medium" style={{ color: 'var(--text-primary)' }}>{a.title}</td>
                    <td className="p-4" style={{ color: 'var(--text-secondary)' }}>{new Date(a.submitted_at).toLocaleDateString()}</td>
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        a.score >= 80 ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                        a.score >= 50 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
                        'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                      }`}>{Math.round(a.score)}%</span>
                    </td>
                    <td className="p-4 text-center" style={{ color: 'var(--text-secondary)' }}>
                      {a.time_taken ? `${Math.round(a.time_taken / 60)}m` : '-'}
                    </td>
                    <td className="p-4 text-right">
                      <button className="text-indigo-500 hover:text-indigo-600 font-medium text-xs">Review</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center" style={{ color: 'var(--text-secondary)' }}>
            <BookOpen size={40} className="mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No attempts yet</p>
            <p className="text-sm">Generate a model paper to start practicing</p>
            <button onClick={() => navigate('/model-papers')}
              className="mt-4 px-6 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-500/25">
              Generate Paper
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
