import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { BarChart3, LogIn } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
      toast.success('Welcome back!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slideUp">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Welcome Back</h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Sign in to continue your exam prep</p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border dark:border-gray-700 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input
                type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }}
                placeholder="you@example.com" required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }}
                placeholder="Enter your password" required
              />
            </div>
            <button
              type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium hover:from-indigo-600 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25"
            >
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><LogIn size={18} /> Sign In</>}
            </button>
            <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Don't have an account? <Link to="/signup" className="text-indigo-500 hover:text-indigo-600 font-medium">Sign up</Link>
            </p>
          </form>
        </div>
      </div>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 items-center justify-center p-12">
        <div className="text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Master Data Analytics</h2>
          <ul className="space-y-4 text-lg">
            <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full" /> Practice with model papers</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full" /> Track your performance</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full" /> Mock interviews included</li>
            <li className="flex items-center gap-3"><div className="w-2 h-2 bg-white rounded-full" /> 500+ curated questions</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
