import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const TreeOfLife: React.FC<{ level: number }> = ({ level }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;
    
    // Max depth based on level. Level 1 -> depth 4, Level 10 -> depth 10
    const maxDepth = Math.min(Math.max(Math.floor(level * 0.8) + 3, 4), 10);
    
    // Arrays for dynamic elements
    const particles: { x: number, y: number, vx: number, vy: number, size: number, life: number, maxLife: number, color: string }[] = [];
    const fireflies: { x: number, y: number, speed: number, offset: number, size: number }[] = [];
    const stars: { x: number, y: number, size: number, speed: number }[] = [];
    const colors = ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];

    // Initialize fireflies
    for (let i = 0; i < 30; i++) {
      fireflies.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        speed: 0.2 + Math.random() * 0.5,
        offset: Math.random() * 100,
        size: Math.random() * 2 + 0.5
      });
    }

    // Initialize stars
    for (let i = 0; i < 50; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 1.5),
        size: Math.random() * 1.5,
        speed: 0.01 + Math.random() * 0.05
      });
    }

    const drawStars = () => {
      ctx.fillStyle = '#fff';
      stars.forEach(star => {
        const opacity = (Math.sin(time * star.speed + star.x) + 1) / 2;
        ctx.globalAlpha = opacity * 0.6;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
    };

    const drawMoon = () => {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 120, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2 - 50, 80, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.fill();
    };

    const drawMist = () => {
      ctx.fillStyle = 'rgba(139, 92, 246, 0.05)';
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height - 40 + Math.sin(x * 0.02 + time * 0.5) * 15;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.beginPath();
      for (let x = 0; x <= canvas.width; x += 10) {
        const y = canvas.height - 20 + Math.sin(x * 0.03 - time * 0.4) * 20;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.lineTo(canvas.width, canvas.height);
      ctx.lineTo(0, canvas.height);
      ctx.fill();
    };

    const drawPedestal = () => {
      // The glowing stone pedestal at the base
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, canvas.height - 20, 80, 15, 0, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(20, 25, 40, 0.8)';
      ctx.fill();
      
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#10b981';
      ctx.stroke();
      ctx.shadowBlur = 0;
    };

    const drawFireflies = () => {
      fireflies.forEach(f => {
        f.y -= f.speed;
        f.x += Math.sin(time + f.offset) * 1;
        if (f.y < 0) f.y = canvas.height;
        if (f.x < 0) f.x = canvas.width;
        if (f.x > canvas.width) f.x = 0;

        ctx.beginPath();
        ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2);
        ctx.fillStyle = '#fbbf24';
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#fbbf24';
        ctx.fill();
      });
      ctx.shadowBlur = 0;
    };

    const drawBranch = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth === 0) {
        // Spawn particles (glowing leaves) at the tips
        if (Math.random() < 0.05 && particles.length < (level * 25)) {
          particles.push({
            x, y,
            vx: (Math.random() - 0.5) * 0.8,
            vy: Math.random() * 1 + 0.2,
            size: Math.random() * 3 + 1,
            life: 0,
            maxLife: 150 + Math.random() * 150,
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
        return;
      }

      ctx.beginPath();
      ctx.moveTo(x, y);

      const endX = x + len * Math.cos(angle);
      const endY = y + len * Math.sin(angle);

      ctx.lineTo(endX, endY);
      
      const progress = 1 - (depth / maxDepth);
      // Dark enchanted purple to vibrant mystical green
      const r = Math.floor(60 - (60 - 16) * progress);
      const g = Math.floor(20 + (185 - 20) * progress);
      const b = Math.floor(100 - (100 - 129) * progress);
      
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${0.5 + (depth / maxDepth) * 0.5})`;
      ctx.lineWidth = depth * 1.5;
      ctx.lineCap = 'round';
      
      // Magical glow for tree
      if (level >= 3) {
        ctx.shadowBlur = 15 * progress;
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
      }
      ctx.stroke();

      // Dynamic wind
      const windForce = Math.sin(time + x * 0.01) * 0.06 * (1 - depth / maxDepth);
      const angleVariation = 0.35 + Math.sin(time * 0.5 + depth) * 0.03;

      drawBranch(endX, endY, len * 0.76, angle - angleVariation + windForce, depth - 1);
      drawBranch(endX, endY, len * 0.76, angle + angleVariation + windForce, depth - 1);
    };

    const drawParticles = () => {
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx + Math.sin(time * 2 + p.y * 0.05) * 0.5; 
        p.y += p.vy;
        p.life++;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        
        const opacity = p.life < 20 ? p.life / 20 : 1 - (p.life / p.maxLife);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, opacity);
        
        ctx.shadowBlur = 20;
        ctx.shadowColor = p.color;
        ctx.fill();

        if (p.life >= p.maxLife || p.y > canvas.height) {
          particles.splice(i, 1);
        }
      }
      ctx.globalAlpha = 1; 
      ctx.shadowBlur = 0;
    };

    const render = () => {
      time += 0.02; 
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Render environment from background to foreground
      drawMoon();
      drawStars();
      drawFireflies();
      drawMist();
      drawPedestal();

      // Draw Tree
      const initialLength = Math.min(60 + level * 5, 110);
      drawBranch(canvas.width / 2, canvas.height - 20, initialLength, -Math.PI / 2, maxDepth);

      // Draw Falling Leaves
      if (level >= 2) {
        drawParticles();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [level]);

  return (
    <div style={{ position: 'relative', width: '100%', height: 500, display: 'flex', justifyContent: 'center', alignItems: 'flex-end', overflow: 'hidden' }}>
      
      {/* Background Deep Space / Forest Vibe */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'linear-gradient(to bottom, rgba(5,10,20,0.9), rgba(15,20,35,0.2))', zIndex: -1 }} />
      
      {level >= 5 && (
        <motion.div 
          animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.9, 1.1, 0.9] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          style={{ position: 'absolute', bottom: -50, width: 450, height: 450, background: 'radial-gradient(circle, rgba(16,185,129,0.2) 0%, transparent 70%)', borderRadius: '50%', filter: 'blur(50px)', zIndex: 0 }}
        />
      )}
      
      <canvas 
        ref={canvasRef} 
        width={700} 
        height={500} 
        style={{ zIndex: 10, display: 'block', maxWidth: '100%' }}
      />
      
    </div>
  );
};
