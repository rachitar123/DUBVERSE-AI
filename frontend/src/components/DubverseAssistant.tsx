import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare, X, Send, Trash2, Bot, User as UserIcon,
  Loader2, ChevronDown, FileText, Film,
} from 'lucide-react';
import { api } from '../services/api';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface TranscriptSegmentCtx {
  segment_index: number;
  start_time: number;
  end_time: number;
  original_text: string;
  translated_text?: string;
  speaker?: string;
}

interface ProjectContext {
  project_id?: number;
  project_title?: string;
  source_language?: string;
  target_language?: string;
  voice_name?: string;
  status?: string;
  processing_stage?: string;
  progress?: number;
  error_message?: string;
  duration_seconds?: number;
  segments_count?: number;
  transcript_segments?: TranscriptSegmentCtx[];
}

// ── Welcome messages ───────────────────────────────────────────────────────────

const WELCOME_DEFAULT: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your DubVerse AI Assistant 👋\n\nAsk me anything about your video, or get help with the dubbing process.\n\nI can summarize videos, answer questions about their content, explain the dubbing pipeline, troubleshoot errors, and more.",
  timestamp: new Date(),
};

const WELCOME_WITH_TRANSCRIPT: Message = {
  id: 'welcome',
  role: 'assistant',
  content:
    "Hi! I'm your DubVerse AI Assistant 👋\n\nI can see this project has a transcript — ask me anything about your video! I can summarize it, identify main points, answer questions about what was said, and help with your dubbing workflow.\n\n**Ask anything about your video.**",
  timestamp: new Date(),
};

// ── Suggestion sets ────────────────────────────────────────────────────────────

const SUGGESTIONS_WITH_TRANSCRIPT = [
  { label: '🎬 Summarize this video', message: 'Please summarize this video for me.' },
  { label: '📌 What are the main points?', message: 'What are the main points discussed in this video?' },
  { label: '💡 What is being discussed?', message: 'What topic or concept is being discussed in this video?' },
  { label: '🗣️ What did the speaker say?', message: 'What did the speaker talk about in detail?' },
  { label: '❓ Ask about the video', message: 'What can I ask you about this video?' },
];

const SUGGESTIONS_DEFAULT = [
  { label: '📋 Explain my project', message: 'Can you explain my current project and its status?' },
  { label: '🔄 Dubbing pipeline', message: 'Can you explain the full dubbing pipeline step by step?' },
  { label: '❌ Why did it fail?', message: 'Why did my project fail and what should I do?' },
  { label: '🎙️ Help choose a voice', message: 'Help me choose the right voice for my target language.' },
  { label: '⚙️ What does transcription do?', message: 'What does the transcription stage do?' },
];

// ── Helper ─────────────────────────────────────────────────────────────────────

const uid = () => Math.random().toString(36).slice(2, 9);

// ── TypingIndicator ───────────────────────────────────────────────────────────

const TypingIndicator: React.FC = () => (
  <div className="flex items-end gap-2 mb-4">
    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center flex-shrink-0 shadow-lg">
      <Bot className="w-4 h-4 text-white" />
    </div>
    <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-slate-800/80 border border-slate-700/60 flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  </div>
);

// ── MessageBubble ─────────────────────────────────────────────────────────────

