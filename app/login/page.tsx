'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck, ArrowRight, Mail, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import '@/styles/login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleMSSO = () => {
    signIn('azure-ad', { callbackUrl: '/' });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await signIn('credentials', {
      email,
      password,
      callbackUrl: '/'
    });
    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-glow-1" />
      <div className="login-glow-2" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
        style={{ maxWidth: '480px' }}
      >
        <div className="logo-box">
          <img src="/logo_ncs.png" alt="Logo" />
        </div>

        <h1 className="login-title">NCS Kudos</h1>
        <p className="login-subtitle">
          Hệ thống tri ân và khen thưởng nội bộ. <br />
          Chọn phương thức để tiếp tục.
        </p>

        {/* Credentials Form */}
        <form onSubmit={handleCredentialsLogin} className="credentials-form">
          <div className="form-group">
            <label>Tài khoản</label>
            <div className="relative">
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nguyenminhminh@ncsgroup.vn"
                className="login-input"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Mật khẩu</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="login-input"
              required
            />
          </div>
          <button type="submit" className="submit-login-btn" disabled={loading}>
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="login-separator">Hoặc đăng nhập nhanh</div>

        <button onClick={handleMSSO} className="ms-button group">
          <svg className="w-5 h-5" viewBox="0 0 23 23">
            <path fill="#f3f3f3" d="M0 0h11v11H0z" />
            <path fill="#f3f3f3" d="M12 0h11v11H12z" />
            <path fill="#f25022" d="M1.5 1.5h8v8h-8z" />
            <path fill="#7fba00" d="M13.5 1.5h8v8h-8z" />
            <path fill="#00a4ef" d="M1.5 13.5h8v8h-8z" />
            <path fill="#ffb900" d="M13.5 13.5h8v8h-8z" />
          </svg>
          Microsoft SSO
          <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
        </button>

        <div className="security-tag">
          <ShieldCheck className="w-3.5 h-3.5" /> Bảo mật NCS Group
        </div>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-gray-500 text-xs">
            Bạn chưa có tài khoản?{' '}
            <Link href="/register" className="text-secondary font-bold hover:underline ml-1">
              Thêm tài khoản mới
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
