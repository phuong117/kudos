'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, LogOut } from 'lucide-react';

interface NavbarProps {
  user: {
    name: string;
    role: string;
    avatar: string;
  };
  userRole: string;
  handleLogout: () => void;
}

export default function Navbar({ user, userRole, handleLogout }: NavbarProps) {
  return (
    <nav className="header">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <div className="logo-navbar">
          <img src="/logo_ncs.png" alt="Logo" />
        </div>
          <span className="text-sm font-black tracking-tighter uppercase">NCS Kudos</span>
        </div>

        {userRole === 'ADMIN' && (
          <Link href="/admin/gifts" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider hover:bg-primary/20 transition-all">
            <Shield className="w-3 h-3" /> Admin Portal
          </Link>
        )}
      </div>
      <div className="flex items-center gap-4">
        <div className="hidden sm:block text-right">
          <div className="text-xs font-black text-white leading-none">{user.name}</div>
          <div className="role-badge role-leader mt-1" style={{ fontSize: '8px', padding: '2px 8px' }}>{user.role}</div>
        </div>
        <div className="flex items-center gap-2">
          <img src={user.avatar} className="w-9 h-9 rounded-xl border border-white/10" alt="Avatar" />
          <button
            onClick={handleLogout}
            className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-gray-400 hover:text-red-500 hover:bg-red-500/10 transition-all font-bold"
            title="Đăng xuất"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </nav>
  );
}
