import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { projectService } from '../services/api';
import { Project } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { useNotification } from '../context/NotificationContext';
import {
  Video, Search, Filter, Trash2, Eye, Download, Plus, RefreshCw
} from 'lucide-react';

export const ProjectsHistoryPage: React.FC = () => {
  const { showToast } = useNotification();
  const [projects, setProjects] = useState<Project[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const data = await projectService.list(statusFilter, searchTerm);
      setProjects(data);
    } catch (err) {
      console.error('Failed to load project history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [statusFilter, searchTerm]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this dubbing project?')) return;
    try {
      await projectService.delete(id);
      showToast('Deleted', 'Project deleted successfully.', 'info');
      fetchProjects();
    } catch (err) {
      showToast('Error', 'Failed to delete project.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Dubbing Project History</h1>
          <p className="text-xs text-slate-400 mt-1">Complete archive of past dubbing jobs, exported video files, and transcripts</p>
        </div>
        <Link
          to="/app/new-project"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-2xl border border-slate-800">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by title..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['ALL', 'COMPLETED', 'QUEUED', 'FAILED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-slate-900/60 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table */}
      <div className="glass-card rounded-3xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider bg-slate-900/50">
                <th className="py-4 px-6">Project Title</th>
                <th className="py-4 px-6">Language Pair</th>
                <th className="py-4 px-6">Voice Profile</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6">Duration</th>
                <th className="py-4 px-6">Created</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-bold text-white">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
                        <Video className="w-4 h-4" />
                      </div>
                      <span>{project.title}</span>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-300">
                    {project.source_language} → <span className="font-bold text-cyan-400">{project.target_language}</span>
                  </td>
                  <td className="py-4 px-6 text-slate-400">{project.voice_name}</td>
                  <td className="py-4 px-6">
                    <StatusBadge status={project.status} />
                  </td>
                  <td className="py-4 px-6 text-slate-300 font-mono">
                    {project.duration_seconds ? `${project.duration_seconds.toFixed(1)}s` : '19.2s'}
                  </td>
                  <td className="py-4 px-6 text-slate-400">
                    {new Date(project.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/app/project/${project.id}`}
                        className="p-2 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
                        title="Open Studio"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <a
                        href={`/api/projects/${project.id}/download/mp4`}
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white transition-colors"
                        title="Download MP4"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No dubbing projects matching your search/filters.
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
