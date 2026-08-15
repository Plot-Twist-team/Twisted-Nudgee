import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, FileWarning, Heart, Calendar, Users,
  Gift, MessageCircle, Newspaper, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';

export type AdminScreenId =
  | 'overview' | 'reports' | 'wellness' | 'events'
  | 'clubs'    | 'rewards' | 'mentors'  | 'feed';

interface NavItem {
  id: AdminScreenId;
  label: string;
  icon: typeof LayoutDashboard;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'overview', label: 'Overview',     icon: LayoutDashboard },
  { id: 'reports',  label: 'Reports',      icon: FileWarning },
  { id: 'wellness', label: 'Wellness',     icon: Heart },
  { id: 'events',   label: 'Events',       icon: Calendar },
  { id: 'clubs',    label: 'Clubs',        icon: Users },
  { id: 'rewards',  label: 'Rewards',      icon: Gift },
  { id: 'mentors',  label: 'Mentors',      icon: MessageCircle },
  { id: 'feed',     label: 'Feed',         icon: Newspaper },
];

interface AdminLayoutProps {
  current: AdminScreenId;
  onNavigate: (id: AdminScreenId) => void;
  onSignOut: () => void;
  children: React.ReactNode;
}

const ADMIN_BG = '#0f172a';
const ADMIN_SIDEBAR = 'rgba(15,23,42,0.7)';
const ADMIN_BORDER = 'rgba(148,163,184,0.1)';
const ADMIN_CARD = 'rgba(30,41,59,0.6)';
const ADMIN_ACCENT = '#7ec8ff';

export function AdminLayout({ current, onNavigate, onSignOut, children }: AdminLayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: AdminScreenId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative" style={{ background: ADMIN_BG }}>
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full" style={{ background: 'radial-gradient(circle, rgba(148,163,184,0.04) 0%, transparent 70%)' }} />
      </div>
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 shrink-0 border-r relative z-10" style={{ borderColor: ADMIN_BORDER, background: ADMIN_SIDEBAR, backdropFilter: 'blur(12px)' }}>
        <AdminSidebarContent current={current} onNav={handleNav} onSignOut={onSignOut} />
      </aside>

      {/* Sidebar — mobile */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileOpen(false)} />
            <motion.aside
              className="relative flex flex-col w-56 h-full border-r"
              style={{ borderColor: ADMIN_BORDER, background: '#1e293b' }}
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <button className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all z-10" onClick={() => setMobileOpen(false)}>
                <X className="h-5 w-5" />
              </button>
              <AdminSidebarContent current={current} onNav={handleNav} onSignOut={onSignOut} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 h-14 shrink-0 border-b" style={{ borderColor: ADMIN_BORDER, background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)' }}>
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-all">
            <Menu className="h-5 w-5" />
          </button>
          <span className="text-slate-300 text-xs font-medium uppercase tracking-wider">Control Room</span>
          <div className="w-8" />
        </header>

        {/* Desktop header */}
        <header className="hidden md:flex items-center justify-between px-6 h-14 shrink-0 border-b" style={{ borderColor: ADMIN_BORDER, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(12px)' }}>
          <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Admin Control Room</span>
          <button onClick={onSignOut} className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors">
            <LogOut className="h-3.5 w-3.5" /> Sign Out
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminSidebarContent({
  current, onNav, onSignOut,
}: { current: AdminScreenId; onNav: (id: AdminScreenId) => void; onSignOut: () => void }) {
  return (
    <>
      <div className="flex items-center gap-2 px-4 h-12 shrink-0 border-b" style={{ borderColor: ADMIN_BORDER }}>
        <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'rgba(148,163,184,0.15)' }}>
          <LayoutDashboard className="h-4 w-4 text-slate-400" />
        </div>
        <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">NUDGEE Admin</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`relative w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                active ? 'text-slate-100' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
              }`
              }
              style={active ? { background: 'rgba(126,200,255,0.08)' } : undefined}
            >
              {active && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full"
                  style={{ background: ADMIN_ACCENT }}
                  layoutId="admin-nav-indicator"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <Icon className="h-4 w-4 shrink-0 transition-colors" style={active ? { color: ADMIN_ACCENT } : undefined} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 p-2 border-t" style={{ borderColor: ADMIN_BORDER }}>
        <button onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );
}

export { ADMIN_BG, ADMIN_CARD, ADMIN_BORDER };
