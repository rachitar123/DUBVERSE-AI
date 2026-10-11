export interface User {
  id: number;
  email: string;
  full_name: string;
  avatar_url?: string;
  plan_tier: string;
  created_at: string;
}

export interface TranscriptSegment {
  id: number;
  project_id: number;
  segment_index: number;
  start_time: number;
  end_time: number;
  original_text: string;
  translated_text: string;
  speaker: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  source_language: string;
  target_language: string;
  voice_id: string;
  voice_name: string;
  video_filename?: string;
  original_video_url?: string;
  output_video_filename?: string;
  output_audio_filename?: string;
  status: 'QUEUED' | 'EXTRACTING' | 'TRANSCRIBING' | 'TRANSLATING' | 'SYNTHESIZING' | 'SYNCING' | 'COMPLETED' | 'FAILED';
  progress: number;
  current_step: string;
  estimated_time_remaining: number;
  duration_seconds: number;
  segments_count: number;
  error_message?: string;
  created_at: string;
  updated_at: string;
  segments?: TranscriptSegment[];
}

export interface VoiceProfile {
  id: string;
  name: string;
  gender: string;
  language: string;
  accent: string;
  description: string;
  sample_url: string;
  is_cloned: boolean;
}

export interface LanguageOption {
  code: string;
  name: string;
  native: string;
  flag: string;
}

export interface AnalyticsData {
  total_projects: number;
  completed_projects: number;
  processing_projects: number;
  total_minutes_dubbed: number;
  languages_breakdown: Record<string, number>;
  success_rate: number;
  recent_activity: {
    id: number;
    title: string;
    target_language: string;
    status: string;
    progress: number;
    created_at: string;
  }[];
}

export interface UserSettings {
  default_target_lang: string;
  default_voice_id: string;
  auto_sync: string;
  
  has_openai_key: boolean;
  has_gemini_key: boolean;
  has_elevenlabs_key: boolean;
  has_inworld_key: boolean;
  has_deepgram_key: boolean;

  openai_key_masked: string;
  gemini_key_masked: string;
  elevenlabs_key_masked: string;
  inworld_key_masked: string;

  openai_api_key?: string;
  gemini_api_key?: string;
  elevenlabs_api_key?: string;
  inworld_api_key?: string;
  deepgram_api_key?: string;
}
