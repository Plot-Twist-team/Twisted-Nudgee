import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2, ExternalLink } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { CommunityCard } from '@/components/CommunityCard';

interface FeedPost {
  id: string;
  type: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = {
  news:        '#4a9eff',
  alert:       '#ef4444',
  update:      '#10b981',
  event:       '#f59e0b',
  tip:         '#ec4899',
  club:        '#10b981',
  competition: '#f2994a',
  internship:  '#7ec8ff',
  story:       '#ec4899',
};

export function FeedScreen() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const { data, error: err } = await supabase
        .from('feed_posts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (err) setError(err.message);
      setPosts(data || []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-6 w-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-5 md:px-8 py-6 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-2xl font-display font-bold text-white mb-1">Campus Feed</h1>
        <p className="text-white/40 text-sm">Latest news, alerts, and updates from campus.</p>
      </motion.div>

      {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

      <div className="mb-4">
        <CommunityCard />
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20">
          <Sparkles className="h-10 w-10 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 text-sm">No posts yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post, i) => {
            const color = TYPE_COLORS[post.type] || '#4a9eff';
            return (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-2xl p-4"
                style={{ background: 'rgba(13,34,64,0.6)', border: `1px solid ${color}20` }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium uppercase tracking-wide"
                    style={{ background: `${color}20`, color }}>
                    {post.type}
                  </span>
                  <span className="text-[10px] text-white/30">
                    {new Date(post.created_at).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white mb-1">{post.title}</h3>
                {post.body && <p className="text-xs text-white/50 leading-relaxed">{post.body}</p>}
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs transition-colors"
                    style={{ color }}>
                    Read more <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
