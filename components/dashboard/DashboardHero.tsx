'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Star, Heart, Award, Trophy, Plus } from 'lucide-react';

interface DashboardHeroProps {
  user: {
    name: string;
    role: string;
    avatar: string;
    points: number;
  };
  quotas: {
    thankYouRemaining: number;
    greatJobRemaining: number;
  };
  handleAvatarClick: () => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function DashboardHero({
  user,
  quotas,
  handleAvatarClick,
  fileInputRef,
  handleFileChange
}: DashboardHeroProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="user-hero-card"
    >
      <div
        className="user-avatar-container cursor-pointer group relative overflow-hidden"
        onClick={handleAvatarClick}
        title="Đổi ảnh đại diện"
      >
        <img src={user.avatar} className="user-avatar-img group-hover:scale-110 transition-transform duration-500" alt="Profile" />
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Plus className="text-white w-8 h-8" />
        </div>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="user-info-text">
        <div className="flex items-center gap-3 mb-2">
          <h1>{user.name}</h1>
          <span className={`role-badge ${user.role === 'LEADER' ? 'role-leader' : user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
            {user.role}
          </span>
        </div>
        <div className="flex flex-wrap gap-8 mt-1">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-500/10 rounded-xl flex items-center justify-center">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
            </div>
            <div>
              <div className="stat-label">Điểm tích lũy</div>
              <div className="stat-value text-yellow-500 font-bold">{user.points.toLocaleString()} pts</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <div className="stat-label">Thank You còn lại</div>
              <div className="stat-value text-black font-bold">
                {user.role === 'ADMIN' ? '∞' : quotas.thankYouRemaining}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Award className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <div className="stat-label">Great Job còn lại</div>
              <div className="stat-value text-black font-bold">
                {user.role === 'ADMIN' ? '∞' : quotas.greatJobRemaining}
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
