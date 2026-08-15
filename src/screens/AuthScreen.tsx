import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, User, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type Mode = 'signin' | 'signup';

const STUDENT_DOMAIN = '@jagannath.org';
const ADMIN_DOMAIN = '@jims.delhi';

function detectRole(email: string): 'student' | 'admin' | null {
  const lower = email.toLowerCase().trim();
  if (lower.endsWith(ADMIN_DOMAIN)) return 'admin';
  if (lower.endsWith(STUDENT_DOMAIN)) return 'student';
  return null;
}

const HOSTELS = ['Block A', 'Block B', 'Block C', 'Block D', 'Off-Campus'];

export function AuthScreen() {
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [hostel, setHostel] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const role = detectRole(email);

  const handleSubmit = async () => {
    setError('');
    const detectedRole = detectRole(email);
    if (!detectedRole) {
      setError('Use your college email. Students use @jagannath.org, admins use @jims.delhi.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (mode === 'signup' && !fullName.trim()) {
      setError('Please enter your full name.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { data: { full_name: fullName.trim(), hostel: hostel || null } },
        });
        if (err) throw err;
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Authentication failed.';
      if (msg.includes('Email not confirmed')) {
        setError('Email not confirmed yet. Please check your inbox.');
      } else if (msg.includes('Invalid login')) {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'radial-gradient(ellipse 120% 80% at 50% 30%, #1a3d6b 0%, #102848 40%, #081B33 70%, #040f1e 100%)' }}
    >
      {/* Ambient blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(74,158,255,0.1) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.05, 1], opacity: [0.6, 0.8, 0.6] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute bottom-[-80px] right-[-100px] w-[400px] h-[400px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(242,153,74,0.07) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.4, 0.6, 0.4] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
        <motion.div
          className="absolute top-[40%] left-[-100px] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(20,184,166,0.05) 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.08, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
        />
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 20 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-brand-300/20"
            style={{ left: `${(i * 37) % 100}%`, top: `${(i * 53) % 100}%` }}
            animate={{ y: [0, -30, 0], opacity: [0, 0.5, 0] }}
            transition={{ duration: 4 + (i % 5), repeat: Infinity, delay: i * 0.3, ease: 'easeInOut' }}
          />
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <motion.div
          className="flex justify-center mb-6"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <img
            src="/assets/file_00000000a1388208b94f85093ee921cf.png"
            alt="NUDGEE"
            className="w-[min(55vw,220px)] h-auto object-contain"
            style={{ filter: 'drop-shadow(0 0 20px rgba(74,158,255,0.35))' }}
            draggable={false}
          />
        </motion.div>

        {/* Card */}
        <div
          className="rounded-3xl p-6 relative overflow-hidden"
          style={{
            background: 'rgba(13,34,64,0.65)',
            border: '1px solid rgba(74,158,255,0.15)',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}
        >
          {/* Card inner glow */}
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-[80%] h-px"
            style={{ background: 'linear-gradient(90deg, transparent, rgba(74,158,255,0.3), transparent)' }}
          />

          {/* Mode toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-5" style={{ background: 'rgba(255,255,255,0.04)' }}>
            {(['signin', 'signup'] as Mode[]).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); }}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${mode === m ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                style={mode === m ? { background: 'rgba(74,158,255,0.15)' } : undefined}
              >
                {m === 'signin' ? 'Sign In' : 'Sign Up'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <Field icon={User} label="Full Name">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
                />
              </Field>
            )}

            <Field icon={Mail} label="College Email">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.name@jagannath.org"
                className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
                autoCapitalize="none"
              />
            </Field>

            {/* Role indicator */}
            <AnimatePresence>
              {role && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{
                    background: role === 'admin' ? 'rgba(148,163,184,0.1)' : 'rgba(74,158,255,0.1)',
                    color: role === 'admin' ? '#94a3b8' : '#7ec8ff',
                  }}
                >
                  <motion.div
                    className="w-2 h-2 rounded-full"
                    style={{ background: role === 'admin' ? '#94a3b8' : '#4a9eff' }}
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  />
                  {role === 'admin' ? 'Admin access — Control Room' : 'Student access — Campus App'}
                </motion.div>
              )}
            </AnimatePresence>

            {mode === 'signup' && role === 'student' && (
              <div>
                <label className="text-xs text-white/50 mb-1.5 block">Hostel (optional)</label>
                <div className="grid grid-cols-5 gap-1.5">
                  {HOSTELS.map((h) => (
                    <button
                      key={h}
                      onClick={() => setHostel(h)}
                      className={`px-1 py-2 rounded-lg text-[10px] font-medium transition-all ${hostel === h ? 'text-white' : 'text-white/40 hover:text-white/70'}`}
                      style={hostel === h
                        ? { background: 'rgba(74,158,255,0.15)', border: '1px solid rgba(74,158,255,0.3)' }
                        : { background: 'rgba(255,255,255,0.03)', border: '1px solid transparent' }}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <Field icon={Lock} label="Password">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="At least 6 characters"
                className="w-full bg-transparent text-sm text-white placeholder-white/30 focus:outline-none"
              />
              <button
                onClick={() => setShowPassword((s) => !s)}
                className="text-white/30 hover:text-white/60 transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </Field>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs text-red-300"
                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.15)' }}
              >
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}

            <motion.button
              onClick={handleSubmit}
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.01 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
              style={{
                background: 'linear-gradient(135deg, #4a9eff, #7ec8ff)',
                color: '#fff',
                boxShadow: '0 8px 24px rgba(74,158,255,0.25)',
              }}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  {mode === 'signin' ? 'Sign In' : 'Create Account'}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </motion.button>
          </div>

          <p className="mt-4 text-center text-[10px] text-white/30 leading-relaxed">
            Students: use your @jagannath.org email<br />
            Admins: use your @jims.delhi email
          </p>
        </div>
      </motion.div>
    </div>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-white/50 mb-1.5 block font-medium">{label}</label>
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl transition-all"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(74,158,255,0.1)' }}
      >
        <Icon className="h-4 w-4 text-white/30 shrink-0" />
        {children}
      </div>
    </div>
  );
}
