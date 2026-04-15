'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';

// Bảng màu xoay vòng cho các phần trên bánh xe
const WHEEL_COLORS = [
  "#8b5cf6", "#ec4899", "#f59e0b", "#06b6d4",
  "#10b981", "#6366f1", "#f43f5e", "#a855f7",
  "#14b8a6", "#f97316", "#3b82f6", "#e11d48"
];

interface Prize {
  text: string;
  color: string;
}

interface LuckyWheelProps {
  prizes?: Prize[];
  wheelType?: 'wheel_100' | 'wheel_50';
  onPointsDeducted?: (remaining: number) => void;
  onWin?: (prizeName: string) => void;
}

export default function LuckyWheel({ prizes, wheelType = 'wheel_100', onPointsDeducted, onWin }: LuckyWheelProps) {
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controls = useAnimation();
  const rotationRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Confetti effect logic
  const fireConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const particles: any[] = [];
    const colors = ['#30cfd0', '#330867', '#ff0055', '#ffcc00', '#00ffcc'];
    
    for (let i = 0; i < 150; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 30,
        vy: (Math.random() - 0.5) * 30 - 15,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;
      
      particles.forEach(p => {
        if (p.life > 0) {
          alive = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.5; // gravity
          p.life -= 0.01;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.fillRect(p.x, p.y, p.size, p.size);
        }
      });

      if (alive) requestAnimationFrame(animate);
    };
    animate();
  };

  // Handle canvas resize
  useEffect(() => {
    const updateSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Nếu không có quà nào
  if (!prizes || prizes.length === 0) {
    return (
      <div className="flex flex-col items-center max-w-[400px] mx-auto">
        <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] mb-12">
          <div className="w-full h-full rounded-full border-[12px] border-white/10 p-2 shadow-[0_0_50px_rgba(48,207,208,0.5)] bg-white/5 relative flex items-center justify-center">
            <div className="text-center p-8">
              <p className="text-gray-500 text-[11px] font-black uppercase tracking-widest">Chưa có phần quà nào</p>
              <p className="text-gray-600 text-[10px] mt-2">Admin cần thêm quà ở mức điểm này.</p>
            </div>
          </div>
        </div>
        <div className="w-full text-center">
          <button disabled className="w-full py-5 text-xl font-black rounded-2xl bg-gray-800 text-gray-600 uppercase tracking-widest opacity-50 cursor-not-allowed">
            QUAY NGAY!
          </button>
        </div>
      </div>
    );
  }

  const spin = async () => {
    if (spinning) return;
    
    setSpinning(true);
    setError(null);

    try {
      const res = await fetch('/api/gifts/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: wheelType })
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Không thể quay');
        setSpinning(false);
        return;
      }

      if (onPointsDeducted && data.remainingPoints !== undefined) {
        onPointsDeducted(data.remainingPoints);
      }

      const winName = data.wonGiftName || 'Phần quà';
      // Tìm index dựa trên tên món quà thực tế để đảm bảo chính xác 100%
      const winIndexInPrizes = prizes.findIndex(p => p.text === winName);
      const finalIndex = winIndexInPrizes >= 0 ? winIndexInPrizes : (data.wonGiftIndex ?? 0);

      const segmentAngle = 360 / prizes.length;
      const targetAngle = segmentAngle * finalIndex + segmentAngle / 2;
      const fullSpins = 1800 + Math.floor(Math.random() * 360);
      const finalRotation = fullSpins + (360 - targetAngle);
      
      rotationRef.current += finalRotation;

      await controls.start({
        rotate: rotationRef.current,
        transition: { duration: 5, ease: [0.15, 0, 0, 1] }
      });

      if (onWin) onWin(winName);
      setSpinning(false);

    } catch (err) {
      setError('Lỗi kết nối server');
      setSpinning(false);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-[400px] mx-auto relative">
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[9999]" 
      />

      <div className="relative w-[300px] h-[300px] sm:w-[350px] sm:h-[350px] mb-12">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30 filter drop-shadow-xl">
          <svg width="40" height="50" viewBox="0 0 40 50">
            <path d="M20 50L0 0H40L20 50Z" fill="white" />
          </svg>
        </div>
        
        <div className="w-full h-full rounded-full border-[12px] border-white/10 p-2 shadow-[0_0_50px_rgba(48,207,208,0.5)] bg-white/5 relative overflow-hidden">
          <motion.div 
            animate={controls}
            className="w-full h-full rounded-full relative overflow-hidden"
          >
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {prizes.map((p, i) => {
                const angle = 360 / prizes.length;
                const startAngle = i * angle;
                const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
                const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
                const x2 = 50 + 50 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                const y2 = 50 + 50 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                
                return (
                  <g key={i}>
                    <path 
                      d={`M 50 50 L ${x1} ${y1} A 50 50 0 0 1 ${x2} ${y2} Z`}
                      fill={p.color}
                      className="transition-opacity duration-300"
                    />
                    <text
                      x={50 + 32 * Math.cos(((startAngle + angle / 2) * Math.PI) / 180)}
                      y={50 + 32 * Math.sin(((startAngle + angle / 2) * Math.PI) / 180)}
                      fill="white"
                      fontSize={
                        prizes.length <= 4 ? "5" : 
                        prizes.length <= 8 ? "3.5" : "2.5"
                      }
                      fontWeight="900"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      transform={`rotate(${startAngle + angle / 2 + 180}, ${50 + 32 * Math.cos(((startAngle + angle / 2) * Math.PI) / 180)}, ${50 + 32 * Math.sin(((startAngle + angle / 2) * Math.PI) / 180)})`}
                    >
                      {p.text.length > 10 && prizes.length <= 6 ? (
                         <>
                           <tspan x={50 + 32 * Math.cos(((startAngle + angle / 2) * Math.PI) / 180)} dy="-1.5em">
                             {p.text.slice(0, p.text.lastIndexOf(' ', 10))}
                           </tspan>
                           <tspan x={50 + 32 * Math.cos(((startAngle + angle / 2) * Math.PI) / 180)} dy="1.2em">
                             {p.text.slice(p.text.lastIndexOf(' ', 10))}
                           </tspan>
                         </>
                      ) : (
                        p.text
                      )}
                    </text>
                  </g>
                );
              })}
            </svg>
          </motion.div>
          
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl z-20 border-4 border-white/20">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-full shadow-inner" />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full text-center">
        <button 
          onClick={spin}
          disabled={spinning}
          className={`w-full py-5 text-xl font-black rounded-2xl shadow-[0_10px_30px_rgba(48,207,208,0.3)] hover:shadow-[0_15px_40px_rgba(48,207,208,0.5)] transition-all bg-gradient-to-r from-primary to-primary-glow text-white uppercase tracking-widest ${spinning ? 'opacity-50 scale-95' : 'hover:scale-[1.02] active:scale-95'}`}
        >
          {spinning ? 'ĐANG QUAY...' : 'QUAY NGAY!'}
        </button>
        
        {error && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mt-6 p-4 rounded-2xl border border-red-500/30 bg-red-500/10"
          >
            <p className="text-red-400 text-sm font-bold">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Export helper to convert gift data from DB to wheel prizes
export function giftsToWheelPrizes(gifts: any[]): Prize[] {
  // Sort gifts by createdAt to ensure consistent index with API
  const sortedGifts = [...gifts].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return sortedGifts.map((gift, index) => ({
    text: gift.name,
    color: WHEEL_COLORS[index % WHEEL_COLORS.length]
  }));
}
