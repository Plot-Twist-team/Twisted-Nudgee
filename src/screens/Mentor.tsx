import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Loader2, Send, User, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface Mentor {
  id: string;
  name: string;
  expertise: string;
  capacity: number;
}

export function MentorScreen() {
  const { user } = useAuth();
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [assigning, setAssigning] = useState<string | null>(null);
  const [assigned, setAssigned] = useState<Set<string>>(new Set());

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('mentors')
        .select('*')
        .order('name')
        .limit(20);
      if (err) setError(err.message);
      setMentors(data || []);
      setLoading(false);
    })();
  }, []);

  const handleRequest = async (mentorId: string) => {
    setAssigning(mentorId);
    const { error: err } = await supabase
      .from('mentor_assignments')
      .insert({ mentor_id: mentorId, user_id: user?.id ?? null });
    setAssigning(null);
    if (err) {
      setError(err.message);
    } else {
      setAssigned(prev => new Set(prev).add(mentorId));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">Mentors</h1>
        <p className="text-white/40 text-sm">Connect with a mentor for guidance and support.</p>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      {mentors.length === 0 ? (
        <div className="text-center py-20">
          <MessageCircle className="h-12 w-12 text-white/15 mx-auto mb-4" />
          <p className="text-white/40 text-sm">No mentors available yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mentors.map((mentor, i) => {
            const isAssigned = assigned.has(mentor.id);
            return (
              <motion.div
                key={mentor.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-4 flex items-center gap-4 glass-card-hover"
                style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
              >
                <div className="flex items-center justify-center w-12 h-12 rounded-xl shrink-0 relative overflow-hidden"
                  style={{ background: 'linear-gradient(135deg, rgba(74,158,255,0.15), rgba(126,200,255,0.05))' }}>
                  <User className="h-6 w-6 text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-white">{mentor.name}</h3>
                  <p className="text-xs text-white/50 truncate">{mentor.expertise}</p>
                  <p className="text-[10px] text-white/30 mt-0.5">Capacity: {mentor.capacity}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => !isAssigned && handleRequest(mentor.id)}
                  disabled={isAssigned || assigning === mentor.id}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all active:scale-95 shrink-0 ${
                    isAssigned ? 'text-emerald-400' : 'text-white'
                  }`}
                  style={isAssigned ? { background: 'rgba(16,185,129,0.1)' }
                                   : { background: 'rgba(74,158,255,0.15)' }}
                >
                  {isAssigned ? (<><CheckCircle2 className="h-3.5 w-3.5" /> Assigned</>)
                             : assigning === mentor.id ? 'Requesting...'
                             : (<><Send className="h-3.5 w-3.5" /> Request</>)}
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
