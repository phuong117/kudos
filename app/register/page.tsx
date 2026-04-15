'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, UserPlus, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import '@/styles/login.css';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Có lỗi xảy ra');
      }

      router.push('/login?registered=true');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-glow-1" style={{ background: 'rgba(6, 182, 212, 0.1)' }} />
      <div className="login-glow-2" style={{ background: 'rgba(139, 92, 246, 0.1)' }} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="login-card"
        style={{ maxWidth: '480px' }}
      >
        <Link href="/login" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-8 text-xs font-bold uppercase tracking-widest">
          <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
        </Link>

        <div className="logo-box" style={{ background: 'linear-gradient(135deg, var(--color-secondary), var(--color-primary))' }}>
          <UserPlus className="w-10 h-10 text-white" />
        </div>

        <h1 className="login-title">Đăng ký</h1>
        <p className="login-subtitle">Gia nhập NCS Kudos để bắt đầu <br />nhận và gửi những lời tri ân.</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs py-3 px-4 rounded-xl mb-6 font-bold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="credentials-form">
          <div className="form-group">
            <label>Họ và tên</label>
            <input
              type="text"
              placeholder="Nguyễn Minh Minh"
              className="login-input"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              placeholder="email@ncsgroup.vn"
              className="login-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                placeholder="••••••••"
                className="login-input"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Xác nhận</label>
              <input
                type="password"
                placeholder="••••••••"
                className="login-input"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                required
              />
            </div>
          </div>
          <button type="submit" className="submit-login-btn" disabled={loading} style={{ marginTop: '10px' }}>
            {loading ? (
              <span className="flex items-center gap-2 justify-center">
                <Loader2 className="w-4 h-4 animate-spin" /> Đang tạo tài khoản...
              </span>
            ) : 'Đăng ký'}
          </button>
        </form>

        <div className="security-tag" style={{ marginTop: '40px' }}>
          <ShieldCheck className="w-3.5 h-3.5" /> Dữ liệu được bảo mật bởi NCS Group
        </div>
      </motion.div>
    </div>
  );
}
