'use client';

import { useEffect, useRef } from 'react';

const FONT_LINK = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600&family=Outfit:wght@300;400&display=swap';

function loadFont() {
  if (typeof document !== 'undefined' && !document.querySelector(`link[href="${FONT_LINK}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = FONT_LINK;
    document.head.appendChild(link);
  }
}

interface ClockProps {
  date: Date;
}

export default function Clock({ date }: ClockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadFont();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1;
    const size = 100;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    (canvas as any).style.width = size + 'px';
    (canvas as any).style.height = size + 'px';
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const r = size / 2 - 6;

    ctx!.clearRect(0, 0, size, size);

    // Outer shadow
    ctx!.save();
    ctx!.shadowColor = 'rgba(0,0,0,0.08)';
    ctx!.shadowBlur = 12;
    ctx!.shadowOffsetY = 3;
    ctx!.beginPath();
    ctx!.arc(cx, cy, r + 6, 0, Math.PI * 2);
    ctx!.fillStyle = '#faf9f6';
    ctx!.fill();
    ctx!.restore();

    // Face - warm off-white
    const faceGrad = ctx!.createRadialGradient(cx, cy - 8, 0, cx, cy, r + 4);
    faceGrad.addColorStop(0, '#fefdfb');
    faceGrad.addColorStop(1, '#f3f0ea');
    ctx!.beginPath();
    ctx!.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx!.fillStyle = faceGrad;
    ctx!.fill();

    // Bezel ring
    ctx!.beginPath();
    ctx!.arc(cx, cy, r + 4, 0, Math.PI * 2);
    ctx!.strokeStyle = '#d4cfc5';
    ctx!.lineWidth = 0.8;
    ctx!.stroke();

    // Minute ticks
    for (let i = 0; i < 60; i++) {
      const angle = (i * Math.PI) / 30 - Math.PI / 2;
      const isHour = i % 5 === 0;
      const outerR = r - 2;
      const innerR = isHour ? r - 10 : r - 6;

      ctx!.beginPath();
      ctx!.moveTo(cx + innerR * Math.cos(angle), cy + innerR * Math.sin(angle));
      ctx!.lineTo(cx + outerR * Math.cos(angle), cy + outerR * Math.sin(angle));
      if (isHour) {
        ctx!.strokeStyle = '#3a352d';
        ctx!.lineWidth = 0.9;
      } else {
        ctx!.strokeStyle = 'rgba(58,53,45,0.18)';
        ctx!.lineWidth = 0.4;
      }
      ctx!.stroke();
    }

    // Roman numerals (simplified for small clock)
    const numerals = ['XII', 'III', 'VI', 'IX'];
    const positions = [0, 3, 6, 9];
    
    ctx!.textAlign = 'center';
    ctx!.textBaseline = 'middle';

    positions.forEach((i) => {
      const angle = (i * Math.PI) / 6 - Math.PI / 2;
      const textR = r - 14;
      const tx = cx + textR * Math.cos(angle);
      const ty = cy + textR * Math.sin(angle);

      ctx!.font = "500 6px 'Playfair Display', serif";
      ctx!.fillStyle = '#3a352d';
      ctx!.fillText(numerals[i / 3], tx, ty);
    });

    // Time calculation
    const hours = date.getHours() % 12;
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ms = date.getMilliseconds();
    const smoothSec = seconds + ms / 1000;

    const hourAngle = ((hours + minutes / 60) * Math.PI) / 6 - Math.PI / 2;
    const minuteAngle = ((minutes + smoothSec / 60) * Math.PI) / 30 - Math.PI / 2;
    const secondAngle = (smoothSec * Math.PI) / 30 - Math.PI / 2;

    const drawHand = (angle: number, length: number, baseW: number, tipW: number, color: string) => {
      ctx!.save();
      ctx!.translate(cx, cy);
      ctx!.rotate(angle + Math.PI / 2);
      ctx!.shadowColor = 'rgba(0,0,0,0.12)';
      ctx!.shadowBlur = 3;
      ctx!.shadowOffsetX = 0.5;
      ctx!.shadowOffsetY = 1;
      ctx!.beginPath();
      ctx!.moveTo(-baseW / 2, 6);
      ctx!.lineTo(-tipW / 2, -length);
      ctx!.lineTo(0, -length - 2);
      ctx!.lineTo(tipW / 2, -length);
      ctx!.lineTo(baseW / 2, 6);
      ctx!.closePath();
      ctx!.fillStyle = color;
      ctx!.fill();
      ctx!.restore();
    };

    // Hour hand
    drawHand(hourAngle, r * 0.43, 4, 1.8, '#2a2520');

    // Minute hand
    drawHand(minuteAngle, r * 0.65, 3, 1.2, '#3a352d');

    // Second hand
    ctx!.save();
    ctx!.translate(cx, cy);
    ctx!.rotate(secondAngle + Math.PI / 2);
    ctx!.shadowColor = 'rgba(0,0,0,0.1)';
    ctx!.shadowBlur = 2;
    // Counterweight
    ctx!.beginPath();
    ctx!.moveTo(-1.5, 10);
    ctx!.lineTo(1.5, 10);
    ctx!.lineTo(0.6, 3);
    ctx!.lineTo(-0.6, 3);
    ctx!.closePath();
    ctx!.fillStyle = '#bf4a3a';
    ctx!.fill();
    // Needle
    ctx!.beginPath();
    ctx!.moveTo(-0.4, 3);
    ctx!.lineTo(0, -r * 0.75);
    ctx!.lineTo(0.4, 3);
    ctx!.closePath();
    ctx!.fillStyle = '#bf4a3a';
    ctx!.fill();
    ctx!.restore();

    // Center cap
    const capGrad = ctx!.createRadialGradient(cx - 0.5, cy - 0.5, 0, cx, cy, 3);
    capGrad.addColorStop(0, '#5a5347');
    capGrad.addColorStop(1, '#3a352d');
    ctx!.beginPath();
    ctx!.arc(cx, cy, 2.5, 0, Math.PI * 2);
    ctx!.fillStyle = capGrad;
    ctx!.fill();
    ctx!.beginPath();
    ctx!.arc(cx, cy, 1, 0, Math.PI * 2);
    ctx!.fillStyle = '#f3f0ea';
    ctx!.fill();
  }, [date]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        display: 'block',
        filter: 'drop-shadow(0 2px 6px rgba(0, 0, 0, 0.1))',
      }}
    />
  );
}
