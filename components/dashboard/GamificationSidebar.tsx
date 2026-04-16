'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Zap, Gift, Loader2, ChevronRight, Sparkles } from 'lucide-react';
import LuckyWheel, { giftsToWheelPrizes } from './LuckyWheel';

interface GamificationSidebarProps {
  wonPrize: string | null;
  setWonPrize: (p: string | null) => void;
  rewardTab: 'direct' | 'wheel_100' | 'wheel_50';
  setRewardTab: (t: 'direct' | 'wheel_100' | 'wheel_50') => void;
  gifts: any[];
  redeemLoading: string | null;
  handleDirectRedeem: (gift: any) => void;
  handleWheelPointsDeducted: (remaining: number) => void;
  handleWheelWin: (winName: string) => void;
}

export default function GamificationSidebar({
  wonPrize,
  setWonPrize,
  rewardTab,
  setRewardTab,
  gifts,
  redeemLoading,
  handleDirectRedeem,
  handleWheelPointsDeducted,
  handleWheelWin
}: GamificationSidebarProps) {
  return (
    <div className="sidebar-content">
      <AnimatePresence>
        {wonPrize && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="win-notification-creative mb-6"
          >
            <div className="relative z-10 text-center">
              <motion.div
                animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="inline-block mb-4"
              >
                <Trophy className="w-12 h-12 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              </motion.div>
              <p className="text-white/70 text-[10px] uppercase font-black tracking-[0.3em] mb-2 flex items-center justify-center gap-2">
                <Sparkles className="w-3 h-3 text-purple-300" />
                Tuyệt vời! Bạn đã trúng:
                <Sparkles className="w-3 h-3 text-purple-300" />
              </p>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-lg leading-none mb-6">{wonPrize}</h3>
              <button
                onClick={() => setWonPrize(null)}
                className="w-full py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-[10px] font-black uppercase tracking-widest border border-white/20 transition-all active:scale-95"
              >
                Đóng thông báo
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <section className="kudos-form-card" style={{ padding: '0' }}>
        <div className="p-6 border-b border-white/5 flex items-center gap-3">
          <Zap className="w-5 h-5 text-primary flex-shrink-0" />
          <h2 className="text-sm font-black uppercase tracking-widest text-[#888]">Gamification</h2>
        </div>

        <div className="p-4 space-y-6">
          <div className="tab-switcher-creative">
            <button onClick={() => setRewardTab('direct')} className={`tab-btn-creative ${rewardTab === 'direct' ? 'active' : ''}`}>Đổi 300</button>
            <button onClick={() => setRewardTab('wheel_100')} className={`tab-btn-creative ${rewardTab === 'wheel_100' ? 'active' : ''}`}>Quay 100</button>
            <button onClick={() => setRewardTab('wheel_50')} className={`tab-btn-creative ${rewardTab === 'wheel_50' ? 'active' : ''}`}>Quay 50</button>
          </div>

          <AnimatePresence mode="wait">
            {rewardTab === 'direct' && (
              <motion.div key="direct" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-4">
                {gifts.filter(g => g.pointCost === 300).length > 0 ? (
                  gifts.filter(g => g.pointCost === 300).map((gift) => (
                    <div key={gift.id} className="stat-box cursor-pointer hover:border-primary/30 hover:bg-primary/5 transition-all" style={{ padding: '16px' }} onClick={() => handleDirectRedeem(gift)}>
                      <div className="w-14 h-14 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center border border-white/5">
                        <Gift className="w-6 h-6 text-primary opacity-40" />
                      </div>
                      <div className="flex-1 ml-4">
                        <div className="text-[13px] font-black text-white leading-tight uppercase tracking-wide">{gift.name}</div>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[11px] text-primary font-black bg-primary/10 px-2 py-0.5 rounded-md">{gift.pointCost} PTS</span>
                          <span className="text-[10px] text-gray-500 font-bold">Còn {gift.stock} cái</span>
                        </div>
                      </div>
                      {redeemLoading === gift.id ? <Loader2 className="w-5 h-5 text-primary animate-spin" /> : <ChevronRight className="w-5 h-5 text-gray-700" />}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-16 text-[11px] text-gray-500 font-bold uppercase tracking-widest bg-white/[0.02] border border-dashed border-white/5 rounded-3xl">Chưa có quà đổi trực tiếp (300 PTS).</div>
                )}
              </motion.div>
            )}

            {rewardTab === 'wheel_100' && (
              <motion.div key="wheel_100" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col items-center py-6">
                <div className="transform scale-[0.85] origin-center -my-8">
                  <LuckyWheel
                    prizes={giftsToWheelPrizes(gifts.filter(g => g.pointCost === 100))}
                    wheelType="wheel_100"
                    onPointsDeducted={handleWheelPointsDeducted}
                    onWin={handleWheelWin}
                  />
                </div>
                <div className="text-center mt-12 space-y-3">
                  <div className="recommendation-tag w-fit mx-auto">
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>Vòng quay cao cấp</span>
                  </div>
                  <div className="text-2xl text-white font-black tracking-tighter">100 ĐIỂM / LƯỢT</div>
                </div>
              </motion.div>
            )}

            {rewardTab === 'wheel_50' && (
              <motion.div key="wheel_50" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="flex flex-col items-center py-6">
                <div className="transform scale-[0.85] origin-center -my-8">
                  <LuckyWheel
                    prizes={giftsToWheelPrizes(gifts.filter(g => g.pointCost === 50))}
                    wheelType="wheel_50"
                    onPointsDeducted={handleWheelPointsDeducted}
                    onWin={handleWheelWin}
                  />
                </div>
                <div className="text-center mt-12 space-y-3">
                  <div className="recommendation-tag w-fit mx-auto" style={{ color: '#00a4ef', borderColor: 'rgba(0,164,239,0.2)' }}>
                    <Zap className="w-3 h-3 text-blue-400" />
                    <span>Vòng quay phổ thông</span>
                  </div>
                  <div className="text-2xl text-white font-black tracking-tighter">50 ĐIỂM / LƯỢT</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}
