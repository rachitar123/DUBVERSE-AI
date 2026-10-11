import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import {
  Sparkles, Video, Mic, Globe, Zap, ArrowRight, Play, CheckCircle2,
  Shield, Cpu, FileText, Download, Star, ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden glow-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-8 animate-bounce">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Introducing DubVerse AI v2.5 • Neural Lip-Sync & Multi-Voice Engine</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-none">
            Transform Any Video into <span className="text-gradient">30+ Global Languages</span> with Neural Voice Cloning
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto font-normal leading-relaxed">
            The enterprise-ready AI dubbing platform. Extract audio, generate lip-synced voice clones, auto-reconcile transcripts, and publish global video content in seconds.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-cyan-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] transition-all duration-200"
            >
              Start Free Dubbing Trial
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold glass-card text-slate-200 hover:text-white hover:bg-slate-800/80 transition-all duration-200"
            >
              <Play className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              Watch Live Demo
            </Link>
          </div>

          {/* Hero Video Mockup Preview */}
          <div className="mt-16 max-w-5xl mx-auto rounded-3xl p-3 glass-card border border-indigo-500/20 shadow-2xl relative group">
            <div className="relative rounded-2xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-800">
              <img
                src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&auto=format&fit=crop&q=80"
                alt="DubVerse AI Video Dubbing Interface Preview"
                className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent opacity-80" />

              <div className="absolute text-center z-10 px-4">
                <div className="w-20 h-20 rounded-full bg-indigo-600/90 text-white flex items-center justify-center mx-auto shadow-2xl cursor-pointer hover:scale-110 transition-transform">
                  <Play className="w-8 h-8 fill-white ml-1" />
                </div>
                <h3 className="text-xl font-bold text-white mt-4">Hindi-to-English Neural Voice Sync Demo</h3>
                <p className="text-xs text-slate-300 mt-1">Automatic timing adjustment • 4K video preservation • Speaker diarization</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="py-24 border-t border-slate-800/60 bg-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Built for Creators & Enterprise</h2>
            <p className="text-3xl sm:text-4xl font-black text-white mt-3">
              Everything You Need for Commercial Video Localization
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="p-4 bg-indigo-500/10 rounded-2xl text-indigo-400 w-fit mb-6">
                <Mic className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Neural Voice Cloning</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Replicate speech timbre, accents, and emotional cadence across Hindi, English, Spanish, Japanese, and more.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="p-4 bg-cyan-500/10 rounded-2xl text-cyan-400 w-fit mb-6">
                <Zap className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Auto FFmpeg Video Sync</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Smart clip stretching automatically aligns video playback speed with translated audio durations.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-800 hover:border-indigo-500/40 transition-all">
              <div className="p-4 bg-purple-500/10 rounded-2xl text-purple-400 w-fit mb-6">
                <Globe className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">GPT-4 Hybrid Proofreader</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Merges local Whisper transcripts with YouTube auto-captions for 99.8% textual accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Flexible Plans</h2>
            <p className="text-3xl sm:text-4xl font-black text-white mt-3">Simple, Transparent Pricing</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <p className="text-xs text-slate-400 mt-1">For independent creators</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$29</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 60 Dubbing Minutes / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 10 Target Languages</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 1080p Video Downloads</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 rounded-xl text-xs font-bold glass-card text-center hover:bg-slate-800 transition-colors">
                Get Starter
              </Link>
            </div>

            {/* Pro Featured */}
            <div className="glass-card p-8 rounded-3xl border-2 border-indigo-500 relative flex flex-col justify-between shadow-2xl shadow-indigo-500/20">
              <span className="absolute -top-3.5 right-6 px-3 py-1 bg-indigo-600 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-full shadow-lg">
                Most Popular
              </span>
              <div>
                <h3 className="text-lg font-bold text-white">Pro Creator</h3>
                <p className="text-xs text-slate-400 mt-1">For agency channels & media teams</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$79</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 300 Dubbing Minutes / mo</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Custom Voice Cloning</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4K Ultra HD Export</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Transcript Segment Editor</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white text-center shadow-lg transition-colors">
                Start Pro Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="glass-card p-8 rounded-3xl border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Enterprise</h3>
                <p className="text-xs text-slate-400 mt-1">For high volume studios</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-white">$249</span>
                  <span className="text-slate-400 text-sm">/month</span>
                </div>
                <ul className="mt-8 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Unlimited Minutes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Dedicated Worker Queue</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> API Access & Webhooks</li>
                </ul>
              </div>
              <Link to="/register" className="mt-8 w-full py-3 rounded-xl text-xs font-bold glass-card text-center hover:bg-slate-800 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>© 2026 DubVerse AI Inc. All rights reserved. Portfolio-quality AI SaaS implementation.</p>
      </footer>
    </div>
  );
};
