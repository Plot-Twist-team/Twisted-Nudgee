import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FileWarning, Heart, Calendar, Users, Gift, TrendingUp, Activity } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { ADMIN_CARD, ADMIN_BORDER } from '@/components/AdminLayout';

interface Metrics {
  totalReports: number;
  totalWellness: number;
  totalEvents: number;
  totalClubs: number;
  totalRewards: number;
  totalStudents: number;
  wellnessHappy: number;
  wellnessNeutral: number;
  wellnessLow: number;
  reportsByCategory: Record<string, number>;
}

export function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [recentReports, setRecentReports] = useState<Array<{ hostel: string; category: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [reports, wellness, events, clubs, rewards, profiles, recentR] = await Promise.all([
        supabase.from('pressure_reports').select('category'),
        supabase.from('wellness_checks').select('mood'),
        supabase.from('events').select('id', { count: 'exact', head: true }),
        supabase.from('clubs').select('id', { count: 'exact', head: true }),
        supabase.from('rewards').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('role', 'student'),
        supabase.from('pressure_reports').select('hostel, category, created_at').order('created_at', { ascending: false }).limit(8),
      ]);

      const reportRows = reports.data || [];
      const wellnessRows = wellness.data || [];
      const catCounts: Record<string, number> = {};
      reportRows.forEach(r => { catCounts[r.category] = (catCounts[r.category] || 0) + 1; });

      setMetrics({
        totalReports: reportRows.length,
        totalWellness: wellnessRows.length,
        totalEvents: events.count ?? 0,
        totalClubs: clubs.count ?? 0,
        totalRewards: rewards.count ?? 0,
        totalStudents: profiles.count ?? 0,
        wellnessHappy: wellnessRows.filter(w => w.mood === 'happy').length,
        wellnessNeutral: wellnessRows.filter(w => w.mood === 'neutral').length,
        wellnessLow: wellnessRows.filter(w => w.mood === 'low').length,
        reportsByCategory: catCounts,
      });
      setRecentReports(recentR.data || []);
      setLoading(false);
    })();
  }, []);

  if (loading || !metrics) {
    return <div className="flex items-center justify-center h-full"><div className="text-slate-500 text-sm">Loading metrics...</div></div>;
  }

  const wellnessTotal = metrics.wellnessHappy + metrics.wellnessNeutral + metrics.wellnessLow;
  const wellnessIndex = wellnessTotal > 0
    ? Math.round((metrics.wellnessHappy / wellnessTotal) * 100)
    : 0;
  const pressureIndex = metrics.totalReports > 0
    ? Math.min(metrics.totalReports * 5, 100)
    : 0;

  const statCards = [
    { label: 'Pressure Reports', value: metrics.totalReports, icon: FileWarning, color: '#ef4444' },
    { label: 'Wellness Check-ins', value: metrics.totalWellness, icon: Heart, color: '#ec4899' },
    { label: 'Active Events', value: metrics.totalEvents, icon: Calendar, color: '#4a9eff' },
    { label: 'Active Clubs', value: metrics.totalClubs, icon: Users, color: '#10b981' },
    { label: 'Available Rewards', value: metrics.totalRewards, icon: Gift, color: '#f59e0b' },
    { label: 'Registered Students', value: metrics.totalStudents, icon: TrendingUp, color: '#7ec8ff' },
  ];

  return (
    <div className="px-4 md:px-6 py-5 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
        <h1 className="text-lg font-bold text-slate-200 mb-0.5">Overview</h1>
        <p className="text-slate-500 text-xs">Live campus metrics computed from real data.</p>
      </motion.div>

      {/* Index cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <IndexCard
          label="Wellness Index"
          value={wellnessIndex}
          suffix="%"
          description={`${metrics.wellnessHappy} happy / ${wellnessTotal} total`}
          color="#10b981"
          invert={false}
        />
        <IndexCard
          label="Peer Pressure Index"
          value={pressureIndex}
          suffix=""
          description={`${metrics.totalReports} reports filed (last 7 days)`}
          color="#ef4444"
          invert={true}
        />
      </div>

      {/* Stat grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 mb-5">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl p-3"
              style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4" style={{ color: card.color }} />
                <span className="text-[11px] text-slate-400">{card.label}</span>
              </div>
              <p className="text-xl font-bold text-slate-200 tabular-nums">{card.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Two column: wellness distribution + recent reports */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Wellness distribution */}
        <div className="rounded-xl p-4" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-pink-400" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Wellness Distribution</h2>
          </div>
          <div className="space-y-2">
            <DistributionBar label="Happy" count={metrics.wellnessHappy} total={wellnessTotal} color="#10b981" />
            <DistributionBar label="Neutral" count={metrics.wellnessNeutral} total={wellnessTotal} color="#f59e0b" />
            <DistributionBar label="Low" count={metrics.wellnessLow} total={wellnessTotal} color="#ef4444" />
          </div>
        </div>

        {/* Recent reports */}
        <div className="rounded-xl p-4" style={{ background: ADMIN_CARD, border: `1px solid ${ADMIN_BORDER}` }}>
          <div className="flex items-center gap-2 mb-3">
            <FileWarning className="h-4 w-4 text-red-400" />
            <h2 className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Recent Reports</h2>
          </div>
          {recentReports.length === 0 ? (
            <p className="text-xs text-slate-500 py-4 text-center">No reports filed yet.</p>
          ) : (
            <div className="space-y-1.5">
              {recentReports.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-1.5 px-2 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] px-1.5 py-0.5 rounded font-medium uppercase"
                      style={{ background: 'rgba(239,68,68,0.1)', color: '#fca5a5' }}>
                      {r.category}
                    </span>
                    <span className="text-xs text-slate-400">{r.hostel}</span>
                  </div>
                  <span className="text-[10px] text-slate-600">{new Date(r.created_at).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function IndexCard({ label, value, suffix, description, color, invert }: {
  label: string; value: number; suffix: string; description: string; color: string; invert: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl p-4"
      style={{ background: ADMIN_CARD, border: `1px solid ${color}30` }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{label}</span>
        <span className="text-2xl font-bold tabular-nums" style={{ color }}>{value}{suffix}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${value}%`, background: color }} />
      </div>
      <p className="text-[10px] text-slate-500 mt-2">{description}</p>
    </motion.div>
  );
}

function DistributionBar({ label, count, total, color }: {
  label: string; count: number; total: number; color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-slate-400">{label}</span>
        <span className="text-xs text-slate-300 tabular-nums">{count} ({pct}%)</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}
