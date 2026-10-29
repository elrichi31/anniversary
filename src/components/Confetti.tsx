"use client";

import { useEffect, useRef } from "react";
import { CONFETTI_EVENT, type ConfettiOptions } from "@/lib/confetti";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spin: number;
  wobble: number;
  wobbleSpeed: number;
  color: string;
  round: boolean;
  life: number;
  maxLife: number;
};

const defaultColors = ["#ff5d8f", "#f6c86f", "#79dfca", "#a3b7ff", "#ff8f5b", "#c89bff", "#fff8ef"];

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");

    if (!canvas || !context) {
      return;
    }

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const particles: Particle[] = [];
    let frame = 0;
    let width = 0;
    let height = 0;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const tick = () => {
      context.clearRect(0, 0, width, height);

      for (let index = particles.length - 1; index >= 0; index -= 1) {
        const p = particles[index];
        p.vx *= 0.992;
        p.vy = p.vy * 0.992 + 0.22;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;
        p.wobble += p.wobbleSpeed;
        p.life += 1;

        if (p.life >= p.maxLife || p.y > height + 30) {
          particles.splice(index, 1);
          continue;
        }

        const fade = Math.min(1, (p.maxLife - p.life) / 40);
        context.save();
        context.globalAlpha = fade;
        context.translate(p.x, p.y);
        context.rotate(p.rotation);
        context.scale(1, Math.cos(p.wobble));
        context.fillStyle = p.color;

        if (p.round) {
          context.beginPath();
          context.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          context.fill();
        } else {
          context.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }

        context.restore();
      }

      frame = particles.length ? window.requestAnimationFrame(tick) : 0;
    };

    const fire = (options: ConfettiOptions) => {
      const {
        x = 0.5,
        y = 0.6,
        spread = 70,
        power = 1,
        colors = defaultColors,
      } = options;
      const count = Math.round((options.count ?? 90) * (reduceMotion ? 0.35 : 1));
      const originX = x * width;
      const originY = y * height;

      for (let index = 0; index < count; index += 1) {
        const angle = (-90 + (Math.random() - 0.5) * spread) * (Math.PI / 180);
        const speed = (6 + Math.random() * 9) * power;
        particles.push({
          x: originX,
          y: originY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: 7 + Math.random() * 8,
          rotation: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.3,
          wobble: Math.random() * Math.PI * 2,
          wobbleSpeed: 0.1 + Math.random() * 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
          round: Math.random() < 0.25,
          life: 0,
          maxLife: 140 + Math.random() * 90,
        });
      }

      if (!frame) {
        frame = window.requestAnimationFrame(tick);
      }
    };

    const onFire = (event: Event) => {
      fire((event as CustomEvent<ConfettiOptions>).detail ?? {});
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener(CONFETTI_EVENT, onFire);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener(CONFETTI_EVENT, onFire);
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return <canvas ref={canvasRef} className="confetti-canvas" aria-hidden="true" />;
}
