'use client';

import React, { useEffect, useState } from 'react';
import {
  Heart,
  Award,
  Calendar,
  Filter
} from 'lucide-react';

interface HistoryLog {
  id: string;
  type: string;
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  date: string;
  points: number;
  message: string;
}

export default function DashboardTable({ activeTab = 'received' }: { activeTab?: string }) {
  const [logs, setLogs] = useState<HistoryLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/users/history?type=${activeTab}`);
        if (res.ok) {
          const data = await res.json();
          setLogs(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, [activeTab]);

  return (
    <div className="glass-card p-0 overflow-hidden border-white/5 bg-transparent">
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white/[0.02]">
        <div className="w-full sm:w-auto">
          <input
            type="text"
            placeholder="Tìm kiếm..."
            className="minimal-search"
          />
        </div>

        <div className="flex items-center gap-2">
          <button className="btn btn-secondary py-2 px-4 text-xs">
            <Filter className="w-3.5 h-3.5" /> Lọc
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="text-gray-500 font-medium uppercase tracking-wider bg-white/[0.01]">
              <th className="px-6 py-4 whitespace-nowrap">Loại thẻ</th>
              <th className="px-6 py-4 whitespace-nowrap">Từ</th>
              <th className="px-6 py-4 whitespace-nowrap">Đến</th>
              <th className="px-6 py-4 whitespace-nowrap">Ngày gửi</th>
              <th className="px-6 py-4 whitespace-nowrap">Điểm</th>
              <th className="px-6 py-4 min-w-[200px]">Lời nhắn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic text-xs">
                  Đang tải dữ liệu...
                </td>
              </tr>
            ) : logs.length > 0 ? logs.map((log) => (
              <tr key={log.id} className="hover:bg-white/[0.03] transition-colors group">
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-[10px] font-bold">
                    <span className="px-3 py-1.5 rounded-full bg-blue-100 text-blue-700 uppercase tracking-tighter">
                      {log.type.replace('_', ' ')}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-black font-bold text-xs">{log.fromName}</span>
                    <span className="text-primary font-medium text-[10px]">{log.fromEmail}</span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex flex-col">
                    <span className="text-black font-bold text-xs">{log.toName}</span>
                    <span className="text-primary font-medium text-[10px]">{log.toEmail}</span>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-black text-xs">
                  {new Date(log.date).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }).replace(/\//g, '-')}
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="font-mono font-bold text-green-400 text-xs">{log.points} pts</span>
                </td>
                <td className="px-6 py-5">
                  <span className="text-gray-400 text-xs italic">"{log.message}"</span>
                </td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-gray-500 italic text-xs">
                  Chưa có dữ liệu hoạt động nào.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
