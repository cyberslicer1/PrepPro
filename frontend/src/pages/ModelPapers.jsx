import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { FileText, Plus, Clock, Loader2, Play, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ModelPapers() {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const fetchPapers = () => {
    api.get('/papers').then(res => setPapers(res.data)).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchPapers(); }, []);

  const generatePaper = async () => {
    setGenerating(true);
    try {
      const res = await api.post('/papers/generate', { duration: 7200 });
      toast.success('New model paper generated!');
      fetchPapers();
      navigate(`/exam/${res.data.paperId}`);
    } catch (err) {
      toast.error('Failed to generate paper');
    } finally {
      setGenerating(false);
    }
  };

  const handleStartExam = (paperId, e) => {
    e.stopPropagation();
    navigate(`/exam/${paperId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Model Papers</h1>
          <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>Generate and attempt model test papers</p>
        </div>
        <button
          onClick={generatePaper} disabled={generating}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 shadow-lg shadow-indigo-500/25"
        >
          {generating ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
          {generating ? 'Generating...' : 'Generate New Paper'}
        </button>
      </div>

      {papers.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border dark:border-gray-700 shadow-sm">
          <FileText size={48} className="mx-auto mb-4 opacity-50" style={{ color: 'var(--text-secondary)' }} />
          <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--text-primary)' }}>No Papers Yet</h3>
          <p className="mb-4" style={{ color: 'var(--text-secondary)' }}>Generate your first model paper to start practicing</p>
          <button onClick={generatePaper} disabled={generating}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition shadow-lg shadow-indigo-500/25">
            Generate Your First Paper
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {papers.map((paper, i) => (
            <div
              key={paper.id}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 border dark:border-gray-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group animate-slideUp"
              style={{ animationDelay: `${i * 0.05}s` }}
              onClick={() => navigate(`/exam/${paper.id}`)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <FileText size={20} className="text-indigo-500" />
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                  {paper.attempt_count || 0} attempts
                </span>
              </div>
              <h3 className="font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>{paper.title}</h3>
              <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-secondary)' }}>
                <span className="flex items-center gap-1"><FileText size={12} /> {paper.question_count} questions</span>
                <span className="flex items-center gap-1"><Clock size={12} /> 120 min</span>
              </div>
              <div className="mt-4 flex gap-2">
                <button onClick={(e) => handleStartExam(paper.id, e)}
                  className="flex-1 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-sm font-medium hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition flex items-center justify-center gap-1.5">
                  <Play size={14} /> Start
                </button>
                {paper.attempt_count > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); /* navigate to results */ }}
                    className="py-2 px-3 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    <BarChart3 size={14} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
