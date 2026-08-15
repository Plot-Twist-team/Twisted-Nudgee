import { supabase } from '@/lib/supabase';

const AI_ROUTER_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-router`;

export type AIMode =
  | 'chat'
  | 'companion'
  | 'shield'
  | 'report_normalizer'
  | 'insights'
  | 'wellness_tip'
  | 'daily_insight';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AICallParams {
  message?: string;
  dataSummary?: string;
  history?: ChatMessage[];
  mood?: string;
  note?: string;
  stats?: string;
}

interface AIResponse<T = string> {
  ok: boolean;
  mode: AIMode;
  data: T;
  error?: string;
}

export async function callAI<T = string>(mode: AIMode, params: AICallParams): Promise<T> {
  const { data: session } = await supabase.auth.getSession();
  const token = session?.session?.access_token;

  const response = await fetch(AI_ROUTER_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      mode,
      message: params.message,
      dataSummary: params.dataSummary,
      history: params.history,
      mood: params.mood,
      note: params.note,
      stats: params.stats,
    }),
  });

  if (!response.ok) {
    throw new Error(`AI request failed (${response.status})`);
  }

  const json: AIResponse<T> = await response.json();
  if (!json.ok) {
    throw new Error(json.error || 'AI request returned an error');
  }

  return json.data;
}
