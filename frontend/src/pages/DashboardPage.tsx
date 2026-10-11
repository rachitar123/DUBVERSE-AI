import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService, analyticsService } from '../services/api';
import { Project, AnalyticsData } from '../types';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { AnalyticsCharts } from '../components/AnalyticsCharts';
import {
  Video, Clock, Layers, CheckCircle2, Plus, ArrowRight, Play, RefreshCw, Eye
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [projList, stats] = await Promise.all([
        projectService.list(),
        analyticsService.getAnalytics()
      ]);
      setProjects(projList);
      setAnalytics(stats);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll every 4 seconds for active task progress updates
    const interval = setInterval(fetchData, 4000);
    return () => clearInterval(interval);
  }, []);

  const activeQueue = projects.filter((p) =>
    ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'SYNTHESIZING', 'SYNCING'].includes(p.status)
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Executive Studio Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">Real-time AI dubbing queue, voice cloning metrics, and project history</p>
        </div>
        <Link
          to="/app/new-project"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-600/30 hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          Create Dubbing Project
        </Link>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Projects"
          value={analytics?.total_projects || projects.length}
          change="+18%"
          icon={<Video className="w-6 h-6" />}
          description="Localization projects created"
        />
        <StatCard
          title="Dubbed Minutes"
          value={`${analytics?.total_minutes_dubbed || 0}m`}
          change="+34%"
          icon={<Clock className="w-6 h-6" />}
          description="High-definition speech generated"
        />
        <StatCard
          title="Active In Queue"
          value={activeQueue.length}
          icon={<Layers className="w-6 h-6" />}
          description="Background task runner pipeline"
        />
        <StatCard
          title="Success Rate"
          value={`${analytics?.success_rate || 100}%`}
          change="+0.8%"
          icon={<CheckCircle2 className="w-6 h-6" />}
          description="FFmpeg retiming & sync precision"
        />
      </div>

      {/* Live Active Queue Processing Monitor */}
      {activeQueue.length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Active Background Processing Queue ({activeQueue.length})</h3>
            </div>
            <button onClick={fetchData} className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <RefreshCw className="w-3.5 h-3.5" /> Sync Status
            </button>
          </div>

          <div className="space-y-4">
            {activeQueue.map((project) => (
              <div key={project.id} className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-white">{project.title}</span>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-semibold border border-indigo-500/20">
                      {project.source_language} → {project.target_language}
                    </span>
                  </div>
                  <StatusBadge status={project.status} />
                </div>
                <ProgressBar
                  progress={project.progress}
                  currentStep={project.current_step}
                  estimatedRemainingSeconds={project.estimated_time_remaining}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recharts Analytics Trends */}
      <AnalyticsCharts languagesBreakdown={analytics?.languages_breakdown} />

      {/* Recent Projects Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Dubbing Projects</h3>
            <p className="text-xs text-slate-400">Manage, edit transcripts, or download media files</p>
          </div>
          <Link to="/app/history" className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
            View All History <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-4 px-6">Project Title</th>
                <th className="py-4 px-6">Language Pair</th>
                <th className="py-4 px-6">Voice Profile</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {projects.slice(0, 5).map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-white">{project.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {project.source_language} → <span className="font-bold text-cyan-400">{project.target_language}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{project.voice_name}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      to={`/app/project/${project.id}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" /> Studio
                    </Link>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500">
                    No dubbing projects found. Create your first project to get started!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
