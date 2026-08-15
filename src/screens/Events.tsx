import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, CheckCircle2, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface EventItem {
  id: string;
  title: string;
  description: string;
  location: string;
  event_type: string;
  event_date: string;
  rsvp_count: number;
}

export function EventsScreen() {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const [rsvped, setRsvped] = useState<Set<string>>(new Set());
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('events')
        .select('*')
        .order('event_date', { ascending: true })
        .limit(20);
      if (err) setError(err.message);
      setEvents(data || []);
      setLoading(false);
    })();
  }, []);

  const handleRsvp = async (eventId: string) => {
    setRsvping(eventId);
    const { error: err } = await supabase
      .from('event_rsvps')
      .insert({ event_id: eventId, user_id: user?.id ?? null });
    setRsvping(null);
    if (err) {
      setError(err.message);
    } else {
      setRsvped(prev => new Set(prev).add(eventId));
      setEvents(prev => prev.map(e =>
        e.id === eventId ? { ...e, rsvp_count: e.rsvp_count + 1 } : e
      ));
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
        <h1 className="text-2xl md:text-3xl font-display font-bold text-white mb-1">Upcoming Events</h1>
        <p className="text-white/40 text-sm">Join campus activities and earn influence points.</p>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      {events.length === 0 ? (
        <EmptyState icon={Calendar} text="No events scheduled yet." />
      ) : (
        <div className="space-y-3">
          {events.map((event, i) => {
            const isRsvped = rsvped.has(event.id);
            const date = new Date(event.event_date);
            const isSignature = event.event_type === 'signature';
            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                className="rounded-2xl p-4 glass-card-hover relative overflow-hidden"
                style={{ background: 'rgba(13,34,64,0.6)', border: '1px solid rgba(74,158,255,0.08)' }}
              >
                {isSignature && (
                  <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-bl-lg"
                    style={{ background: 'rgba(242,153,74,0.2)', color: '#ffcb8a' }}>
                    Signature
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0"
                    style={{ background: isSignature ? 'rgba(242,153,74,0.12)' : 'rgba(74,158,255,0.1)' }}>
                    <span className="text-lg font-bold" style={{ color: isSignature ? '#ffcb8a' : '#7ec8ff' }}>{date.getDate()}</span>
                    <span className="text-[10px] uppercase" style={{ color: isSignature ? '#f2994a' : '#4a9eff' }}>
                      {date.toLocaleString('en', { month: 'short' })}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-white truncate">{event.title}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/40">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {event.rsvp_count}</span>
                    </div>
                    {event.description && <p className="text-xs text-white/50 mt-2 line-clamp-2">{event.description}</p>}

                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => !isRsvped && handleRsvp(event.id)}
                      disabled={isRsvped || rsvping === event.id}
                      className={`mt-3 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        isRsvped ? 'text-emerald-400' : 'text-white'
                      }`}
                      style={isRsvped ? { background: 'rgba(16,185,129,0.1)' }
                                     : { background: 'rgba(74,158,255,0.15)' }}
                    >
                      {isRsvped ? (<><CheckCircle2 className="h-3.5 w-3.5" /> RSVPed</>)
                               : rsvping === event.id ? 'RSVPing...'
                               : 'RSVP +1 pt'}
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Calendar; text: string }) {
  return (
    <div className="text-center py-20">
      <Icon className="h-12 w-12 text-white/15 mx-auto mb-4" />
      <p className="text-white/40 text-sm">{text}</p>
    </div>
  );
}
