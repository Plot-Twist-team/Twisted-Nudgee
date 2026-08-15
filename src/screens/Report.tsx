import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShieldAlert, Send, CheckCircle2, MapPin, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { callAI } from '@/lib/ai';

const CATEGORIES = [
  { value: 'substance',   label: 'Substance Pressure' },
  { value: 'academic',    label: 'Academic Pressure' },
  { value: 'social',      label: 'Social Exclusion' },
  { value: 'bullying',    label: 'Bullying' },
  { value: 'hazing',      label: 'Hazing' },
  { value: 'other',       label: 'Other' },
];

const HOSTELS = ['Block A', 'Block B', 'Block C', 'Block D', 'Off-Campus'];

export function ReportScreen() {
  const { user } = useAuth();
  const [hostel, setHostel] = useState('');
  const [category, setCategory] = useState('substance');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [aiAssisting, setAiAssisting] = useState(false);
  const [aiHelpText, setAiHelpText] = useState('');

  const handleSubmit = async () => {
    if (!hostel || !description.trim()) {
      setError('Please fill in all fields.');
      return;
    }
    setSubmitting(true);
    setError('');
    const { error: err } = await supabase
      .from('pressure_reports')
      .insert({ hostel, category, description: description.trim(), user_id: user?.id ?? null });
    setSubmitting(false);
    if (err) {
      setError(err.message);
    } else {
      setSubmitted(true);
      setHostel(''); setCategory('substance'); setDescription('');
    }
  };

  if (submitted) {
    return (
      <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="flex items-center justify-center w-16 h-16 rounded-2xl mb-4" style={{ background: 'rgba(16,185,129,0.15)' }}>
              <CheckCircle2 className="h-8 w-8 text-emerald-400" />
            </div>
            <h2 className="text-xl font-display font-bold text-white mb-2">Report Submitted</h2>
            <p className="text-white/50 text-sm mb-6 max-w-sm">
              Your report has been received. You earned 5 influence points for speaking up.
              The campus safety team will review it.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95"
              style={{ background: 'rgba(74,158,255,0.15)', color: '#7ec8ff' }}
            >
              File Another Report
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">File a Report</h1>
        <p className="text-white/40 text-sm">Report peer pressure anonymously. Your identity is protected.</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl p-5 space-y-5"
        style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.1)' }}
      >
        {/* Hostel */}
        <div>
          <label className="flex items-center gap-1.5 text-sm text-white/70 mb-2">
            <MapPin className="h-4 w-4 text-red-400" /> Location
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {HOSTELS.map((h) => (
              <button key={h} onClick={() => setHostel(h)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  hostel === h ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
                style={hostel === h ? { background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.3)' }
                                    : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}>
                {h}
              </button>
            ))}
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="flex items-center gap-1.5 text-sm text-white/70 mb-2">
            <ShieldAlert className="h-4 w-4 text-red-400" /> Category
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button key={c.value} onClick={() => setCategory(c.value)}
                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  category === c.value ? 'text-white' : 'text-white/50 hover:text-white/80'
                }`}
                style={category === c.value ? { background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.3)' }
                                           : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}>
                {c.label}
              </button>
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="text-sm text-white/70 mb-2 block">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what happened..."
            className="w-full rounded-xl p-3 text-sm text-white placeholder-white/30 resize-none focus:outline-none transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,158,255,0.1)' }}
          />
        </div>

        {/* AI Assist */}
        <div>
          <button
            onClick={async () => {
              if (aiAssisting) return;
              setAiAssisting(true);
              setAiHelpText('');
              try {
                const prompt = description.trim()
                  ? `A student is filing an anonymous report about "${category}" pressure. They wrote: "${description.trim()}". Help them articulate this better by suggesting a clearer, more detailed version of their report that they can use. Keep it in first person, student voice. Just provide the improved text, no preamble.`
                  : `A student is filing an anonymous report about "${category}" pressure but doesn't know what to write. Give them 2-3 guiding questions they can answer to help structure their report. Keep it short and supportive.`;
                const result = await callAI<string>('companion', { message: prompt });
                setAiHelpText(result);
              } catch {
                setAiHelpText("Sorry, I couldn't help right now. Try writing your report directly.");
              } finally {
                setAiAssisting(false);
              }
            }}
            disabled={aiAssisting}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 disabled:opacity-50"
            style={{ background: 'rgba(242,153,74,0.12)', color: '#f2994a', border: '1px solid rgba(242,153,74,0.2)' }}
          >
            {aiAssisting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            {aiAssisting ? 'TWIST is helping...' : 'Help me write this'}
          </button>
          {aiHelpText && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-2 px-3 py-2.5 rounded-xl text-xs text-white/70 leading-relaxed"
              style={{ background: 'rgba(242,153,74,0.06)', border: '1px solid rgba(242,153,74,0.12)' }}
            >
              {aiHelpText}
            </motion.div>
          )}
        </div>

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-medium transition-all active:scale-95 disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #ef4444, #f87171)', color: '#fff' }}
        >
          {submitting ? 'Submitting...' : (<><Send className="h-4 w-4" /> Submit Report</>)}
        </button>
      </motion.div>
    </div>
  );
}
