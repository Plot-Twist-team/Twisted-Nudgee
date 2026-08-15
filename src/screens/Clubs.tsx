import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, Loader2, Star, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Club {
  id: string;
  name: string;
  category: string;
  description: string;
  is_featured: boolean;
  member_count: number;
}

export function ClubsScreen() {
  const { user } = useAuth();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('clubs')
        .select('*')
        .order('is_featured', { ascending: false })
        .order('name', { ascending: true })
        .limit(30);
      if (err) setError(err.message);
      setClubs(data || []);
      setLoading(false);
    })();
  }, []);

  const handleJoin = async (clubId: string) => {
    setJoining(clubId);
    const { error: err } = await supabase
      .from('club_members')
      .insert({ club_id: clubId, user_id: user?.id ?? null });
    setJoining(null);
    if (err) {
      setError(err.message);
    } else {
      setJoined(prev => new Set(prev).add(clubId));
      setClubs(prev => prev.map(c =>
        c.id === clubId ? { ...c, member_count: c.member_count + 1 } : c
      ));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">Clubs</h1>
        <p className="text-white/40 text-sm">Join positive peer groups and earn influence points.</p>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      {clubs.length === 0 ? (
        <div className="text-center py-20">
          <Users className="h-12 w-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No clubs available yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {clubs.map((club, i) => {
            const isJoined = joined.has(club.id);
            return (
              <motion.div
                key={club.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-4 relative overflow-hidden glass-card-hover"
                style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
              >
                {club.is_featured && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg flex items-center gap-1"
                    style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}>
                    <Star className="h-2.5 w-2.5 fill-amber-400" /> Featured
                  </div>
                )}
                <h3 className="text-sm font-semibold text-white mb-2 pr-16">{club.name}</h3>
                <span className="inline-block text-[10px] px-2 py-0.5 rounded-full text-emerald-300/80 mb-2 font-medium"
                  style={{ background: 'rgba(16,185,129,0.1)' }}>
                  {club.category}
                </span>
                {club.description && <p className="text-xs text-white/50 mb-3 line-clamp-2">{club.description}</p>}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-xs text-white/40">
                    <Users className="h-3 w-3" /> {club.member_count} members
                  </span>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => !isJoined && handleJoin(club.id)}
                    disabled={isJoined || joining === club.id}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isJoined ? 'text-emerald-400' : 'text-white'
                    }`}
                    style={isJoined ? { background: 'rgba(16,185,129,0.1)' }
                                   : { background: 'rgba(16,185,129,0.15)' }}
                  >
                    {isJoined ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Joined</>)
                             : joining === club.id ? 'Joining...'
                             : (<><TrendingUp className="h-3.5 w-3.5" /> Join +3 pts</>)}
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
