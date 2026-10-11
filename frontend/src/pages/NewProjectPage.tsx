import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectService, voiceService } from '../services/api';
import { LanguageOption, VoiceProfile } from '../types';
import { useNotification } from '../context/NotificationContext';
import {
  UploadCloud, Youtube, Mic, Globe, Sparkles, Check, ArrowRight, Video
} from 'lucide-react';

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useNotification();

  const [activeTab, setActiveTab] = useState<'upload' | 'youtube'>('upload');
  const [title, setTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedLang, setSelectedLang] = useState('Hindi');
  const [selectedVoice, setSelectedVoice] = useState('wise-cherry-3051__nishanth_anna');

  const [languages, setLanguages] = useState<LanguageOption[]>([]);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [langList, voiceList] = await Promise.all([
          voiceService.getLanguages(),
          voiceService.getVoices()
        ]);
        setLanguages(langList);
        setVoices(voiceList);
      } catch (err) {
        console.error('Failed to load voices or languages:', err);
      }
    };
    loadOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast('Validation Error', 'Please enter a project title', 'error');
      return;
    }

    const currentVoice = voices.find((v) => v.id === selectedVoice);
    const voiceName = currentVoice ? `${currentVoice.name} (${currentVoice.language} ${currentVoice.gender})` : 'Voice Clone';

    setLoading(true);
    try {
      let createdProject;
      if (activeTab === 'upload') {
        if (!selectedFile) {
          showToast('Validation Error', 'Please select a video file to upload', 'error');
          setLoading(false);
          return;
        }
        const formData = new FormData();
        formData.append('title', title);
        formData.append('target_language', selectedLang);
        formData.append('voice_id', selectedVoice);
        formData.append('voice_name', voiceName);
        formData.append('file', selectedFile);
        createdProject = await projectService.upload(formData);
      } else {
        if (!youtubeUrl.trim()) {
          showToast('Validation Error', 'Please enter a valid YouTube URL', 'error');
          setLoading(false);
          return;
        }
        createdProject = await projectService.create({
          title,
          target_language: selectedLang,
          voice_id: selectedVoice,
          voice_name: voiceName,
          youtube_url: youtubeUrl
        });
      }

      showToast('Project Queued', 'Your video has been added to the dubbing task queue.', 'success');
      navigate(`/app/project/${createdProject.id}`);
    } catch (err: any) {
      showToast('Submission Failed', err.response?.data?.detail || 'Failed to submit dubbing project', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Create New AI Dubbing Project</h1>
        <p className="text-xs text-slate-400 mt-1">Upload video or paste YouTube URL to initiate automated neural translation & voice cloning</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Input Media Source */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Video className="w-4 h-4 text-indigo-400" /> 1. Select Media Input Source
            </h3>
            <div className="flex bg-slate-900/80 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'upload' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                Upload Video File
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('youtube')}
                className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === 'youtube' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                }`}
              >
                YouTube URL
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Project Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Hindi Tech Keynote Dub 2026"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {activeTab === 'upload' ? (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Video Upload (.MP4, .MOV, .MKV)</label>
              <div className="border-2 border-dashed border-slate-700 hover:border-indigo-500/50 rounded-2xl p-8 text-center bg-slate-900/40 cursor-pointer transition-colors relative">
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedFile(e.target.files[0]);
                      if (!title) setTitle(e.target.files[0].name.replace(/\.[^/.]+$/, ""));
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <UploadCloud className="w-10 h-10 text-indigo-400 mx-auto mb-3" />
                {selectedFile ? (
                  <div>
                    <p className="text-sm font-bold text-white">{selectedFile.name}</p>
                    <p className="text-xs text-emerald-400 mt-1">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • Ready for processing</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Drag & drop your video file here or click to browse</p>
                    <p className="text-[11px] text-slate-500 mt-1">Supports HD/4K videos up to 500MB</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">YouTube Video URL</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-rose-500">
                  <Youtube className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=Im5BXp8xA0c"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Step 2: Language & Voice Clone Selection */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <Globe className="w-4 h-4 text-cyan-400" /> 2. Target Language & Neural Voice Clone
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Language Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Target Translation Language</label>
              <div className="grid grid-cols-2 gap-2.5">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLang(lang.name)}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                      selectedLang === lang.name
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-bold">{lang.name}</p>
                      <p className="text-[10px] text-slate-500">{lang.native}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Clone Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Voice Clone Profile</label>
              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedVoice === voice.id
                        ? 'border-indigo-500 bg-indigo-600/20 text-white shadow-md'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mic className="w-4 h-4 text-indigo-400" />
                        <span className="font-bold text-white">{voice.name}</span>
                        {voice.is_cloned && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                            CLONED
                          </span>
                        )}
                      </div>
                      {selectedVoice === voice.id && <Check className="w-4 h-4 text-emerald-400" />}
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{voice.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            'Submitting Dubbing Pipeline...'
          ) : (
            <>
              Launch AI Dubbing Process
              <Sparkles className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
