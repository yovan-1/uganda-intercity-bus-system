import React, { useState } from 'react';
import { ticketAPI } from '../services/api';
import { QrCode, Search, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';

export const StaffPortalPage: React.FC = () => {
  const [ticketIdInput, setTicketIdInput] = useState('');
  const [ticket, setTicket] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleVerifyTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketIdInput.trim()) return;

    setLoading(true);
    setMessage(null);
    setTicket(null);

    try {
      const res = await ticketAPI.verifyTicket(ticketIdInput.trim());
      if (res.data.success) {
        setTicket(res.data.ticket || res.data.booking);
        setMessage({ type: 'success', text: 'Ticket verified in MUST system.' });
      } else {
        setMessage({ type: 'error', text: 'Invalid ticket or PNR code.' });
      }
    } catch (err: any) {
      console.error('Ticket verification error:', err);
      setMessage({ type: 'error', text: err.response?.data?.error || 'Ticket lookup failed.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-[#242424] text-left">
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#1E3A8A] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#242424] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" /> Bus Staff Boarding Verification
          </h1>
          <p className="text-xs text-slate-500 font-bold font-mono">
            Terminal Conductor Portal • Verify passenger QR tickets before departure.
          </p>
        </div>
      </div>

      {/* Ticket Lookup Form */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2">
          <QrCode className="w-4 h-4 text-[#1E3A8A]" /> Enter Booking Reference or Scan QR Code
        </h3>

        <form onSubmit={handleVerifyTicket} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
            <input
              type="text"
              required
              value={ticketIdInput}
              onChange={(e) => setTicketIdInput(e.target.value)}
              placeholder="e.g. MUST-89012"
              className="w-full bg-white border border-slate-300 rounded-xl pl-10 pr-3 py-3 text-xs font-mono font-black text-[#242424] focus:border-[#1E3A8A] focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-[#1E3A8A] hover:bg-[#1b365d] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md disabled:opacity-40"
          >
            {loading ? 'Verifying...' : 'Verify Ticket'}
          </button>
        </form>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${
              message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span>{message.text}</span>
          </div>
        )}
      </div>

      {/* Verified Ticket Card Result */}
      {ticket && (
        <div className="bg-white border-2 border-[#1E3A8A] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200 pb-4">
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-500 uppercase block">Ticket Identifier</span>
              <span className="text-lg font-black text-[#1E3A8A] font-mono">{ticket.bookingRef || ticket.ticketCode || 'MUST-TKT'}</span>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-black uppercase font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
              VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">Passenger Name:</span>
              <span className="font-extrabold text-[#242424] text-sm">
                {ticket.passengers?.[0]?.fullName || ticket.passengerName || 'Valued Passenger'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">Seat Number:</span>
              <span className="font-black text-[#1E3A8A] text-base">
                {ticket.passengers?.[0]?.seat?.seatNumber || '01'}
              </span>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-bold block">Phone Number:</span>
              <span className="font-extrabold text-[#242424]">
                {ticket.passengers?.[0]?.phone || '0771234567'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
