'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { History as HistoryIcon, Send, Loader2 } from 'lucide-react';
import '@/styles/dashboard.css';

// New Modular Components
import Navbar from '@/components/dashboard/Navbar';
import DashboardHero from '@/components/dashboard/DashboardHero';
import KudosForm from '@/components/dashboard/KudosForm';
import GamificationSidebar from '@/components/dashboard/GamificationSidebar';
import DashboardTable from '@/components/dashboard/DashboardTable';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('received');
  const [rewardTab, setRewardTab] = useState<'direct' | 'wheel_100' | 'wheel_50'>('direct');
  const [gifts, setGifts] = useState<any[]>([]);
  const [quotas, setQuotas] = useState({ thankYouRemaining: 0, greatJobRemaining: 0 });
  const [customAvatar, setCustomAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Gamification & Real-time Points
  const [localPoints, setLocalPoints] = useState<number | null>(null);
  const [redeemLoading, setRedeemLoading] = useState<string | null>(null);
  const [wonPrize, setWonPrize] = useState<string | null>(null);

  // Kudos Form State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedRecipient, setSelectedRecipient] = useState<any>(null);
  const [cardType, setCardType] = useState<'THANK_YOU' | 'GREAT_JOB'>('THANK_YOU');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Authentication Redirect
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Initial Data Fetch
  useEffect(() => {
    const fetchGifts = async () => {
      try {
        const res = await fetch('/api/gifts');
        const data = await res.json();
        setGifts(Array.isArray(data) ? data : []);
      } catch (err) { console.error(err); }
    };
    
    const fetchQuotas = async () => {
      try {
        const res = await fetch('/api/users/quotas');
        if (res.ok) {
          const data = await res.json();
          setQuotas({ thankYouRemaining: data.thankYouRemaining, greatJobRemaining: data.greatJobRemaining });
          if (data.image) setCustomAvatar(data.image);
        }
      } catch (err) { console.error(err); }
    };

    fetchGifts();
    fetchQuotas();
  }, []);

  // Search Logic
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/users/search?q=${searchQuery}`);
        const data = await res.json();
        setSearchResults(data.filter((u: any) => u.id !== (session?.user as any)?.id));
      } catch (err) { console.error(err); }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, session]);

  // Handlers
  const handleLogout = () => signOut({ callbackUrl: '/login' });

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("Ảnh quá lớn! Vui lòng chọn ảnh dưới 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      setCustomAvatar(base64String);
      try {
        await fetch('/api/user/avatar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64String })
        });
      } catch (err) { console.error("Lỗi upload avatar:", err); }
    };
    reader.readAsDataURL(file);
  };

  const fireConfetti = (durationMs = 5000) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = [
      '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', 
      '#FF8C00', '#FFD700', '#ADFF2F', '#00FF7F', '#1E90FF', '#FF1493',
      '#88d3ce', '#6e45e2', '#0250c5', '#d43f8d'
    ];
    const startTime = Date.now();

    const launchPoints = [
      { x: canvas.width * 0.25, y: canvas.height * 0.5 },
      { x: canvas.width * 0.5, y: canvas.height * 0.5 },
      { x: canvas.width * 0.75, y: canvas.height * 0.5 },
      { x: canvas.width * 0.5, y: canvas.height * 0.3 }
    ];

    launchPoints.forEach(point => {
      for (let i = 0; i < 150; i++) {
        particles.push({
          x: point.x,
          y: point.y,
          vx: (Math.random() - 0.5) * 60,
          vy: (Math.random() - 0.5) * 60 - 20,
          size: Math.random() * 12 + 6,
          color: colors[Math.floor(Math.random() * colors.length)],
          rotation: Math.random() * 360,
          rotationSpeed: (Math.random() - 0.5) * 20,
          life: 1
        });
      }
    });

    const animate = () => {
      const elapsed = Date.now() - startTime;
      if (elapsed > durationMs) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
      }
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.8;
        p.rotation += p.rotationSpeed;
        p.life = 1 - (elapsed / durationMs);
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });
      requestAnimationFrame(animate);
    };
    animate();
  };

  const handleSendKudos = async () => {
    if (!selectedRecipient || !message) return;
    setSending(true);
    try {
      const res = await fetch('/api/cards/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId: selectedRecipient.id, type: cardType, message })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccessMsg(`Đã gửi thẻ ${cardType} thành công!`);
        setSelectedRecipient(null);
        setMessage('');
        setSearchQuery('');
        fireConfetti(3000);
        const qRes = await fetch('/api/users/quotas');
        const qData = await qRes.json();
        setQuotas({ thankYouRemaining: qData.thankYouRemaining, greatJobRemaining: qData.greatJobRemaining });
        setTimeout(() => setSuccessMsg(''), 5000);
      } else { alert(data.error); }
    } catch (err) { alert('Lỗi hệ thống'); } finally { setSending(false); }
  };

  const handleDirectRedeem = async (gift: any) => {
    if (redeemLoading) return;
    if (!confirm(`Bạn muốn đổi "${gift.name}" với ${gift.pointCost} điểm?`)) return;
    setRedeemLoading(gift.id);
    try {
      const res = await fetch('/api/gifts/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ giftId: gift.id, type: 'direct' })
      });
      const data = await res.json();
      if (res.ok) {
        setLocalPoints(data.remainingPoints);
        setWonPrize(gift.name);
        fireConfetti(5000);
        const giftsRes = await fetch('/api/gifts');
        const giftsData = await giftsRes.json();
        setGifts(Array.isArray(giftsData) ? giftsData : []);
      } else { alert(data.error || 'Không thể đổi quà'); }
    } catch (err) { alert('Lỗi kết nối'); } finally { setRedeemLoading(null); }
  };

  const handleWheelPointsDeducted = (remaining: number) => setLocalPoints(remaining);
  const handleWheelWin = (winName: string) => { setWonPrize(winName); fireConfetti(5000); };

  if (status === 'loading') return <div className="loading-screen"><Loader2 className="animate-spin" /></div>;
  if (!session) return null;

  const userData = {
    name: session.user?.name || 'User',
    role: (session.user as any)?.role || 'USER',
    avatar: customAvatar || (session.user as any)?.image || '/avatar-default.png',
    points: localPoints !== null ? localPoints : (session.user as any)?.points || 0
  };

  return (
    <main className="min-h-screen">
      <div className="app-bg" />

      <Navbar 
        user={userData} 
        userRole={userData.role} 
        handleLogout={handleLogout} 
      />

      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-[9999]" />

      <div className="dashboard-container">
        <div className="main-content-area">
          <DashboardHero 
            user={userData} 
            quotas={quotas}
            handleAvatarClick={handleAvatarClick}
            fileInputRef={fileInputRef}
            handleFileChange={handleFileChange}
          />

          <KudosForm 
            userRole={userData.role}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            searchResults={searchResults}
            setSearchResults={setSearchResults}
            selectedRecipient={selectedRecipient}
            setSelectedRecipient={setSelectedRecipient}
            cardType={cardType}
            setCardType={setCardType}
            message={message}
            setMessage={setMessage}
            sending={sending}
            successMsg={successMsg}
            handleSendKudos={handleSendKudos}
          />

          <section>
            <div className="history-header">
              <div className="flex items-center gap-3">
                <HistoryIcon className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Lịch sử hoạt động</h2>
              </div>
              <div className="history-tabs">
                <button onClick={() => setActiveTab('received')} className={`h-tab ${activeTab === 'received' ? 'active' : ''}`}>Đã nhận</button>
                <button onClick={() => setActiveTab('sent')} className={`h-tab ${activeTab === 'sent' ? 'active' : ''}`}>Đã gửi</button>
              </div>
            </div>
            <div className="glass-card" style={{ padding: '0', background: 'transparent', border: 'none' }}>
              <DashboardTable activeTab={activeTab} />
            </div>
          </section>
        </div>

        <GamificationSidebar 
          wonPrize={wonPrize}
          setWonPrize={setWonPrize}
          rewardTab={rewardTab}
          setRewardTab={setRewardTab}
          gifts={gifts}
          redeemLoading={redeemLoading}
          handleDirectRedeem={handleDirectRedeem}
          handleWheelPointsDeducted={handleWheelPointsDeducted}
          handleWheelWin={handleWheelWin}
        />
      </div>
    </main>
  );
}
