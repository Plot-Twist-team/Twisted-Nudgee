import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { AuthProvider, useAuth } from '@/lib/auth';
import { SplashScreen } from '@/components/SplashScreen';
import { Layout, type ScreenId } from '@/components/Layout';
import { Dashboard } from '@/screens/Dashboard';
import { ReportScreen } from '@/screens/Report';
import { WellnessScreen } from '@/screens/Wellness';
import { EventsScreen } from '@/screens/Events';
import { ClubsScreen } from '@/screens/Clubs';
import { RewardsScreen } from '@/screens/Rewards';
import { MentorScreen } from '@/screens/Mentor';
import { FeedScreen } from '@/screens/Feed';
import { AuthScreen } from '@/screens/AuthScreen';
import { AdminLayout, type AdminScreenId, ADMIN_BORDER } from '@/components/AdminLayout';
import { AdminOverview } from '@/screens/admin/AdminOverview';
import { AdminReports } from '@/screens/admin/AdminReports';
import { AdminWellness } from '@/screens/admin/AdminWellness';
import { AdminManage } from '@/screens/admin/AdminManage';
import { LogOut } from 'lucide-react';

function AppContent() {
  const { user, profile, loading, signOut } = useAuth();
  const [showSplash, setShowSplash] = useState(true);
  const [screen, setScreen] = useState<ScreenId>('dashboard');
  const [adminScreen, setAdminScreen] = useState<AdminScreenId>('overview');
  const [points, setPoints] = useState(0);
  const [stats, setStats] = useState({ reports: 0, wellness: 0, events: 0, clubs: 0 });

  const fetchPoints = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('influence_ledger')
      .select('points')
      .eq('user_id', user.id);
    const total = data?.reduce((sum, r) => sum + r.points, 0) ?? 0;
    setPoints(total);
  }, [user]);

  const fetchStats = useCallback(async () => {
    if (!user) return;
    const [reports, wellness, events, clubs] = await Promise.all([
      supabase.from('pressure_reports').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('wellness_checks').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('event_rsvps').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('club_members').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]);
    setStats({
      reports: reports.count ?? 0,
      wellness: wellness.count ?? 0,
      events: events.count ?? 0,
      clubs: clubs.count ?? 0,
    });
  }, [user]);

  useEffect(() => {
    document.body.style.background = '#081B33';
    if (!showSplash && user) {
      fetchPoints();
      fetchStats();
    }
  }, [showSplash, user, fetchPoints, fetchStats]);

  const handleNavigate = (id: ScreenId) => {
    setScreen(id);
    fetchPoints();
    fetchStats();
  };

  const handleRewardRedeem = () => {
    fetchPoints();
    fetchStats();
  };

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#081B33' }}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-white/40 text-sm">
          Loading...
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  // Admin app
  if (profile?.role === 'admin') {
    return (
      <AdminLayout
        current={adminScreen}
        onNavigate={setAdminScreen}
        onSignOut={signOut}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={adminScreen}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
          >
            {adminScreen === 'overview' && <AdminOverview />}
            {adminScreen === 'reports' && <AdminReports />}
            {adminScreen === 'wellness' && <AdminWellness />}
            {adminScreen === 'events' && (
              <AdminManage
                table="events"
                title="Events"
                description="Create and manage campus events."
                columns={[
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'description', label: 'Description', type: 'text' },
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'event_type', label: 'Type', type: 'select', options: ['regular', 'signature'] },
                  { key: 'event_date', label: 'Date (ISO)', type: 'text' },
                  { key: 'rsvp_count', label: 'RSVP Count', type: 'number' },
                ]}
                displayFields={['title', 'location', 'event_type', 'event_date', 'rsvp_count']}
                createFields={['title', 'description', 'location', 'event_type', 'event_date']}
              />
            )}
            {adminScreen === 'clubs' && (
              <AdminManage
                table="clubs"
                title="Clubs"
                description="Create and manage student clubs."
                columns={[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'description', label: 'Description', type: 'text' },
                  { key: 'is_featured', label: 'Featured', type: 'boolean' },
                  { key: 'member_count', label: 'Members', type: 'number' },
                ]}
                displayFields={['name', 'category', 'is_featured', 'member_count']}
                createFields={['name', 'category', 'description', 'is_featured']}
              />
            )}
            {adminScreen === 'rewards' && (
              <AdminManage
                table="rewards"
                title="Rewards"
                description="Create and manage influence point rewards."
                columns={[
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'description', label: 'Description', type: 'text' },
                  { key: 'points_required', label: 'Points Required', type: 'number' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'fulfillment_type', label: 'Fulfillment', type: 'select', options: ['digital', 'physical'] },
                  { key: 'stock', label: 'Stock', type: 'number' },
                ]}
                displayFields={['title', 'points_required', 'category', 'fulfillment_type', 'stock']}
                createFields={['title', 'description', 'points_required', 'category', 'fulfillment_type', 'stock']}
              />
            )}
            {adminScreen === 'mentors' && (
              <AdminManage
                table="mentors"
                title="Mentors"
                description="Add and manage mentor profiles."
                columns={[
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'expertise', label: 'Expertise', type: 'text' },
                  { key: 'capacity', label: 'Capacity', type: 'number' },
                ]}
                displayFields={['name', 'expertise', 'capacity']}
                createFields={['name', 'expertise', 'capacity']}
              />
            )}
            {adminScreen === 'feed' && (
              <AdminManage
                table="feed_posts"
                title="Feed Posts"
                description="Publish campus news, events, and stories."
                columns={[
                  { key: 'type', label: 'Type', type: 'select', options: ['event', 'club', 'competition', 'internship', 'news', 'story'] },
                  { key: 'title', label: 'Title', type: 'text' },
                  { key: 'body', label: 'Body', type: 'text' },
                  { key: 'link', label: 'Link (optional)', type: 'text' },
                ]}
                displayFields={['type', 'title', 'body']}
                createFields={['type', 'title', 'body', 'link']}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </AdminLayout>
    );
  }

  // Student app (default)
  return (
    <Layout current={screen} onNavigate={handleNavigate} points={points} onSignOut={signOut}>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
        >
          {screen === 'dashboard' && <Dashboard onNavigate={handleNavigate} points={points} stats={stats} />}
          {screen === 'report'    && <ReportScreen />}
          {screen === 'wellness'  && <WellnessScreen />}
          {screen === 'events'    && <EventsScreen />}
          {screen === 'clubs'     && <ClubsScreen />}
          {screen === 'rewards'   && <RewardsScreen points={points} onRedeem={handleRewardRedeem} />}
          {screen === 'mentor'    && <MentorScreen />}
          {screen === 'feed'      && <FeedScreen />}
        </motion.div>
      </AnimatePresence>
    </Layout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
