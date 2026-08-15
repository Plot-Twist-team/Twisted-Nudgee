import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { callAI } from '@/lib/ai';

const MOODS = [
  { value: 'happy',  label: 'Happy',  emoji: '😄', color: '#10b981' },
  { value: 'neutral', label: 'Neutral', emoji: '😐', color: '#f59e0b' },
  { value: 'low',    label: 'Low',    emoji: '😔', color: '#ef4444' },
];

export function WellnessScreen() {
  const { user } = useAuth();
  const [mood, setMood] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedMood, setSubmittedMood] = useState('');
  const [submittedNote, setSubmittedNote] = useState('');
  const [aiTip, setAiTip] = useState('');
  const [tipLoading, setTipLoading] = useState(false);
  const [error, setError] = useState('');
  const [recentChecks, setRecentChecks] = useState<Array<{ mood: string; created_at: string }>>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from('wellness_checks')
        .select('mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);
      setRecentChecks(data || []);
      setLoadingHistory(false);
    })();
  }, [user]);

  const handleSubmit = async () => {
    if (!mood || !user) { setError('Please select a mood.'); return; }
    setSubmitting(true); setError('');
    const { error: err } = await supabase
      .from('wellness_checks')
      .insert({ mood, note: note.trim(), user_id: user.id });
    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      const savedMood = mood;
      const savedNote = note.trim();
      setSubmitted(true);
      setMood(''); setNote('');
      setSubmittedMood(savedMood);
      setSubmittedNote(savedNote);
      setTipLoading(true);
      callAI<string>('wellness_tip', { mood: savedMood, note: savedNote })
        .then(setAiTip)
        .catch(() => setAiTip(''))
        .finally(() => setTipLoading(false));
      const { data } = await supabase
        .from('wellness_checks')
        .select('mood, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(7);
      setRecentChecks(data || []);
    }
  };

  if (submitted) {
    return (
      <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(236,72,153,0.15)' }}>
            <CheckCircle2 className="h-8 w-8 text-pink-400" />
          </div>
          <h2 className="text-xl font-display font-bold text-white mb-2">Check-in Complete</h2>
          <p className="text-white/50 text-sm mb-4 max-w-sm">
            Thank you for checking in. You earned 2 influence points. Remember, it's okay to not be okay.
          </p>

          {/* AI Tip from TWIST */}
          <div className="w-full max-w-sm mb-6">
            {tipLoading ? (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm text-white/50"
                style={{ background: 'rgba(242,153,74,0.08)', border: '1px solid rgba(242,153,74,0.15)' }}>
                <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                TWIST is reflecting on your mood...
              </div>
            ) : aiTip ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl text-sm text-white/80 text-left leading-relaxed"
                style={{ background: 'rgba(242,153,74,0.08)', border: '1px solid rgba(242,153,74,0.15)' }}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-wider font-medium text-amber-400">TWIST says</span>
                </div>
                {aiTip}
              </motion.div>
            ) : null}
          </div>

          <button onClick={() => { setSubmitted(false); setAiTip(''); }}
            className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
            style={{ background: 'rgba(236,72,153,0.15)', color: '#f9a8d4' }}>
            Check In Again
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Wellness Check-in</h1>
        <p className="text-white/40 text-sm">How are you feeling today? Take a moment to reflect.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 space-y-5"
        style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.1)' }}
      >
        <div>
          <label className="flex items-center gap-1.5 text-sm text-white/70 mb-3">
            <Heart className="h-4 w-4 text-pink-400" /> How are you feeling?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {MOODS.map((m) => (
              <button key={m.value} onClick={() => setMood(m.value)}
                className={`flex flex-col items-center gap-1.5 py-4 rounded-xl transition-all ${
                  mood === m.value ? 'scale-105' : 'opacity-60 hover:opacity-100'
                }`}
                style={mood === m.value ? { background: `${m.color}20`, border: `1px solid ${m.color}40` }
                                       : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}>
                <span className="text-3xl">{m.emoji}</span>
                <span className="text-xs text-white/70 font-medium">{m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm text-white/70 mb-2 block">Notes (optional)</label>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3}
            placeholder="What's on your mind?"
            className="w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,158,255,0.1)' }} />
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button onClick={handleSubmit} disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ec4899, #f9a8d4)', color: '#fff' }}>
          {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving...</> : 'Submit Check-in'}
        </button>
      </motion.div>

      {/* Recent check-ins history */}
      {!loadingHistory && recentChecks.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="mt-6"
        >
          <h2 className="text-sm font-display font-semibold text-white/70 mb-3">Recent Check-ins</h2>
          <div className="flex gap-2 flex-wrap">
            {recentChecks.map((check, i) => {
              const moodData = MOODS.find(m => m.value === check.mood);
              return (
                <div key={i} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                  style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <span className="text-lg">{moodData?.emoji || '😐'}</span>
                  <span className="text-white/50">{new Date(check.created_at).toLocaleDateString('en', { weekday: 'short', day: 'numeric' })}</span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
