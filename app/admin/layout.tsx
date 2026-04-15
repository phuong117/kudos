'use client';

import React from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Gift,
  User as UserIcon,
  History as HistoryIcon,
  LogOut,
  ChevronLeft
} from 'lucide-react';
import '@/styles/admin.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="min-h-screen bg-[#050507] flex items-center justify-center text-white">Đang tải...</div>;
  }

  if (!session || (session?.user as any)?.role !== 'ADMIN') {
    router.replace('/');
    return null;
  }

  const menuItems = [
    { name: 'Quà tặng', icon: Gift, path: '/admin/gifts' },
    { name: 'Nhân sự & Điểm', icon: UserIcon, path: '/admin/users' },
    { name: 'Lịch sử thẻ', icon: HistoryIcon, path: '/admin/transactions' },
  ];

  return (
    <div className="min-h-screen">
      <div className="app-bg" />

      {/* Admin specific header */}
      <nav className="header">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2 text-black/60 hover:text-black transition-all">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-[10px] font-black uppercase tracking-widest">Quay lại User</span>
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center font-black text-xs shadow-lg shadow-primary/20">A</div>
            <span className="text-sm font-black tracking-tighter uppercase text-black">Admin Portal</span>
          </div>
        </div>
        <div className="role-badge role-admin" style={{ fontSize: '10px' }}>ADMIN MODE</div>
      </nav>

      <div className="admin-container">
        {/* Sidebar */}
        <div className="admin-sidebar shadow-2xl">
          <Link href="/admin/gifts" className={`admin-nav-item ${pathname === '/admin/gifts' ? 'active' : ''}`}>
            <Gift className="w-5 h-5" /> Quà tặng
          </Link>
          <Link href="/admin/users" className={`admin-nav-item ${pathname === '/admin/users' ? 'active' : ''}`}>
            <UserIcon className="w-5 h-5" /> Nhân sự & Điểm
          </Link>
          <Link href="/admin/transactions" className={`admin-nav-item ${pathname === '/admin/transactions' ? 'active' : ''}`}>
            <HistoryIcon className="w-5 h-5" /> Lịch sử hệ thống
          </Link>

          <div className="my-4 h-px bg-white/5" />

          <button onClick={() => signOut({ callbackUrl: '/login' })} className="admin-nav-item text-red-500/70 hover:bg-red-500/10 hover:text-red-500">
            <LogOut className="w-4 h-4" /> Đăng xuất
          </button>
        </div>

        {/* Content Area */}
        <div className="admin-main-content">
          {children}
        </div>
      </div>
    </div>
  );
}
