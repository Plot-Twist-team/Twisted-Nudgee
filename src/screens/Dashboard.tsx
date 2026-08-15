import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import {
  ShieldAlert, Heart, Calendar, Users, Gift,
  TrendingUp, Sparkles, ArrowRight, Loader2, Bot,
} from 'lucide-react';
import type { ScreenId } from '@/components/Layout';
import { callAI } from '@/lib/ai';

interface DashboardProps {
  onNavigate: (id: ScreenId) => void;
  points: number;
  stats: {
    reports: number;
    wellness: number;
    events: number;
    clubs: number;
  };
}

export function Dashboard({ onNavigate, points, stats }: DashboardProps) {
  const [aiInsight, setAiInsight] = useState('');
  const [insightLoading, setInsightLoading] = useState(true);

  useEffect(() => {
    const statsText = `Influence points: ${points}, Reports filed: ${stats.reports}, Wellness checks: ${stats.wellness}, Events RSVPed: ${stats.events}, Clubs joined: ${stats.clubs}.`;
    callAI<string>('daily_insight', { stats: statsText })
      .then(setAiInsight)
      .catch(() => setAiInsight(''))
      .finally(() => setInsightLoading(false));
  }, [points, stats.reports, stats.wellness, stats.events, stats.clubs]);

  const cards: { id: ScreenId; label: string; value: number; icon: typeof ShieldAlert; color: string }[] = [
    { id: 'report',   label: 'Reports Filed',   value: stats.reports,  icon: ShieldAlert, color: '#ef4444' },
    { id: 'wellness', label: 'Wellness Checks', value: stats.wellness, icon: Heart,       color: '#ec4899' },
    { id: 'events',   label: 'Events RSVPed',   value: stats.events,   icon: Calendar,    color: '#f59e0b' },
    { id: 'clubs',    label: 'Clubs Joined',    value: stats.clubs,    icon: Users,       color: '#10b981' },
  ];

  return (
    <div className="px-5 md:px-8 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">Your campus safety overview at a glance.</p>
      </motion.div>

      {/* Points banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="rounded-2xl p-5 mb-6 flex items-center gap-4 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(242,153,74,0.12), rgba(74,158,255,0.08))',
          border: '1px solid rgba(242,153,74,0.15)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, rgba(242,153,74,0.3) 0%, transparent 70%)' }} />
        <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0" style={{ background: 'rgba(242,153,74,0.15)' }}>
          <Sparkles className="h-6 w-6 text-amber-400" />
        </div>
        <div className="flex-1 relative z-10">
          <p className="text-white/50 text-xs">Your Influence Score</p>
          <p className="text-2xl font-bold text-white tabular-nums">{points}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => onNavigate('rewards')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all relative z-10"
          style={{ background: 'rgba(242,153,74,0.2)', color: '#ffcb8a' }}
        >
          Redeem
          <ArrowRight className="h-4 w-4" />
        </motion.button>
      </motion.div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              onClick={() => onNavigate(card.id)}
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 + i * 0.08 }}
              whileHover={{ y: -3 }}
              className="text-left rounded-2xl p-4 transition-all relative overflow-hidden glass-card-hover"
              style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
            >
              <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
                style={{ background: `radial-gradient(circle, ${card.color} 0%, transparent 70%)` }} />
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg" style={{ background: `${card.color}20` }}>
                  <Icon className="h-5 w-5" style={{ color: card.color }} />
                </div>
                <TrendingUp className="h-4 w-4 text-white/20" />
              </div>
              <p className="text-2xl font-bold text-white tabular-nums relative z-10">{card.value}</p>
              <p className="text-white/40 text-xs mt-0.5 relative z-10">{card.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* AI Daily Insight */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="rounded-2xl p-5 mb-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(242,153,74,0.08), rgba(236,72,153,0.05))',
          border: '1px solid rgba(242,153,74,0.12)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div className="absolute top-0 left-0 w-40 h-40 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, rgba(242,153,74,0.4) 0%, transparent 70%)' }} />
        <div className="flex items-center gap-2 mb-3 relative z-10">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg" style={{ background: 'linear-gradient(135deg, #F2994A, #ec4899)' }}>
            <Bot className="h-4 w-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-white/70 uppercase tracking-wider">TWIST Daily Insight</span>
        </div>
        {insightLoading ? (
          <div className="flex items-center gap-2 text-sm text-white/40 relative z-10">
            <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
            Analyzing your activity...
          </div>
        ) : (
          <p className="text-sm text-white/80 leading-relaxed relative z-10">{aiInsight}</p>
        )}
      </motion.div>

      {/* Quick actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
      >
        <h2 className="text-sm font-display font-semibold text-white/70 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <QuickAction label="File a Pressure Report" desc="Report peer pressure anonymously" icon={ShieldAlert} color="#ef4444" onClick={() => onNavigate('report')} />
          <QuickAction label="Log Wellness Check-in" desc="How are you feeling today?" icon={Heart} color="#ec4899" onClick={() => onNavigate('wellness')} />
          <QuickAction label="Browse Upcoming Events" desc="Join campus activities" icon={Calendar} color="#f59e0b" onClick={() => onNavigate('events')} />
          <QuickAction label="Join a Club" desc="Connect with positive peer groups" icon={Users} color="#10b981" onClick={() => onNavigate('clubs')} />
        </div>
      </motion.div>
    </div>
  );
}

function QuickAction({
  label, desc, icon: Icon, color, onClick,
}: {
  label: string; desc: string; icon: typeof ShieldAlert; color: string; onClick: () => void;
}) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="flex items-center gap-3 rounded-xl p-4 text-left transition-all relative overflow-hidden glass-card-hover"
      style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
    >
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10"
        style={{ background: `radial-gradient(circle, ${color} 0%, transparent 70%)` }} />
      <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0" style={{ background: `${color}20` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="min-w-0 relative z-10">
        <p className="text-sm font-medium text-white truncate">{label}</p>
        <p className="text-xs text-white/40 truncate">{desc}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-white/20 ml-auto shrink-0 relative z-10" />
    </motion.button>
  );
}
