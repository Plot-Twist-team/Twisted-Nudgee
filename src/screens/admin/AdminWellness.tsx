import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_CARD, ADMIN_BORDER } from '@/components/AdminLayout';

export function AdminWellness() {
  const [checks, setChecks] = useState<Array<{ mood: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('wellness_checks')
        .select('mood, created_at')
        .order('created_at', { ascending: false })
        .limit(100);
      setChecks(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full"><Loader2 className="h-5 w-5 text-slate-500 animate-spin" /></div>;
  }

  const happy = checks.filter(c => c.mood === 'happy').length;
  const neutral = checks.filter(c => c.mood === 'neutral').length;
  const low = checks.filter(c => c.mood === 'low').length;
  const total = checks.length;
  const wellnessIndex = total > 0 ? Math.round((happy / total) * 100) : 0;

  // Group by day for trend
  const byDay: Record<string, { happy: number; neutral: number; low: number }> = {};
  checks.forEach(c => {
    const day = new Date(c.created_at).toLocaleDateString('en', { weekday: 'short' });
    if (!byDay[day]) byDay[day] = { happy: 0, neutral: 0, low: 0 };
    byDay[day][c.mood as 'happy' | 'neutral' | 'low']++;
  });
  const days = Object.entries(byDay).slice(-7);

  return (
    <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-lg font-bold text-slate-200 mb-0.5">Wellness Overview</h1>
        <p className="text-slate-500 text-xs">Aggregate wellness check-in data across all students.</p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-4">
        <StatCard label="Wellness Index" value={`${wellnessIndex}%`} color="#10b981" />
        <StatCard label="Happy" value={happy} color="#10b981" />
        <StatCard label="Neutral" value={neutral} color="#f59e0b" />
        <StatCard label="Low" value={low} color="#ef4444" />
      </div>

      <div className="rounded-xl p-4" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-pink-400" />
          <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">7-Day Trend</h2>
        </div>
        <div className="flex items-end justify-between gap-2 h-32">
          {days.map(([day, counts]) => {
            const dayTotal = counts.happy + counts.neutral + counts.low;
            return (
              <div key={day} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full flex flex-col-reverse gap-0.5 h-24 justify-start">
                  {dayTotal > 0 && (
                    <>
                      <div style={{ height: `${(counts.happy / dayTotal) * 100}%`, background: '#10b981', minHeight: counts.happy > 0 ? '4px' : 0 }} className="rounded-b" />
                      <div style={{ height: `${(counts.neutral / dayTotal) * 100}%`, background: '#f59e0b', minHeight: counts.neutral > 0 ? '4px' : 0 }} />
                      <div style={{ height: `${(counts.low / dayTotal) * 100}%`, background: '#ef4444', minHeight: counts.low > 0 ? '4px' : 0 }} className="rounded-t" />
                    </>
                  )}
                </div>
                <span className="text-[10px] text-slate-500">{day}</span>
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-4 mt-3">
          <Legend color="#10b981" label="Happy" />
          <Legend color="#f59e0b" label="Neutral" />
          <Legend color="#ef4444" label="Low" />
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl p-3" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
      <p className="text-[10px] text-slate-400 mb-1">{label}</p>
      <p className="text-xl font-bold tabular-nums" style={{ color }}>{value}</p>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-2.5 h-2.5 rounded" style={{ background: color }} />
      <span className="text-[10px] text-slate-400">{label}</span>
    </div>
  );
}
