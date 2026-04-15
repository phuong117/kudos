'use client';

import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Shield,
  Star,
  X,
  Loader2,
  Mail,
  User as UserIcon
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function UsersAdmin() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER',
    total_points: '0',
    thank_you_quota: '2',
    great_job_quota: '0',
    password: ''
  });

  const resetAllQuotas = async () => {
    if (!confirm('Bạn có chắc chắn muốn làm mới hạn mức thẻ cho TOÀN BỘ nhân sự? (TY=2, GJ=2/0 tùy vai trò)')) return;
    try {
      const res = await fetch('/api/admin/users/reset-quotas', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        fetchUsers();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Lỗi kết nối');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      } else {
        setErrorMessage(data.error || 'Không thể tải danh sách');
      }
    } catch (err) {
      setErrorMessage('Lỗi kết nối máy chủ');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const url = currentUser ? `/api/admin/users/${currentUser.id}` : '/api/admin/users';
    const method = currentUser ? 'PATCH' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setShowModal(false);
        resetForm();
        fetchUsers();
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
    if (!confirm('Bạn có chắc chắn muốn xóa nhân sự này?')) return;

    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
      if (res.ok) fetchUsers();
      else {
        const data = await res.json();
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEdit = (user: any) => {
    setCurrentUser(user);
    setFormData({
      name: user.name || '',
      email: user.email,
      role: user.role,
      total_points: user.total_points.toString(),
      thank_you_quota: (user.thank_you_quota || 0).toString(),
      great_job_quota: (user.great_job_quota || 0).toString(),
      password: ''
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setCurrentUser(null);
    setFormData({ name: '', email: '', role: 'USER', total_points: '0', thank_you_quota: '2', great_job_quota: '0', password: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-black text-4xl tracking-tighter">Nhân sự & Điểm</h1>
          <p className="text-black/70 text-xs mt-1 font-bold">Quản lý vai trò và điều chỉnh điểm tích lũy.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={resetAllQuotas}
            className="flex items-center gap-2 px-6 py-3 bg-white/5 border border-black/10 text-black rounded-xl font-black text-[10px] uppercase tracking-wider hover:bg-black/5 transition-all"
          >
            Làm mới hạn mức thẻ
          </button>
          <button 
            onClick={() => { resetForm(); setShowModal(true); }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-glow text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[var(--color-primary)]/20"
          >
            <Plus className="w-4 h-4" /> Thêm nhân sự mới
          </button>
        </div>
      </div>

      <div className="admin-content-card">
        {errorMessage && (
          <div className="p-8 m-8 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-center font-bold">
            {errorMessage}
            <button onClick={fetchUsers} className="block mx-auto mt-2 text-xs underline opacity-70 hover:opacity-100 transition-all">Thử lại</button>
          </div>
        )}
        
        {loading ? (
          <div className="p-12 text-center text-gray-500"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" /> Đang tải...</div>
        ) : (
          <table className="glass-table">
            <thead>
              <tr>
                <th className="text-left">Họ & Tên / Email</th>
                <th className="text-left">Vai trò</th>
                <th className="text-left">Điểm tích lũy</th>
                <th className="text-left">Quota TY</th>
                <th className="text-left">Quota GJ</th>
                <th className="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(users) && users.map((user) => (
                <tr key={user.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-white/5 rounded-full flex items-center justify-center text-primary font-black text-xs">
                        {user.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{user.name}</div>
                        <div className="text-[10px] text-gray-500 font-bold">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : user.role === 'LEADER' ? 'role-leader' : 'role-user'}`} style={{ fontSize: '9px' }}>
                      {user.role}
                    </div>
                  </td>
                  <td>
                    <span className="font-black text-white bg-white/5 px-3 py-1.5 rounded-lg text-[11px] border border-white/5">
                      {user.total_points || 0} PTS
                    </span>
                  </td>
                  <td>
                    <span className="font-bold text-gray-400 text-xs">{user.thank_you_quota ?? 2}</span>
                  </td>
                  <td>
                    <span className="font-bold text-gray-400 text-xs">{user.great_job_quota ?? 0}</span>
                  </td>
                  <td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { 
                        setCurrentUser(user); 
                        setFormData({ 
                          name: user.name, 
                          email: user.email, 
                          role: user.role, 
                          password: '', 
                          total_points: user.total_points.toString(),
                          thank_you_quota: (user.thank_you_quota ?? 2).toString(),
                          great_job_quota: (user.great_job_quota ?? 0).toString()
                        }); 
                        setShowModal(true); 
                      }} className="p-2.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="p-2.5 rounded-lg bg-red-500/5 hover:bg-red-500/10 text-red-500/50 hover:text-red-500 transition-all">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="admin-modal-content"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-8 right-8 text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
            <h2 className="mb-10">{currentUser ? 'Cập nhật nhân sự' : 'Thêm nhân sự mới'}</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="admin-input-group">
                <label>Họ và tên</label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="admin-input" placeholder="Nguyễn Văn A" required />
              </div>

              <div className="admin-input-group">
                <label>Email</label>
                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="admin-input" placeholder="email@ncsgroup.vn" required />
              </div>

              {!currentUser && (
                <div className="admin-input-group">
                  <label>Mật khẩu ban đầu</label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="admin-input" placeholder="••••••••" required />
                </div>
              )}

              <div className="form-row">
                <div className="admin-input-group">
                  <label>Vai trò</label>
                  <select value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="admin-input">
                    <option value="USER">USER (Nhân viên)</option>
                    <option value="LEADER">LEADER (Lãnh đạo)</option>
                    <option value="ADMIN">ADMIN (Quản trị)</option>
                  </select>
                </div>
                <div className="admin-input-group">
                  <label>Điểm tích lũy</label>
                  <input type="number" value={formData.total_points} onChange={(e) => setFormData({...formData, total_points: e.target.value})} className="admin-input" required />
                </div>
              </div>

              <div className="form-row mt-4">
                <div className="admin-input-group">
                  <label>Quota Thank You</label>
                  <input type="number" value={formData.thank_you_quota} onChange={(e) => setFormData({...formData, thank_you_quota: e.target.value})} className="admin-input" required />
                </div>
                <div className="admin-input-group">
                  <label>Quota Great Job</label>
                  <input type="number" value={formData.great_job_quota} onChange={(e) => setFormData({...formData, great_job_quota: e.target.value})} className="admin-input" required />
                </div>
              </div>

              <button type="submit" disabled={isSubmitting} className="modal-submit-btn">
                {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (currentUser ? 'Cập nhật tài khoản' : 'Tạo tài khoản')}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
