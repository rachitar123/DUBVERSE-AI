import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService, buildMediaUrl } from '../services/api';
import { Project, TranscriptSegment } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { ProgressBar } from '../components/ProgressBar';
import { useNotification } from '../context/NotificationContext';
import {
  Video, Music, Download, RefreshCw, Save, ArrowLeft, Play, Pause,
  FileText, Edit3, AlertTriangle, Volume2
} from 'lucide-react';

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useNotification();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [project, setProject] = useState<Project | null>(null);
  const [segments, setSegments] = useState<TranscriptSegment[]>([]);
  const [editingSegmentId, setEditingSegmentId] = useState<number | null>(null);
  const [editedText, setEditedText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [videoError, setVideoError] = useState<string | null>(null);

  const fetchProject = async () => {
    if (!id) return;
    try {
      const data = await projectService.get(parseInt(id, 10));
      setProject(data);
      if (data.segments) setSegments(data.segments);
    } catch (err: any) {
      if (err.response?.status !== 401) {
        showToast('Error', 'Failed to load project details', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
    const interval = setInterval(fetchProject, 3000);
    return () => clearInterval(interval);
  }, [id]);

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().then(() => setIsPlaying(true)).catch((e) => {
        setIsPlaying(false);
        setVideoError('Could not play video. The dubbed output may not contain a real video source.');
        showToast('Playback Error', 'No playable video file found for this project.', 'error');
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const handleSaveSegment = async (segId: number) => {
    if (!project) return;
    try {
      await projectService.updateSegment(project.id, segId, editedText);
      showToast('Transcript Updated', 'Segment translation saved successfully.', 'success');
      setEditingSegmentId(null);
      fetchProject();
    } catch {
      showToast('Update Failed', 'Could not save transcript edit.', 'error');
    }
  };

  const handleRetry = async () => {
    if (!project) return;
    try {
      await projectService.retry(project.id);
      showToast('Pipeline Re-triggered', 'Dubbing process re-queued.', 'info');
      fetchProject();
    } catch {
      showToast('Retry Failed', 'Could not re-trigger task.', 'error');
    }
  };

  if (loading || !project) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Loading Dubbing Studio Workspace...</p>
        </div>
      </div>
    );
  }

  const isProcessing = ['QUEUED', 'EXTRACTING', 'TRANSCRIBING', 'TRANSLATING', 'SYNTHESIZING', 'SYNCING'].includes(project.status);

  // ── Build authenticated media URLs (token in query param for browser native requests) ──
  const videoUrl = buildMediaUrl(`/api/projects/${project.id}/download/mp4`);
  const audioUrl = buildMediaUrl(`/api/projects/${project.id}/download/mp3`);
  const vttUrl   = buildMediaUrl(`/api/projects/${project.id}/download/vtt`);
  const jsonUrl  = buildMediaUrl(`/api/projects/${project.id}/download/json`);

  const hasRealVideo = project.status === 'COMPLETED' && (project.video_filename || project.output_video_filename);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/app/dashboard')}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black text-white tracking-tight">{project.title}</h1>
              <StatusBadge status={project.status} />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Target: <span className="text-cyan-400 font-semibold">{project.target_language}</span>{' '}
              • Voice Clone: <span className="text-indigo-400 font-semibold">{project.voice_name}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {isProcessing && (
            <button onClick={fetchProject} className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1.5">
              <RefreshCw className="w-4 h-4 animate-spin" /> Syncing
            </button>
          )}
          {project.status === 'FAILED' && (
            <button onClick={handleRetry} className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg">
              <RefreshCw className="w-4 h-4" /> Retry Pipeline
            </button>
          )}
        </div>
      </div>

      {/* Progress Section */}
      {isProcessing && (
        <div className="glass-card p-6 rounded-3xl border border-indigo-500/30 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Pipeline Active</span>
            <span className="text-xs text-slate-400 font-mono">ID #{project.id}</span>
          </div>
          <ProgressBar
            progress={project.progress}
            currentStep={project.current_step}
            estimatedRemainingSeconds={project.estimated_time_remaining}
          />
        </div>
      )}

      {/* Main Studio Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* LEFT: Video Player + Download Center */}
        <div className="lg:col-span-1 space-y-6">

          {/* ── Video Player ── */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" /> Media Preview
            </h3>

            <div className="rounded-2xl overflow-hidden bg-black border border-slate-800 relative aspect-video">
              {hasRealVideo ? (
                <video
                  ref={videoRef}
                  className="w-full h-full object-contain"
                  preload="metadata"
                  onEnded={() => setIsPlaying(false)}
                  onError={() => {
                    setVideoError('Video playback failed. This project may have been processed in simulation mode.');
                    setIsPlaying(false);
                  }}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  {/* Authenticated source URL with ?token= query param */}
                  <source src={videoUrl} type="video/mp4" />
                </video>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                  <img
                    src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=600&auto=format&fit=crop&q=80"
                    alt="Preview"
                    className="w-full h-full object-cover opacity-40"
                  />
                </div>
              )}

              {/* Overlay controls */}
              <div className="absolute inset-0 flex items-center justify-center">
                {videoError ? (
                  <div className="text-center px-4">
                    <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                    <p className="text-xs text-amber-300 font-semibold">No Video Source</p>
                    <p className="text-[10px] text-slate-400 mt-1">Upload a real video file to enable playback</p>
                  </div>
                ) : project.status === 'COMPLETED' && hasRealVideo ? (
                  <button
                    onClick={togglePlayPause}
                    className="w-14 h-14 rounded-full bg-indigo-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-110 hover:bg-indigo-500 transition-all"
                  >
                    {isPlaying
                      ? <Pause className="w-6 h-6 fill-white" />
                      : <Play className="w-6 h-6 fill-white ml-0.5" />
                    }
                  </button>
                ) : (
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-800/80 text-slate-400 flex items-center justify-center mx-auto">
                      <Video className="w-5 h-5" />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {isProcessing ? 'Processing...' : 'Awaiting upload'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Project specs */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Duration</span>
                <span className="font-semibold text-white">{project.duration_seconds || 19.2}s</span>
              </div>
              <div className="flex justify-between">
                <span>Segments</span>
                <span className="font-semibold text-white">{segments.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Status</span>
                <span className={`font-semibold ${project.status === 'COMPLETED' ? 'text-emerald-400' : 'text-indigo-400'}`}>
                  {project.status}
                </span>
              </div>
            </div>
          </div>

          {/* ── Download Center ── */}
          <div className="glass-card p-5 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Download className="w-4 h-4 text-cyan-400" /> Export & Download Center
            </h3>
            <p className="text-[11px] text-slate-400">
              All downloads are authenticated. Links expire when your session ends.
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <a
                href={videoUrl}
                download
                className="flex items-center gap-2 p-3 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold hover:bg-indigo-600 hover:text-white transition-colors"
              >
                <Video className="w-4 h-4" /> MP4 Video
              </a>
              <a
                href={audioUrl}
                download
                className="flex items-center gap-2 p-3 rounded-xl bg-purple-600/20 border border-purple-500/30 text-purple-300 text-xs font-bold hover:bg-purple-600 hover:text-white transition-colors"
              >
                <Volume2 className="w-4 h-4" /> MP3 Audio
              </a>
              <a
                href={vttUrl}
                download
                className="flex items-center gap-2 p-3 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-300 text-xs font-bold hover:bg-cyan-600 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" /> VTT Subs
              </a>
              <a
                href={jsonUrl}
                download
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold hover:bg-slate-700 hover:text-white transition-colors"
              >
                <FileText className="w-4 h-4" /> JSON Data
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT: Transcript Editor */}
        <div className="lg:col-span-2">
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-indigo-400" /> Transcript Segment Editor
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Click the edit icon to correct translations</p>
              </div>
              <span className="text-xs text-indigo-400 font-bold bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                {segments.length} Segments
              </span>
            </div>

            <div className="space-y-4">
              {segments.map((seg) => (
                <div key={seg.id} className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>#{seg.segment_index + 1} · {seg.start_time.toFixed(1)}s — {seg.end_time.toFixed(1)}s</span>
                    <span>{seg.speaker}</span>
                  </div>

                  {/* Original */}
                  <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-300">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">Original</span>
                    {seg.original_text}
                  </div>

                  {/* Translated */}
                  {editingSegmentId === seg.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        rows={2}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-indigo-500 text-xs text-white focus:outline-none"
                      />
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditingSegmentId(null)} className="px-3 py-1 text-xs text-slate-400 hover:text-white">
                          Cancel
                        </button>
                        <button
                          onClick={() => handleSaveSegment(seg.id)}
                          className="px-3 py-1 rounded-lg text-xs font-bold bg-indigo-600 text-white flex items-center gap-1 hover:bg-indigo-500"
                        >
                          <Save className="w-3.5 h-3.5" /> Save
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-4 p-2.5 rounded-xl bg-indigo-950/20 border border-indigo-500/20 text-xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-indigo-400 block mb-0.5">
                          Translated ({project.target_language})
                        </span>
                        <span className="font-medium text-white">{seg.translated_text}</span>
                      </div>
                      <button
                        onClick={() => { setEditingSegmentId(seg.id); setEditedText(seg.translated_text); }}
                        className="p-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors flex-shrink-0"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {segments.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-xs">
                  Transcript segments appear automatically once speech recognition completes.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
