import React, { useState } from 'react';
import { ticketAPI } from '../services/api';
import { Booking } from '../types';
import { QrCode, CheckCircle2, AlertCircle, Wrench, Search } from 'lucide-react';

export const StaffDashboard: React.FC = () => {
  const [bookingRefInput, setBookingRefInput] = useState('MUST-8942-XJ');
  const [verifiedBooking, setVerifiedBooking] = useState<Booking | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingRefInput.trim()) return;

    setVerifying(true);
    setResultMsg(null);
    setVerifiedBooking(null);

    try {
      const res = await ticketAPI.verifyTicket(bookingRefInput.trim());
      if (res.data.success) {
        setResultMsg({ type: 'success', text: res.data.message });
        setVerifiedBooking(res.data.booking);
      }
    } catch (err: any) {
      setResultMsg({
        type: 'error',
        text: err.response?.data?.message || 'Ticket Verification Failed! Invalid Code.',
      });
      if (err.response?.data?.booking) {
        setVerifiedBooking(err.response.data.booking);
      }
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 w-full text-left">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div>
          <span className="text-xs font-mono text-blue-400 uppercase tracking-widest block flex items-center gap-1.5">
            <Wrench className="w-3.5 h-3.5" /> Staff Ticket Verification Terminal
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">
            Bus Terminal Passenger Check-in
          </h1>
          <p className="text-xs text-slate-400 mt-1">Verify digital e-Tickets, passenger seat manifests, and boarding status.</p>
        </div>
      </div>

      {/* QR & Reference Scanner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
        <div className="lg:col-span-6 space-y-6 w-full">
          <div className="glass-panel rounded-3xl border border-slate-800 p-5 sm:p-6 space-y-4 w-full">
            <h2 className="font-bold text-white text-base flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-400" /> Enter or Scan Ticket Code
            </h2>
            <p className="text-xs text-slate-400">
              Type the booking reference code (e.g. MUST-8942-XJ) or scan the passenger's digital ticket QR code.
            </p>

            <form onSubmit={handleVerify} className="space-y-3 w-full">
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <input
                  type="text"
                  value={bookingRefInput}
                  onChange={(e) => setBookingRefInput(e.target.value)}
                  placeholder="MUST-8942-XJ"
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white font-mono text-sm uppercase tracking-wider focus:border-emerald-500 focus:outline-none w-full"
                />
                <button
                  type="submit"
                  disabled={verifying}
                  className="py-3 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <Search className="w-4 h-4" />
                  {verifying ? 'Verifying...' : 'VERIFY TICKET'}
                </button>
              </div>
            </form>

            {/* Quick Demo Pre-fill */}
            <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="text-slate-500">Quick Test Code:</span>
              <button
                onClick={() => setBookingRefInput('MUST-8942-XJ')}
                className="text-emerald-400 font-mono underline hover:text-emerald-300"
              >
                MUST-8942-XJ
              </button>
            </div>
          </div>
        </div>

        {/* Verification Result Display */}
        <div className="lg:col-span-6 space-y-6 w-full">
          {resultMsg && (
            <div
              className={`p-5 sm:p-6 rounded-3xl border space-y-4 shadow-xl w-full ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                  : 'bg-red-950/60 border-red-500/50 text-red-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {resultMsg.type === 'success' ? (
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-extrabold text-base text-white">{resultMsg.text}</h3>
                  <span className="text-xs font-mono">Status check logged by Staff ID</span>
                </div>
              </div>

              {verifiedBooking && (
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3 text-xs text-slate-300 w-full">
                  <div className="flex justify-between items-center border-b border-slate-800 pb-2 flex-wrap gap-2">
                    <span className="font-mono font-bold text-emerald-400">{verifiedBooking.bookingRef}</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {verifiedBooking.bookingStatus}
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Bus Route & Fleet</span>
                    <span className="font-bold text-white">
                      {verifiedBooking.trip.route.origin} → {verifiedBooking.trip.route.destination} ({verifiedBooking.trip.vehicle.operatorName})
                    </span>
                  </div>

                  <div>
                    <span className="text-slate-400 block">Boarding Passengers & Allocated Seats</span>
                    <div className="space-y-1 mt-1">
                      {verifiedBooking.passengers.map((p) => (
                        <div key={p.id} className="flex justify-between items-center bg-slate-900 p-2 rounded-lg font-mono">
                          <span className="text-white font-bold">{p.fullName}</span>
                          <span className="text-emerald-400 font-extrabold">Seat {p.seat.seatNumber}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
