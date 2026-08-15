import { useEffect, useRef } from 'react';

interface Node {
  x: number;
  y: number;
  pulse: number;
}

export function useNeuralField(active: boolean) {
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

    const nodes: Node[] = [];
    const baseRadius = Math.min(w, h) * 0.18;
    for (let ring = 0; ring < 3; ring++) {
      const r = baseRadius + ring * 60;
      const dots = 8 + ring * 4;
      for (let i = 0; i < dots; i++) {
        const angle = (i / dots) * Math.PI * 2;
        nodes.push({
          x: w / 2 + Math.cos(angle) * r,
          y: h / 2 + Math.sin(angle) * r,
          pulse: Math.random() * Math.PI * 2,
        });
      }
    }

    function draw() {
      ctx!.clearRect(0, 0, w, h);
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.pulse += 0.015;
        const pulse = 0.3 + 0.7 * Math.sin(n.pulse + i * 0.5);

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x;
          const dy = n.y - m.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12 * pulse;
            ctx!.strokeStyle = `rgba(74, 158, 255, ${alpha})`;
            ctx!.lineWidth = 0.5;
            ctx!.beginPath();
            ctx!.moveTo(n.x, n.y);
            ctx!.lineTo(m.x, m.y);
            ctx!.stroke();
          }
        }

        const dotAlpha = 0.2 + 0.6 * pulse;
        ctx!.beginPath();
        ctx!.arc(n.x, n.y, 1.5, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(74, 158, 255, ${dotAlpha})`;
        ctx!.shadowBlur = 6;
        ctx!.shadowColor = `rgba(74, 158, 255, ${dotAlpha * 0.5})`;
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
