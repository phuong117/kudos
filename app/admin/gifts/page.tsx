'use client';

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit2,
  Pencil,
  Trash2,
  Package,
  Gift as GiftIcon,
  ArrowUpDown,
  X,
  Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function GiftsAdmin() {
  const [gifts, setGifts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentGift, setCurrentGift] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    pointCost: '300',
    stock: '10'
  });

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/gifts');
      const data = await res.json();
      setGifts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const url = currentGift ? `/api/gifts/${currentGift.id}` : '/api/gifts';
    const method = currentGift ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        setFormData({ name: '', pointCost: '300', stock: '10' });
        setCurrentGift(null);
        fetchGifts();
      } else {
        const data = await res.json();
        alert(data.error || 'Có lỗi xảy ra');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa quà tặng này?')) return;

    try {
      const res = await fetch(`/api/gifts/${id}`, { method: 'DELETE' });
      if (res.ok) fetchGifts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-black text-2xl tracking-tighter">Quà tặng</h1>
          <p className="text-black/60 text-xs mt-1 font-bold">Hệ thống đổi quà tự động trừ tồn kho.</p>
        </div>
        <button
          onClick={() => { setCurrentGift(null); setFormData({ name: '', pointCost: '300', stock: '10' }); setShowModal(true); }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-glow text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[var(--color-primary)]/20"
        >
          <Plus className="w-4 h-4" /> Thêm quà mới
        </button>
      </div>

      <div className="admin-content-card">
        <table className="glass-table">
          <thead>
            <tr>
              <th className="text-left">Quà tặng</th>
              <th className="text-left">Điểm đổi</th>
              <th className="text-left">Tồn kho</th>
              <th className="text-left">Hình thức</th>
              <th className="text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(gifts) && gifts.map((gift) => (
              <tr key={gift.id}>
                <td>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
                      <GiftIcon className="w-6 h-6 text-primary opacity-40" />
                    </div>
                    <span className="font-bold text-white">{gift.name}</span>
                  </div>
                </td>
                <td><span className="font-black text-primary bg-primary/10 px-3 py-1.5 rounded-lg text-[11px]">{gift.pointCost} PTS</span></td>
                <td><span className="text-gray-300 font-bold">{gift.stock} cái</span></td>
                <td><span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">{gift.pointCost === 300 ? 'Đổi trực tiếp' : gift.pointCost === 100 ? 'Vòng quay Cao Cấp' : gift.pointCost === 50 ? 'Vòng quay Phổ Thông' : 'Khác'}</span></td>
                <td className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button onClick={() => { setCurrentGift(gift); setFormData({ name: gift.name, pointCost: gift.pointCost.toString(), stock: gift.stock.toString() }); setShowModal(true); }} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(gift.id)} className="p-2.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modern Modal */}
      {showModal && (
        <div className="admin-modal-overlay">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="admin-modal-content"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>

            <h2 className="mb-10">{currentGift ? 'Cập nhật quà tặng' : 'Thêm quà tặng mới'}</h2>

            <form onSubmit={handleSubmit}>
              <div className="admin-input-group">
                <label>Tên quà tặng</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="admin-input"
                  placeholder="Ví dụ: Voucher NCS 100k..."
                  required
                />
              </div>

              <div className="form-row">
                <div className="admin-input-group">
                  <label>Điểm đổi</label>
                  <select
                    value={formData.pointCost}
                    onChange={(e) => setFormData({ ...formData, pointCost: e.target.value })}
                    className="admin-input"
                  >
                    <option value="50">50 PTS</option>
                    <option value="100">100 PTS</option>
                    <option value="300">300 PTS</option>
                  </select>
                </div>
                <div className="admin-input-group">
                  <label>Số lượng tồn</label>
                  <input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="admin-input"
                    placeholder="10"
                    required
                  />
                </div>
              </div>

              <div className="admin-input-group mt-6">
                <label>Phân loại (Tự động theo điểm)</label>
                <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl flex items-center gap-3">
                  <span className="text-[10px] uppercase font-black text-primary p-2 bg-primary/10 rounded-lg">{formData.pointCost === '300' ? 'ĐỔI TRỰC TIẾP' : formData.pointCost === '100' ? 'VÒNG QUAY CAO CẤP' : formData.pointCost === '50' ? 'VÒNG QUAY PHỔ THÔNG' : 'CHƯA PHÂN LOẠI'}</span>
                  <span className="text-xs text-gray-500 font-bold">Hãy chỉnh sửa Điểm đổi để tự động phân loại phần quà.</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="modal-submit-btn"
              >
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (currentGift ? 'Cập nhật ngay' : 'Tạo quà tặng mới')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
