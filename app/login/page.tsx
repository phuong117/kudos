'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { ShieldCheck, ArrowRight, Mail, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import '@/styles/login.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMSSO = () => {
    signIn('azure-ad', { callbackUrl: '/' });
  };

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl: '/'
      });

      if (result?.error) {
        setError('Tài khoản hoặc mật khẩu không chính xác');
      } else {
        window.location.href = '/';
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glow-1" />
      <div className="login-glow-2" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
        style={{ maxWidth: '440px' }}
      >
        <div className="logo-login">
          <img src="/logo_ncs.png" alt="Logo" />
        </div>

        <h1 className="login-title">NCS Kudos</h1>
        <p className="login-subtitle">
          Hệ thống tri ân và khen thưởng nội bộ.<br />
          Chọn phương thức để tiếp tục.
        </p>

        {/* --- MICROSOFT SSO - MỚI & ƯU TIÊN --- */}
        <div className="sso-primary-container">
          <button onClick={handleMSSO} className="ms-button-creative group">
            <div className="ms-icon-wrapper pulse-animation">
              <svg className="w-6 h-6" viewBox="0 0 23 23">
                <path fill="#f3f3f3" d="M0 0h11v11H0z" />
                <path fill="#f3f3f3" d="M12 0h11v11H12z" />
                <path fill="#f25022" d="M1.5 1.5h8v8h-8z" />
                <path fill="#7fba00" d="M13.5 1.5h8v8h-8z" />
                <path fill="#00a4ef" d="M1.5 13.5h8v8h-8z" />
                <path fill="#ffb900" d="M13.5 13.5h8v8h-8z" />
              </svg>
            </div>
            <div className="ms-text-content">
              <span className="ms-main-text">Microsoft SSO</span>
              <span className="ms-sub-text">Đăng nhập tài khoản công ty</span>
            </div>
            <ArrowRight className="w-5 h-5 ml-auto translate-x-0 group-hover:translate-x-1 transition-transform bounce-animation" />
            <div className="shine-effect"></div>
          </button>
          
          <div className="recommendation-tag">
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span>Khuyến nghị cho toàn bộ nhân viên NCS Group</span>
          </div>
        </div>

        <div className="login-separator">
          <span>HOẶC ĐĂNG NHẬP KHÁC</span>
        </div>

        <form onSubmit={handleCredentialsLogin} className="credentials-form">
          <div className="form-group">
            <label>Tài khoản</label>
            <input 
              type="text" 
              className="login-input" 
              placeholder="nguyenvanA@ncsgroup.vn"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Mật khẩu</label>
            <input 
              type="password" 
              className="login-input" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="text-red-500 text-xs font-bold text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="submit-login-btn"
          >
            {loading ? 'Đang xác thực...' : 'Đăng nhập'}
          </button>
        </form>

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