const MessageBubble: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';

  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? 'bg-indigo-600'
            : 'bg-gradient-to-tr from-indigo-600 to-cyan-500'
        }`}
      >
        {isUser ? <UserIcon className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
      </div>

      <div
        className={`max-w-[80%] px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isUser
            ? 'bg-indigo-600 text-white rounded-2xl rounded-br-sm shadow-lg shadow-indigo-600/20'
            : 'bg-slate-800/80 text-slate-100 rounded-2xl rounded-bl-sm border border-slate-700/60'
        }`}
      >
        {message.content}
      </div>
    </div>
  );
};

// ── Main DubverseAssistant Component ──────────────────────────────────────────

export const DubverseAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([WELCOME_DEFAULT]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingContext, setIsFetchingContext] = useState(false);
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [lastProjectId, setLastProjectId] = useState<number | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const hasTranscript = Boolean(
    projectContext?.transcript_segments && projectContext.transcript_segments.length > 0
  );

  // ── Compute suggestions based on whether transcript is available ──────────

  const currentSuggestions = hasTranscript
    ? SUGGESTIONS_WITH_TRANSCRIPT
    : SUGGESTIONS_DEFAULT;

  // ── Extract project ID from URL ────────────────────────────────────────────

  const projectIdFromUrl = useCallback((): number | null => {
    const match = location.pathname.match(/\/app\/project\/(\d+)/);
    return match ? parseInt(match[1], 10) : null;
  }, [location.pathname]);

  // ── Fetch project context (including transcript segments) on panel open ───

  useEffect(() => {
    if (!isOpen) return;

    const projectId = projectIdFromUrl();

    if (!projectId) {
      setProjectContext(null);
      setLastProjectId(null);
      return;
    }

    // Don't re-fetch if we already have this project's context
    if (lastProjectId === projectId && projectContext?.project_id === projectId) return;

    setIsFetchingContext(true);
    api.get(`/projects/${projectId}`)
      .then((res) => {
        const p = res.data;

        // Map existing transcript segments — NO new transcription, just reading
        const segments: TranscriptSegmentCtx[] = (p.segments || []).map((s: any) => ({
          segment_index: s.segment_index,
          start_time: s.start_time,
          end_time: s.end_time,
          original_text: s.original_text,
          translated_text: s.translated_text || undefined,
          speaker: s.speaker || undefined,
        }));

        const ctx: ProjectContext = {
          project_id: p.id,
          project_title: p.title,
          source_language: p.source_language,
          target_language: p.target_language,
          voice_name: p.voice_name,
          status: p.status,
          processing_stage: p.current_step,
          progress: p.progress,
          error_message: p.error_message || undefined,
          duration_seconds: p.duration_seconds || undefined,
          segments_count: p.segments_count || undefined,
          transcript_segments: segments.length > 0 ? segments : undefined,
        };

        setProjectContext(ctx);
        setLastProjectId(projectId);

        // If this is a new project (switching projects), reset chat with
        // appropriate welcome message but keep it only if chat is still fresh
        if (lastProjectId !== null && lastProjectId !== projectId) {
          setMessages([segments.length > 0 ? WELCOME_WITH_TRANSCRIPT : WELCOME_DEFAULT]);
        } else if (messages.length === 1 && messages[0].id === 'welcome') {
          // Still on initial welcome — upgrade it if transcript is now available
          setMessages([segments.length > 0 ? WELCOME_WITH_TRANSCRIPT : WELCOME_DEFAULT]);
        }
      })
      .catch(() => {
        setProjectContext(null);
      })
      .finally(() => {
        setIsFetchingContext(false);
      });
  }, [isOpen, location.pathname]);

  // Clear context when leaving a project page
  useEffect(() => {
    const projectId = projectIdFromUrl();
    if (!projectId && projectContext) {
      setProjectContext(null);
      setLastProjectId(null);
    }
  }, [location.pathname]);

  // ── Auto-scroll ────────────────────────────────────────────────────────────

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 80);
  };

  // ── Focus input when panel opens ──────────────────────────────────────────

  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  // ── Send message ──────────────────────────────────────────────────────────

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMsg: Message = {
      id: uid(),
      role: 'user',
      content: trimmed,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setIsLoading(true);

    // Build conversation history — exclude welcome msg, keep last 20 messages (10 turns)
    const history = updatedMessages
      .filter((m) => m.id !== 'welcome')
      .slice(-20)
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await api.post('/chatbot/message', {
        message: trimmed,
        conversation_history: history.slice(0, -1), // exclude the message just sent
        project_context: projectContext || undefined,
      });

      const assistantMsg: Message = {
        id: uid(),
        role: 'assistant',
        content: res.data.response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid(),
          role: 'assistant',
          content: "Sorry, I couldn't process that request right now. Please try again in a moment.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // ── Keyboard ──────────────────────────────────────────────────────────────

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  // ── Clear chat ────────────────────────────────────────────────────────────

  const clearChat = () => {
    setMessages([hasTranscript ? WELCOME_WITH_TRANSCRIPT : WELCOME_DEFAULT]);
    setInputValue('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Floating Toggle Button ─────────────────────────────────────────── */}
      <button
        id="dubverse-chatbot-toggle"
        aria-label="Open DubVerse AI Assistant"
        onClick={() => setIsOpen((v) => !v)}
        className={`
          fixed bottom-6 right-6 z-50
          w-14 h-14 rounded-2xl
          flex items-center justify-center
          shadow-2xl shadow-indigo-600/40
          transition-all duration-300
          focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-[#090d16]
          ${isOpen
            ? 'bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700'
            : 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 text-white hover:scale-110 hover:shadow-indigo-500/60'
          }
        `}
      >
        {isOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-6 h-6" />}
        {!isOpen && (
          <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#090d16]">
            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-75" />
          </span>
        )}
      </button>

      {/* ── Chat Panel ────────────────────────────────────────────────────── */}
      <div
        id="dubverse-chatbot-panel"
        role="dialog"
        aria-label="DubVerse AI Assistant chat panel"
        aria-modal="true"
        className={`
          fixed bottom-24 right-6 z-50
          w-[calc(100vw-3rem)] sm:w-[420px]
          h-[calc(100vh-8rem)] sm:h-[600px]
          flex flex-col
          rounded-3xl overflow-hidden
          border border-slate-700/60
          shadow-2xl shadow-black/60
          transition-all duration-300 origin-bottom-right
          ${isOpen
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
          }
        `}
        style={{
          background: 'rgba(9, 13, 22, 0.97)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
      >
        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-600/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-white tracking-tight leading-tight">
                DubVerse AI Assistant
              </p>
              <p className="text-[11px] text-slate-400 leading-tight">
                {hasTranscript ? 'Video-aware · Ask anything about your video' : 'Your intelligent dubbing assistant'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Online badge */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Online</span>
            </div>
            {/* Clear */}
            <button
              onClick={clearChat}
              aria-label="Clear chat history"
              title="Clear chat"
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat panel"
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Context / transcript badge ───────────────────────────────────── */}
        {isFetchingContext && (
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
            <Loader2 className="w-3 h-3 text-indigo-400 animate-spin" />
            <p className="text-[11px] text-slate-400">Loading video context…</p>
          </div>
        )}

        {!isFetchingContext && projectContext?.project_title && (
          <div
            className={`px-4 py-2 border-b flex items-center gap-2 flex-shrink-0 ${
              hasTranscript
                ? 'bg-emerald-950/30 border-emerald-500/20'
                : 'bg-indigo-950/40 border-indigo-500/20'
            }`}
          >
            {hasTranscript ? (
              <Film className="w-3 h-3 text-emerald-400 flex-shrink-0" />
            ) : (
              <FileText className="w-3 h-3 text-indigo-400 flex-shrink-0" />
            )}
            <p className={`text-[11px] font-medium truncate ${hasTranscript ? 'text-emerald-300' : 'text-indigo-300'}`}>
              {hasTranscript ? (
                <>
                  <span className="font-bold">{projectContext.project_title}</span>
                  <span className="text-slate-400 ml-1.5">
                    · {projectContext.transcript_segments!.length} segments loaded
                  </span>
                </>
              ) : (
                <>
                  Context: <span className="font-bold">{projectContext.project_title}</span>
                  {projectContext.status && (
                    <span className="ml-1.5 text-slate-400">· {projectContext.status}</span>
                  )}
                </>
              )}
            </p>
          </div>
        )}

        {/* ── Messages ────────────────────────────────────────────────────── */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto px-4 pt-4 pb-2 scroll-smooth"
          style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(99,102,241,0.3) transparent' }}
        >
          {messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))}

          {isLoading && <TypingIndicator />}

          {/* Suggestion chips — only shown on the initial welcome state */}
          {messages.length === 1 && !isLoading && (
            <div className="mt-2 mb-4 flex flex-col gap-2">
              {hasTranscript && (
                <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold px-1 mb-1">
                  📹 Ask about this video
                </p>
              )}
              {currentSuggestions.map((s) => (
                <button
                  key={s.label}
                  onClick={() => sendMessage(s.message)}
                  className="
                    w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-medium
                    bg-slate-800/60 hover:bg-indigo-600/20
                    border border-slate-700/60 hover:border-indigo-500/40
                    text-slate-300 hover:text-indigo-200
                    transition-all duration-200
                  "
                >
                  {s.label}
                </button>
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Scroll-to-bottom */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            aria-label="Scroll to latest message"
            className="absolute bottom-20 right-4 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-lg hover:bg-indigo-500 transition-colors z-10"
          >
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {/* ── Footer / Input ───────────────────────────────────────────────── */}
        <div className="px-4 py-3 border-t border-slate-800 flex-shrink-0">
          <div className="flex items-end gap-2 p-1.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 focus-within:border-indigo-500/50 transition-colors">
            <textarea
              ref={inputRef}
              id="dubverse-chatbot-input"
              aria-label="Type your message to DubVerse AI Assistant"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                hasTranscript
                  ? 'Ask anything about this video…'
                  : 'Ask me about your dubbing project…'
              }
              rows={1}
              disabled={isLoading}
              className="
                flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500
                resize-none outline-none px-2 py-1.5 max-h-28
                disabled:opacity-50
              "
              style={{ lineHeight: '1.5' }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = 'auto';
                el.style.height = Math.min(el.scrollHeight, 112) + 'px';
              }}
            />
            <button
              id="dubverse-chatbot-send"
              aria-label="Send message"
              onClick={() => sendMessage(inputValue)}
              disabled={isLoading || !inputValue.trim()}
              className="
                flex-shrink-0 w-9 h-9 rounded-xl
                flex items-center justify-center
                bg-indigo-600 hover:bg-indigo-500
                disabled:opacity-40 disabled:cursor-not-allowed
                text-white transition-all duration-200
                hover:scale-105 active:scale-95
                focus:outline-none focus:ring-2 focus:ring-indigo-400
              "
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-[10px] text-slate-600 text-center mt-1.5">
            Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </>
  );
};
