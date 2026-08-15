import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Loader2, CheckCircle2, Sparkles, Zap, Award } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Reward {
  id: string;
  title: string;
  description: string;
  points_required: number;
  category: string;
  stock: number | null;
  fulfillment_type: string;
}

interface RewardsProps {
  points: number;
  onRedeem: () => void;
}

export function RewardsScreen({ points, onRedeem }: RewardsProps) {
  const { user } = useAuth();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [redeemed, setRedeemed] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('rewards')
        .select('*')
        .order('points_required', { ascending: true })
        .limit(30);
      if (err) setError(err.message);
      setRewards(data || []);
      setLoading(false);
    })();
  }, []);

  const handleRedeem = async (reward: Reward) => {
    if (points < reward.points_required) return;
    setRedeeming(reward.id);
    const { error: err } = await supabase
      .from('reward_redemptions')
      .insert({ reward_id: reward.id, points_cost: reward.points_required, user_id: user?.id ?? null });
    setRedeeming(null);
    if (err) {
      setError(err.message);
    } else {
      setRedeemed(prev => new Set(prev).add(reward.id));
      onRedeem();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-amber-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">Rewards</h1>
          <p className="text-white/40 text-sm">Redeem your influence points for rewards.</p>
        </div>
        <motion.div
          whileHover={{ scale: 1.03 }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(242,153,74,0.15), rgba(236,72,153,0.08))', border: '1px solid rgba(242,153,74,0.2)' }}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-lg font-bold text-amber-400 tabular-nums">{points}</span>
          <span className="text-xs text-amber-400/60">pts</span>
        </motion.div>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      {rewards.length === 0 ? (
        <div className="text-center py-20">
          <Gift className="h-12 w-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No rewards available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {rewards.map((reward, i) => {
            const isRedeemed = redeemed.has(reward.id);
            const canAfford = points >= reward.points_required;
            const outOfStock = reward.stock !== null && reward.stock <= 0;
            const isDigital = reward.fulfillment_type === 'digital';
            return (
              <motion.div
                key={reward.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-4 relative overflow-hidden glass-card-hover"
                style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
              >
                <div className="absolute top-0 right-0 w-20 h-20 rounded-full opacity-10"
                  style={{ background: 'radial-gradient(circle, rgba(242,153,74,0.4) 0%, transparent 70%)' }} />
                <div className="flex items-start gap-3 mb-2 relative z-10">
                  <div className="flex items-center justify-center w-10 h-10 rounded-lg shrink-0"
                    style={{ background: 'rgba(242,153,74,0.12)' }}>
                    {isDigital ? <Zap className="h-5 w-5 text-amber-400" /> : <Award className="h-5 w-5 text-amber-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{reward.title}</h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-white/40 uppercase tracking-wide">{reward.category}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: isDigital ? 'rgba(74,158,255,0.1)' : 'rgba(16,185,129,0.1)', color: isDigital ? '#7ec8ff' : '#34d399' }}>
                        {isDigital ? 'Digital' : 'Physical'}
                      </span>
                    </div>
                  </div>
                </div>
                {reward.description && <p className="text-xs text-white/50 mb-3 relative z-10">{reward.description}</p>}
                <div className="flex items-center justify-between relative z-10">
                  <span className="flex items-center gap-1 text-sm font-bold text-amber-400">
                    <Sparkles className="h-3.5 w-3.5" /> {reward.points_required} pts
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isRedeemed && canAfford && !outOfStock && handleRedeem(reward)}
                    disabled={isRedeemed || !canAfford || outOfStock || redeeming === reward.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isRedeemed ? 'text-emerald-400' : canAfford && !outOfStock ? 'text-white' : 'text-white/30'
                    }`}
                    style={isRedeemed ? { background: 'rgba(16,185,129,0.1)' }
                           : canAfford && !outOfStock ? { background: 'rgba(242,153,74,0.2)' } : { background: 'rgba(255,255,255,0.03)' }}
                  >
                    {isRedeemed ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Claimed</>)
                             : outOfStock ? 'Out of Stock'
                             : !canAfford ? 'Not Enough'
                             : redeeming === reward.id ? 'Claiming...'
                             : 'Redeem'}
                  </motion.button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
