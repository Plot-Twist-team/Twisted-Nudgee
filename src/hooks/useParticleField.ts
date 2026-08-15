import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseAlpha: number;
  alpha: number;
  twinkle: number;
  hue: number;
}

export function useParticleField(active: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = canvas!.clientWidth;
      h = canvas!.clientHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    const count = Math.min(Math.floor((w * h) / 9000), 120);
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const isOrange = Math.random() > 0.85;
      particles.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.15,
        vy: -Math.random() * 0.25 - 0.05,
        radius: Math.random() * 1.6 + 0.4,
        baseAlpha: Math.random() * 0.5 + 0.15,
        alpha: 0,
        twinkle: Math.random() * Math.PI * 2,
        hue: isOrange ? 28 : 212,
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.twinkle += 0.02;
        p.alpha = p.baseAlpha * (0.5 + 0.5 * Math.sin(p.twinkle));

        if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;

        const r = p.radius * (0.8 + 0.2 * Math.sin(p.twinkle));
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, r, 0, Math.PI * 2);
        ctx!.fillStyle = `hsla(${p.hue}, 90%, 70%, ${p.alpha})`;
        ctx!.shadowBlur = 8;
        ctx!.shadowColor = `hsla(${p.hue}, 90%, 60%, ${p.alpha * 0.6})`;
        ctx!.fill();
      }
      ctx!.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    }
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [active]);

  return canvasRef;
}
