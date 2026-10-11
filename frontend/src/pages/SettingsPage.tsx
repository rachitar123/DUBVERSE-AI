import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsService, voiceService } from '../services/api';
import { UserSettings, VoiceProfile } from '../types';
import { useNotification } from '../context/NotificationContext';
import {
  User, Settings, Key, Mic, Globe, Save, CheckCircle2, AlertCircle, Sparkles, ExternalLink, Eye, EyeOff
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { showToast } = useNotification();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [voices, setVoices] = useState<VoiceProfile[]>([]);
  const [defaultLang, setDefaultLang] = useState('Hindi');
  const [defaultVoice, setDefaultVoice] = useState('wise-cherry-3051__nishanth_anna');
  
  // API Key state
  const [openaiKey, setOpenaiKey] = useState('');
  const [geminiKey, setGeminiKey] = useState('');
  const [elevenlabsKey, setElevenlabsKey] = useState('');
  const [inworldKey, setInworldKey] = useState('');
  
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [settData, voiceList] = await Promise.all([
          analyticsService.getSettings(),
          voiceService.getVoices()
        ]);
        setSettings(settData);
        setVoices(voiceList);
        if (settData) {
          setDefaultLang(settData.default_target_lang || 'Hindi');
          setDefaultVoice(settData.default_voice_id || 'wise-cherry-3051__nishanth_anna');
        }
      } catch (err) {
        console.error('Failed to load user settings:', err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const updated = await analyticsService.updateSettings({
        default_target_lang: defaultLang,
        default_voice_id: defaultVoice,
        openai_api_key: openaiKey || undefined,
        gemini_api_key: geminiKey || undefined,
        elevenlabs_api_key: elevenlabsKey || undefined,
        inworld_api_key: inworldKey || undefined,
      });
      setSettings(updated);
      showToast('Settings Saved', 'Provider API credentials and default voice settings updated.', 'success');
      setOpenaiKey('');
      setGeminiKey('');
      setElevenlabsKey('');
      setInworldKey('');
    } catch (err) {
      showToast('Error', 'Failed to save settings.', 'error');
    }
  };

  const toggleShowKey = (field: string) => {
    setShowKeys((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-4 border-b border-slate-800">
        <h1 className="text-2xl font-black text-white tracking-tight">AI Studio Credentials & Settings</h1>
        <p className="text-xs text-slate-400 mt-1">Configure translation and TTS API keys, fallback priorities, and default voice profiles</p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* User Account Details */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <User className="w-4 h-4 text-indigo-400" /> User Profile & Subscription
          </h3>
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=DubVerse"}
              alt={user?.full_name}
              className="w-16 h-16 rounded-2xl border-2 border-indigo-500/40 object-cover"
            />
            <div>
              <h4 className="text-base font-bold text-white">{user?.full_name}</h4>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 text-xs font-bold border border-indigo-500/20">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                {user?.plan_tier} Plan Active
              </div>
            </div>
          </div>
        </div>

        {/* Translation & LLM Provider API Keys */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Globe className="w-4 h-4 text-cyan-400" /> 1. LLM Translation Providers (OpenAI ↔ Gemini)
            </h3>
            <span className="text-[10px] text-slate-400">Automatic Fallback Active</span>
          </div>

          {/* OpenAI API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                OpenAI API Key (Primary LLM)
                {settings?.has_openai_key ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured ({settings.openai_key_masked})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </label>
              <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Get OpenAI Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys['openai'] ? 'text' : 'password'}
                value={openaiKey}
                onChange={(e) => setOpenaiKey(e.target.value)}
                placeholder={settings?.has_openai_key ? 'Enter new key to replace existing' : 'sk-proj-...'}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('openai')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKeys['openai'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Gemini API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                Google Gemini API Key (Fallback LLM)
                {settings?.has_gemini_key ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured ({settings.gemini_key_masked})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </label>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Get Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys['gemini'] ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder={settings?.has_gemini_key ? 'Enter new key to replace existing' : 'AIzaSy...'}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('gemini')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKeys['gemini'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Speech Synthesis & Voice Cloning Providers */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Mic className="w-4 h-4 text-purple-400" /> 2. Voice Cloning & TTS Providers (ElevenLabs ↔ Inworld)
            </h3>
            <span className="text-[10px] text-slate-400">Automatic Fallback Active</span>
          </div>

          {/* ElevenLabs API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                ElevenLabs API Key (Primary Voice Engine)
                {settings?.has_elevenlabs_key ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured ({settings.elevenlabs_key_masked})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </label>
              <a href="https://elevenlabs.io" target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Get ElevenLabs Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys['elevenlabs'] ? 'text' : 'password'}
                value={elevenlabsKey}
                onChange={(e) => setElevenlabsKey(e.target.value)}
                placeholder={settings?.has_elevenlabs_key ? 'Enter new key to replace existing' : 'xi-api-key-...'}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('elevenlabs')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKeys['elevenlabs'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Inworld API Key */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                Inworld AI Voice API Key (Fallback Voice Engine)
                {settings?.has_inworld_key ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured ({settings.inworld_key_masked})
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Missing
                  </span>
                )}
              </label>
              <a href="https://inworld.ai" target="_blank" rel="noreferrer" className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
                Get Inworld Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div className="relative">
              <input
                type={showKeys['inworld'] ? 'text' : 'password'}
                value={inworldKey}
                onChange={(e) => setInworldKey(e.target.value)}
                placeholder={settings?.has_inworld_key ? 'Enter new key to replace existing' : 'elY4RDlTaj...'}
                className="w-full pl-4 pr-10 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs font-mono placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => toggleShowKey('inworld')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
              >
                {showKeys['inworld'] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Default Voice Selection & Language Settings */}
        <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 border-b border-slate-800 pb-4">
            <Settings className="w-4 h-4 text-cyan-400" /> 3. Default Studio Voice & Language
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Choose Default Language</label>
              <select
                value={defaultLang}
                onChange={(e) => setDefaultLang(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="Hindi">Hindi (हिन्दी)</option>
                <option value="English">English</option>
                <option value="Spanish">Spanish (Español)</option>
                <option value="French">French (Français)</option>
                <option value="German">German (Deutsch)</option>
                <option value="Japanese">Japanese (日本語)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Select Default Voice ID</label>
              <select
                value={defaultVoice}
                onChange={(e) => setDefaultVoice(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-white text-xs focus:outline-none focus:border-indigo-500"
              >
                {voices.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name} ({v.language} {v.gender}) - {v.id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Save Settings Button */}
        <button
          type="submit"
          className="w-full py-4 rounded-2xl text-xs font-bold bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" />
          Save Settings & Provider Credentials
        </button>
      </form>
    </div>
  );
};
