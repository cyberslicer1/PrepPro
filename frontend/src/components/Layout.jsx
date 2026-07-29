import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import {
  LayoutDashboard, FileText, Play, Mic, User, LogOut,
  Sun, Moon, Menu, X, ChevronRight
} from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/model-papers', icon: FileText, label: 'Model Papers' },
  { to: '/mock-interview', icon: Mic, label: 'Mock Interview' },
  { to: '/profile', icon: User, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggleDark } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 transform transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        flex flex-col border-r
        dark:border-gray-700 dark:bg-gray-900
        bg-white
      `}>
        {/* Logo */}
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">D</span>
            </div>
            <div>
              <h1 className="font-bold text-lg" style={{ color: 'var(--text-primary)' }}>DataPrep</h1>
              <p className="text-xs" style={{ color: 'var(--text-secondary)' }}>Exam Prep Platform</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`
              }
              style={({ isActive }) => ({
                color: isActive ? undefined : 'var(--text-secondary)'
              })}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
              {item.to === '/exam' && (
                <ChevronRight size={16} className="ml-auto" />
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-4 border-t dark:border-gray-700 space-y-3">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
              {user?.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>{user?.name}</p>
              <p className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={toggleDark} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-sm border dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition" style={{ color: 'var(--text-secondary)' }}>
              {dark ? <Sun size={16} /> : <Moon size={16} />}
              {dark ? 'Light' : 'Dark'}
            </button>
            <button onClick={handleLogout} className="flex items-center justify-center px-4 py-2 rounded-xl text-sm border dark:border-gray-700 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="lg:hidden flex items-center justify-between p-4 border-b dark:border-gray-700 bg-white dark:bg-gray-900">
          <button onClick={() => setSidebarOpen(true)} style={{ color: 'var(--text-primary)' }}>
            <Menu size={24} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-sm">D</span>
            </div>
            <span className="font-bold" style={{ color: 'var(--text-primary)' }}>DataPrep</span>
          </div>
          <button onClick={toggleDark} style={{ color: 'var(--text-secondary)' }}>
            {dark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
