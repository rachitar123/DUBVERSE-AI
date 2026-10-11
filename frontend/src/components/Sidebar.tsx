import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, History, Settings, Mic, HelpCircle, ShieldCheck } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/app/new-project', label: 'New Dubbing', icon: PlusCircle },
    { to: '/app/history', label: 'Projects History', icon: History },
    { to: '/app/settings', label: 'Settings & Voice Clones', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#090d16]/60 backdrop-blur-md hidden md:flex flex-col justify-between p-4 min-h-[calc(100vh-4rem)]">
      <div className="space-y-6">
        <div className="px-3 py-2">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-3">Main Navigation</p>
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Studio Capacity Card */}
        <div className="px-3">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-900/40 via-purple-900/20 to-slate-900 border border-indigo-500/20 relative overflow-hidden">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-white">Voice Cloning Engine</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
              100% neural precision voice preservation active.
            </p>
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-indigo-500 h-full w-[82%]" />
            </div>
            <span className="text-[10px] text-slate-400">820 / 1,000 dubbing mins used</span>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-800/80 space-y-2">
        <div className="flex items-center gap-2 text-slate-400 text-xs hover:text-slate-200 cursor-pointer transition-colors">
          <HelpCircle className="w-4 h-4" />
          <span>Documentation & API</span>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs hover:text-slate-200 cursor-pointer transition-colors">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>SOC2 & Enterprise Compliant</span>
        </div>
      </div>
    </aside>
  );
};
