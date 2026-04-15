'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Send, Heart, Award, Lock, X, Loader2, CheckCircle2 } from 'lucide-react';

interface KudosFormProps {
  userRole: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: any[];
  setSearchResults: (results: any[]) => void;
  selectedRecipient: any;
  setSelectedRecipient: (r: any) => void;
  cardType: string;
  setCardType: (t: 'THANK_YOU' | 'GREAT_JOB') => void;
  message: string;
  setMessage: (m: string) => void;
  sending: boolean;
  successMsg: string;
  handleSendKudos: () => void;
}

export default function KudosForm({
  userRole,
  searchQuery,
  setSearchQuery,
  searchResults,
  setSearchResults,
  selectedRecipient,
  setSelectedRecipient,
  cardType,
  setCardType,
  message,
  setMessage,
  sending,
  successMsg,
  handleSendKudos
}: KudosFormProps) {
  return (
    <section className="kudos-form-card overflow-visible">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Send className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-bold">Gửi Thẻ Kudos</h2>
        </div>
        <div className="text-[10px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-full text-gray-500 font-bold uppercase tracking-widest">
          Quota: {userRole === 'ADMIN' ? 'Không giới hạn' : '2 thẻ / tháng'}
        </div>
      </div>

      {successMsg && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-3 text-green-500 text-sm font-bold">
          <CheckCircle2 className="w-5 h-5" /> {successMsg}
        </motion.div>
      )}

      <div className="form-grid">
        <div className="space-y-6">
          <div className="form-group relative">
            <label>Người nhận</label>
            {selectedRecipient ? (
              <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-[10px] font-black">{selectedRecipient.name.charAt(0)}</div>
                  <div>
                    <div className="text-xs font-black text-white leading-tight">{selectedRecipient.name}</div>
                    <div className="text-[9px] text-primary font-bold">{selectedRecipient.email}</div>
                  </div>
                </div>
                <button onClick={() => setSelectedRecipient(null)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Gõ tên để tìm đồng nghiệp..."
                  className="minimal-search"
                />
                {searchResults.length > 0 && (
                  <div className="absolute z-10 top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-xl border border-black/5 rounded-2xl overflow-hidden shadow-[0_10px_40px_rgba(0,0,0,0.1)]">
                    {searchResults.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { setSelectedRecipient(r); setSearchResults([]); }}
                        className="w-full p-4 flex items-center gap-3 hover:bg-primary/10 transition-all text-left border-b border-black/5 last:border-none"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-black">{r.name.charAt(0)}</div>
                        <div>
                          <div className="text-xs font-black text-black leading-tight">{r.name}</div>
                          <div className="text-[9px] text-gray-500 font-bold">{r.email}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          <div className="form-group">
            <label>Loại thẻ</label>
            <div className="card-type-selector p-1 bg-white/5 rounded-2xl mt-2">
              <button
                onClick={() => setCardType('THANK_YOU')}
                className={`type-btn flex-1 py-3 px-4 rounded-xl flex items-center justify-between gap-2 transition-all ${cardType === 'THANK_YOU' ? 'active thank_you' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-3.5 h-3.5 ${cardType === 'THANK_YOU' ? 'text-white' : 'text-blue-500 opacity-60'}`} />
                  <span className="text-[11px] font-black uppercase">Thank You</span>
                </div>
                <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${cardType === 'THANK_YOU' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-600'}`}>10 pts</span>
              </button>

              {userRole !== 'USER' ? (
                <button
                  onClick={() => setCardType('GREAT_JOB')}
                  className={`type-btn flex-1 py-3 px-4 rounded-xl flex items-center justify-between gap-2 transition-all ${cardType === 'GREAT_JOB' ? 'active great_job' : ''}`}
                >
                  <div className="flex items-center gap-2">
                    <Award className={`w-3.5 h-3.5 ${cardType === 'GREAT_JOB' ? 'text-white' : 'text-blue-700 opacity-60'}`} />
                    <span className="text-[11px] font-black uppercase">Great Job</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md font-mono text-[10px] ${cardType === 'GREAT_JOB' ? 'bg-white/20 text-white' : 'bg-blue-100 text-blue-800'}`}>50 pts</span>
                </button>
              ) : (
                <button
                  disabled
                  className="type-btn flex-1 py-3 px-4 rounded-xl flex items-center justify-between gap-2 opacity-20 cursor-not-allowed bg-white/5"
                >
                  <div className="flex items-center gap-2">
                    <Lock className="w-3 h-3 text-gray-500" />
                    <span className="text-[11px] font-black uppercase text-gray-500">Great Job Card</span>
                  </div>
                  <span className="bg-black/20 px-2 py-0.5 rounded-md text-[10px] font-mono text-gray-500">(50 pts)</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="form-group">
            <label>Lời nhắn</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Viết vài điều tốt đẹp về đồng nghiệp của bạn..."
              className="input-field"
              style={{ height: '110px', resize: 'none' }}
            ></textarea>
          </div>
          <button
            onClick={handleSendKudos}
            disabled={sending || !selectedRecipient || !message}
            className="submit-button flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gửi ngay'} <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
