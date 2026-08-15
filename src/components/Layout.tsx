import { motion, AnimatePresence } from 'framer-motion';
import {
  Home, ShieldAlert, Heart, Calendar, Users,
  Gift, MessageCircle, Sparkles, Menu, X, LogOut,
} from 'lucide-react';
import { useState } from 'react';
import { AIChatbot } from '@/components/AIChatbot';

export type ScreenId =
  | 'dashboard' | 'report' | 'wellness'
  | 'events'   | 'clubs'  | 'rewards'
  | 'mentor'   | 'feed';

interface NavItem {
  id: ScreenId;
  label: string;
  icon: typeof Home;
  color: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: Home,         color: '#4a9eff' },
  { id: 'report',    label: 'Report',    icon: ShieldAlert,  color: '#ef4444' },
  { id: 'wellness',  label: 'Wellness',  icon: Heart,        color: '#ec4899' },
  { id: 'events',    label: 'Events',    icon: Calendar,     color: '#f59e0b' },
  { id: 'clubs',     label: 'Clubs',     icon: Users,        color: '#10b981' },
  { id: 'rewards',   label: 'Rewards',   icon: Gift,         color: '#f2994a' },
  { id: 'mentor',    label: 'Mentor',    icon: MessageCircle,color: '#7ec8ff' },
  { id: 'feed',      label: 'Feed',      icon: Sparkles,     color: '#14b8a6' },
];

interface LayoutProps {
  current: ScreenId;
  onNavigate: (id: ScreenId) => void;
  children: React.ReactNode;
  points: number;
  onSignOut: () => void;
}

export function Layout({ current, onNavigate, children, points, onSignOut }: LayoutProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: ScreenId) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden relative" style={{ background: '#081B33' }}>
      {/* Ambient background glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,158,255,0.06) 0%, transparent 70%)' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(242,153,74,0.04) 0%, transparent 70%)' }} />
      </div>

      {/* Sidebar — desktop */}
      <aside
        className="hidden md:flex flex-col w-60 shrink-0 border-r relative z-10"
        style={{ borderColor: 'rgba(74,158,255,0.08)', background: 'rgba(13,34,64,0.5)', backdropFilter: 'blur(12px)' }}
      >
        <SidebarContent current={current} onNav={handleNav} points={points} onSignOut={onSignOut} />
      </aside>

      {/* Sidebar — mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              className="relative flex flex-col w-64 h-full border-r"
              style={{ borderColor: 'rgba(74,158,255,0.08)', background: '#0d2240' }}
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
            >
              <button
                className="absolute top-4 right-4 p-1.5 rounded-lg text-white/50 hover:text-white hover:bg-white/5 transition-all z-10"
                onClick={() => setMobileOpen(false)}
              >
                <X className="h-5 w-5" />
              </button>
              <SidebarContent current={current} onNav={handleNav} points={points} onSignOut={onSignOut} />
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        {/* Top bar — mobile */}
        <header
          className="md:hidden flex items-center justify-between px-4 h-14 shrink-0 border-b"
          style={{ borderColor: 'rgba(74,158,255,0.08)', background: 'rgba(13,34,64,0.6)', backdropFilter: 'blur(12px)' }}
        >
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/5 transition-all">
            <Menu className="h-5 w-5" />
          </button>
          <img
            src="/assets/file_00000000a1388208b94f85093ee921cf.png"
            alt="NUDGEE"
            className="h-7 w-auto object-contain max-w-[100px] sm:h-8 sm:max-w-[120px]"
            draggable={false}
          />
          <div className="flex items-center gap-1 text-amber-400 text-xs font-bold tabular-nums">
            <Sparkles className="h-3.5 w-3.5" />
            {points}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      <AIChatbot />
    </div>
  );
}

function SidebarContent({
  current, onNav, points, onSignOut,
}: { current: ScreenId; onNav: (id: ScreenId) => void; points: number; onSignOut: () => void }) {
  return (
    <>
      <div className="flex items-center gap-3 px-5 h-20 shrink-0 border-b" style={{ borderColor: 'rgba(74,158,255,0.08)' }}>
        <img
          src="/assets/file_00000000a1388208b94f85093ee921cf.png"
          alt="NUDGEE"
          className="h-10 w-auto object-contain max-w-[160px]"
          draggable={false}
          style={{ filter: 'drop-shadow(0 0 12px rgba(74,158,255,0.2))' }}
        />
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = current === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNav(item.id)}
              className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                active ? 'text-white' : 'text-white/45 hover:text-white/80 hover:bg-white/[0.04]'
              }`}
              style={active ? { background: `linear-gradient(135deg, ${item.color}18, ${item.color}08)` } : undefined}
            >
              {active && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full"
                  style={{ background: item.color }}
                  layoutId="nav-indicator"
                  transition={{ type: 'spring', damping: 24, stiffness: 300 }}
                />
              )}
              <Icon className="h-[18px] w-[18px] shrink-0 transition-colors duration-200" style={{ color: active ? item.color : undefined }} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="shrink-0 p-3 border-t space-y-2" style={{ borderColor: 'rgba(74,158,255,0.08)' }}>
        <div
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
          style={{ background: 'linear-gradient(135deg, rgba(242,153,74,0.1), rgba(236,72,153,0.05))' }}
        >
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span className="text-xs text-white/50">Influence</span>
          <span className="ml-auto text-sm font-bold text-amber-400 tabular-nums">{points}</span>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-white/70 hover:bg-white/[0.04] transition-all"
        >
          <LogOut className="h-4 w-4" /> Sign Out
        </button>
      </div>
    </>
  );
}
