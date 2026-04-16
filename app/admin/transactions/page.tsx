'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowUpRight,
  ArrowDownLeft,
  Download,
  Loader2
} from 'lucide-react';

export default function TransactionsAdmin() {
  const [txs, setTxs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTxs = async () => {
    try {
      const res = await fetch('/api/admin/transactions');
      if (res.ok) {
        const data = await res.json();
        setTxs(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTxs();
  }, []);

  const getActionLabel = (action: string) => {
    if (action === 'redeem_gift' || action === 'spin_wheel') return 'ĐỔI QUÀ';
    if (action.startsWith('receive_card_')) return 'NHẬN THẺ KUDOS';
    if (action === 'admin_adjustment') return 'ADMIN ĐIỀU CHỈNH';
    return action.toUpperCase();
  };

  const filteredTxs = txs.filter(tx => {
    const searchLower = search.toLowerCase();
    const actionLabel = getActionLabel(tx.action).toLowerCase();
    const dateStr = new Date(tx.createdAt).toLocaleDateString('vi-VN').toLowerCase();
    const pointStr = `${tx.pointChange > 0 ? '+' : ''}${tx.pointChange} pts`.toLowerCase();

    return (
      tx.id.toLowerCase().includes(searchLower) ||
      tx.user.name.toLowerCase().includes(searchLower) ||
      tx.user.email.toLowerCase().includes(searchLower) ||
      actionLabel.includes(searchLower) ||
      (tx.message && tx.message.toLowerCase().includes(searchLower)) ||
      pointStr.includes(searchLower) ||
      dateStr.includes(searchLower) ||
      (tx.detail && tx.detail.toLowerCase().includes(searchLower))
    );
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Người thực hiện', 'Email', 'Nghiệp vụ', 'Chi tiết', 'Lời nhắn', 'Biến động', 'Ngày thực hiện'];
    const rows = filteredTxs.map(tx => [
      tx.id,
      tx.user.name,
      tx.user.email,
      getActionLabel(tx.action),
      tx.detail || '-',
      tx.message || '-',
      `${tx.pointChange} PTS`,
      new Date(tx.createdAt).toLocaleString('vi-VN')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bao-cao-giao-dich-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-black font-black text-4xl tracking-tighter">Lịch sử hệ thống</h1>
          <p className="text-black/70 text-xs mt-1 font-bold">Theo dõi luồng lưu thông điểm số, lịch gửi thẻ và đổi quà toàn hệ thống.</p>
        </div>
        <button
          onClick={exportToCSV}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-primary-glow text-white rounded-xl font-black text-[10px] uppercase tracking-wider hover:brightness-110 transition-all shadow-xl shadow-[var(--color-primary)]/20"
        >
          <Download className="w-4 h-4" /> Xuất báo cáo CSV
        </button>
      </div>

      <div className="admin-content-card">
        <div className="flex items-center justify-between px-8 py-6 border-b border-white/5 bg-white/[0.01]">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder=" Tìm kiếm..."
            className="bg-transparent border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-primary w-80 transition-all placeholder:text-gray-600 font-medium"
          />
        </div>

        <table className="glass-table">
          <thead>
            <tr>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4 px-8">ID</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4">Người thực hiện</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4">Nghiệp vụ</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4">Lời nhắn</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4">Biến động</th>
              <th className="text-left text-[10px] uppercase tracking-widest text-gray-500 font-black py-4">Ngày thực hiện</th>
              <th className="text-right text-[10px] uppercase tracking-widest text-gray-500 font-black py-4 px-8">Chi tiết</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Đang tải dữ liệu...</span>
                  </div>
                </td>
              </tr>
            ) : filteredTxs.length > 0 ? filteredTxs.map((tx) => (
              <tr key={tx.id} className="hover:bg-white/[0.02] transition-colors">
                <td className="px-8">
                  <span className="font-mono text-[10px] font-black tracking-widest text-primary border border-primary/20 bg-primary/5 px-2 py-1 rounded-md">{tx.id.substring(0, 8).toUpperCase()}</span>
                </td>
                <td>
                  <div className="flex flex-col">
                    <span className="font-bold text-white text-sm">{tx.user.name}</span>
                    <span className="text-[10px] text-gray-600 font-medium">{tx.user.email}</span>
                  </div>
                </td>
                <td>
                  <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">{getActionLabel(tx.action)}</span>
                </td>
                <td>
                  <div className="max-w-[150px] truncate group relative">
                    <span className="text-[10px] font-medium text-gray-600 italic">
                      {tx.message && tx.message !== '-' ? `"${tx.message}"` : '-'}
                    </span>
                    {tx.message && tx.message !== '-' && (
                      <div className="absolute left-0 bottom-full mb-2 hidden group-hover:block z-50 bg-secondary p-3 rounded-lg border border-white/10 w-64 shadow-2xl text-[10px] text-white whitespace-normal font-medium leading-relaxed">
                        {tx.message}
                      </div>
                    )}
                  </div>
                </td>
                <td>
                  <div className={`flex items-center gap-1 font-black px-3 py-1.5 rounded-lg border w-fit text-[11px] ${tx.pointChange > 0 ? 'text-green-500 bg-green-500/10 border-green-500/10' : 'text-red-400 bg-red-500/10 border-red-500/10'}`}>
                    {tx.pointChange > 0 ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                    {tx.pointChange > 0 ? `+${tx.pointChange}` : tx.pointChange} PTS
                  </div>
                </td>
                <td>
                  <span className="text-xs font-bold text-gray-500">{new Date(tx.createdAt).toLocaleDateString('vi-VN')}</span>
                </td>
                <td className="text-right px-8">
                  <span className="text-[10px] uppercase font-black tracking-widest text-primary border border-primary/20 bg-primary/5 px-3 py-1.5 rounded-lg">
                    {tx.detail || '-'}
                  </span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="text-center py-20">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Không tìm thấy giao dịch nào</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {!loading && filteredTxs.length > 0 && (
          <div className="px-8 py-6 flex justify-between items-center text-[10px] text-gray-600 font-black uppercase tracking-widest border-t border-white/5 bg-white/[0.01]">
            <div>Hiển thị {filteredTxs.length} Hoạt động</div>
          </div>
        )}
      </div>
    </div>
  );
}
