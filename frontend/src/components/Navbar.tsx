import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Video, Bell, Sparkles, LogOut, Settings, User as UserIcon, Plus } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center gap-8">
          <Link to={user ? "/app/dashboard" : "/"} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
              <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
                <Video className="w-5 h-5 text-indigo-400 group-hover:text-cyan-400 transition-colors" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                DubVerse<span className="text-gradient">AI</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  PRO
                </span>
              </span>
            </div>
          </Link>
        </div>

        {/* Action Items & Profile */}
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link
                to="/app/new-project"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                New Dub Project
              </Link>

              {/* Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors relative"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-cyan-400" />
                </button>

                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl glass-card border border-slate-700/60 shadow-2xl py-3 px-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Notifications</h4>
                      <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-2 py-0.5 rounded-full">2 New</span>
                    </div>
                    <div className="mt-3 space-y-2">
                      <div className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors cursor-pointer">
                        <p className="text-xs font-semibold text-white">Project Dub Complete 🎉</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">AI Keynote Speech - Multilingual Dub is ready for export.</p>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">2 mins ago</span>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-800/40 hover:bg-slate-800/80 transition-colors cursor-pointer">
                        <p className="text-xs font-semibold text-white">Voice Clone Calibrated</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Voice profile "Nishanth Anna" successfully updated.</p>
                        <span className="text-[10px] text-slate-500 mt-1 inline-block">1 hour ago</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <img
                    src={user.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=DubVerse"}
                    alt={user.full_name}
                    className="w-9 h-9 rounded-xl border border-indigo-500/40 object-cover"
                  />
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-white">{user.full_name}</span>
                    <span className="text-[10px] text-indigo-400 font-medium">{user.plan_tier} Plan</span>
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-card border border-slate-700/60 shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-slate-800">
                      <p className="text-xs font-bold text-white">{user.full_name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/app/settings"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
                    >
                      <Settings className="w-4 h-4 text-indigo-400" />
                      Account Settings
                    </Link>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                        navigate('/');
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all duration-200"
              >
                Get Started Free
                <Sparkles className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
