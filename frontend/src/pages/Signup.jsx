import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { UserPlus, BarChart3 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await signup(name, email, password);
      navigate('/dashboard');
      toast.success('Account created successfully!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 items-center justify-center p-12">
        <div className="text-white max-w-lg">
          <h2 className="text-4xl font-bold mb-6">Start Your Journey</h2>
          <p className="text-lg opacity-90">Join thousands of candidates preparing for data analytics job fitness tests.</p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-slideUp">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BarChart3 className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>Create Account</h1>
            <p className="mt-2" style={{ color: 'var(--text-secondary)' }}>Start your exam preparation</p>
          </div>
          <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border dark:border-gray-700 space-y-5">
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Full Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }} placeholder="John Doe" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }} placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-primary)' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
                style={{ color: 'var(--text-primary)' }} placeholder="Min 6 characters" required minLength={6} />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25">
              {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" /> : <><UserPlus size={18} /> Create Account</>}
            </button>
            <p className="text-center text-sm" style={{ color: 'var(--text-secondary)' }}>
              Already have an account? <Link to="/login" className="text-purple-500 hover:text-purple-600 font-medium">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
