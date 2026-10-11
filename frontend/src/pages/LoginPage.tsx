import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Video, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const { showToast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('demo@dubverse.ai');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      showToast('Welcome Back!', 'Logged into DubVerse AI Studio successfully.', 'success');
      navigate('/app/dashboard');
    } catch (err: any) {
      showToast('Login Failed', err.response?.data?.detail || 'Invalid email or password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] flex flex-col justify-center py-12 sm:px-6 lg:px-8 glow-gradient">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-xl shadow-indigo-500/30">
            <div className="w-full h-full bg-[#090d16] rounded-[14px] flex items-center justify-center">
              <Video className="w-6 h-6 text-indigo-400" />
            </div>
          </div>
          <span className="text-2xl font-black text-white tracking-tight">DubVerse<span className="text-gradient">AI</span></span>
        </Link>
        <h2 className="mt-6 text-2xl font-bold text-white tracking-tight">Sign in to your AI Studio</h2>
        <p className="mt-2 text-xs text-slate-400">
          Or{' '}
          <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
            create a new account with free dubbing minutes
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="glass-card py-8 px-6 sm:px-10 rounded-3xl shadow-2xl border border-slate-800">
          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Credentials Box */}
          <div className="mt-6 p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs">
            <div className="flex items-center gap-1.5 text-indigo-400 font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Demo Account Available</span>
            </div>
            <p className="text-slate-300 text-[11px]">Email: <span className="font-mono text-cyan-300">demo@dubverse.ai</span></p>
            <p className="text-slate-300 text-[11px]">Password: <span className="font-mono text-cyan-300">password123</span></p>
          </div>
        </div>
      </div>
    </div>
  );
};
