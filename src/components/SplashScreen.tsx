import { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParticleField } from '@/hooks/useParticleField';
import { useNeuralField } from '@/hooks/useNeuralField';

const LOGO_URL = '/assets/file_00000000a1388208b94f85093ee921cf.png';
const LINE_1 = 'Choose Your Twist.';
const LINE_2 = 'TWISTED · NOT · WASTED';
const TOTAL_MS = 10000;
const EXIT_MS  = 9200;

export function SplashScreen({ onDone }: { onDone: () => void }) {
  const [exiting, setExiting] = useState(false);
  const [phase, setPhase]     = useState(0);
  const [progress, setProgress] = useState(0);
  const particleCanvas = useParticleField(true);
  const neuralCanvas   = useNeuralField(true);
  const doneRef = useRef(false);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    onDone();
  }, [onDone]);

  useEffect(() => {
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      setProgress(Math.min(elapsed / TOTAL_MS, 1));
      if (elapsed < TOTAL_MS) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase(1),  200),
      setTimeout(() => setPhase(2),  600),
      setTimeout(() => setPhase(3),  1500),
      setTimeout(() => setPhase(4),  2500),
      setTimeout(() => setPhase(5),  3500),
      setTimeout(() => setExiting(true), EXIT_MS),
      setTimeout(finish, TOTAL_MS),
      setTimeout(finish, TOTAL_MS + 2000),
    ];
    return () => timers.forEach(clearTimeout);
  }, [finish]);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <AnimatePresence>
      {!exiting && (
        <motion.div
          className="splash-root"
          onClick={finish}
          role="button"
          tabIndex={-1}
          aria-label="Skip intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, filter: 'blur(10px)', transition: { duration: 0.8, ease } }}
        >
          {/* Ambient blobs */}
          <motion.div className="ambient-blob blob-blue"
            initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 0.85, scale: 1 }}
            transition={{ duration: 2.5, ease }} />
          <motion.div className="ambient-blob blob-orange"
            initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 0.7, scale: 1.05 }}
            transition={{ duration: 3, delay: 0.3, ease }} />
          <motion.div className="ambient-blob blob-teal"
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 0.6, y: -10 }}
            transition={{ duration: 3.5, delay: 0.5, ease }} />

          <canvas ref={particleCanvas} className="splash-canvas" />
          <motion.canvas ref={neuralCanvas} className="neural-canvas"
            initial={{ opacity: 0 }} animate={{ opacity: phase >= 1 ? 0.5 : 0 }}
            transition={{ duration: 1.5, ease }} />

          <div className="scan-overlay" />
          <div className="vignette" />

          <div className="relative z-10 flex flex-col items-center justify-center px-6">
            {/* Center glow */}
            <motion.div className="absolute" style={{ width:300, height:300, borderRadius:'50%',
              background:'radial-gradient(circle, rgba(74,158,255,0.18) 0%, transparent 70%)', filter:'blur(20px)' }}
              initial={{ scale:0, opacity:0 }} animate={{ scale: phase>=1?1.1:0, opacity: phase>=1?0.5:0 }}
              transition={{ duration:1.5, ease }} />

            {/* Rotating rings */}
            {[200, 290, 380].map((size, i) => (
              <motion.div key={size} className="energy-ring" style={{ width:size, height:size,
                border: i===1 ? '1px dashed rgba(242,153,74,0.15)' : '1px solid rgba(74,158,255,0.12)',
                boxShadow: i===0 ? '0 0 40px rgba(74,158,255,0.06)' : 'none' }}
                initial={{ scale:0, opacity:0 }}
                animate={{ scale: phase>=1?1:0, opacity: phase>=1? (i===2?0.12:i===1?0.22:0.35) :0,
                  rotate: i%2===0 ? 360 : -360 }}
                transition={{ scale:{ duration:1.2+i*0.2, delay:i*0.15, ease },
                  opacity:{ duration:1, delay:i*0.15, ease },
                  rotate:{ duration:14+i*6, repeat:Infinity, ease:'linear' } }} />
            ))}

            {/* Logo */}
            <motion.div className="relative z-20 flex items-center justify-center"
              style={{ width: 'min(60vw, 360px)', height: 'min(60vw, 360px)' }}
              initial={{ scale:0.85, opacity:0, y:20 }}
              animate={{ scale: phase>=2?1:0.85, opacity: phase>=2?1:0, y: phase>=2?0:20 }}
              transition={{ duration:1.2, ease }}>
              <motion.div className="logo-glow"
                animate={{ scale:[1,1.08,1], opacity:[0.5,0.9,0.5] }}
                transition={{ duration:3, repeat:Infinity, ease:'easeInOut', delay:1.5 }} />
              <motion.img src={LOGO_URL} alt="NUDGEE" draggable={false}
                className="relative z-10 w-full h-full object-contain"
                style={{ filter:'drop-shadow(0 0 20px rgba(74,158,255,0.45)) drop-shadow(0 0 40px rgba(242,153,74,0.15))' }}
                initial={{ opacity:0 }} animate={{ opacity:1 }}
                transition={{ duration:0.8, delay:0.3 }} />
            </motion.div>

            {/* Tagline */}
            <motion.div
              className="mt-6 flex flex-col items-center gap-2"
              initial={{ opacity:0, y:6 }} animate={{ opacity: phase>=5?1:0, y: phase>=5?0:6 }}
              transition={{ duration:0.8, ease:'easeOut' }}>
              <p className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
                {LINE_1}
              </p>
              <p className="text-sm sm:text-base font-semibold text-orange-400 text-center uppercase"
                 style={{ letterSpacing: '0.18em', fontSize: 'max(14px, 3.5vw)' }}>
                {LINE_2}
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div className="mt-7 rounded-full overflow-hidden bg-white/5"
              style={{ width:140, height:3 }}
              initial={{ opacity:0 }} animate={{ opacity: phase>=3?1:0 }}
              transition={{ duration:0.5 }}>
              <motion.div className="h-full rounded-full"
                style={{
                  width: `${progress * 100}%`,
                  background:'linear-gradient(90deg, #4a9eff, #f2994a)',
                  boxShadow:'0 0 8px rgba(74,158,255,0.5)',
                  transition: 'width 0.1s linear',
                }} />
            </motion.div>

            {/* Time counter */}
            <motion.p className="mt-2.5 text-[10px] text-white/20 font-mono tabular-nums"
              initial={{ opacity:0 }} animate={{ opacity: phase>=3?1:0 }}
              transition={{ duration:0.5 }}>
              {Math.ceil((1 - progress) * TOTAL_MS / 1000)}s
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
