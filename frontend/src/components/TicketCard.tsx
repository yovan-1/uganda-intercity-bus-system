import React from 'react';
import { Booking } from '../types';
import { Bus, Calendar, Clock, Printer, QrCode, ShieldCheck } from 'lucide-react';

interface TicketCardProps {
  booking: Booking;
}

export const TicketCard: React.FC<TicketCardProps> = ({ booking }) => {
  const handlePrint = () => {
    window.print();
  };

  const depDateStr = new Date(booking.trip.departureTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const depTimeStr = new Date(booking.trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const arrTimeStr = new Date(booking.trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const passengersList = booking.passengers && booking.passengers.length > 0
    ? booking.passengers
    : [
        {
          id: 'p1',
          fullName: booking.user?.name || 'Passenger',
          phone: booking.user?.phone || '0771234567',
          email: booking.user?.email || 'passenger@travel.ug',
          seat: { id: 's1', vehicleId: '', seatNumber: '1A', seatRow: 1, seatCol: 1, isAccessible: false },
        },
      ];

  return (
    <div className="max-w-2xl mx-auto space-y-4 text-left w-full">
      {/* Boarding Pass Container */}
      <div className="bg-white border-2 border-[#1E3A8A] rounded-3xl overflow-hidden shadow-xl w-full">
        {/* Header Banner - MUST Navy (#1E3A8A) with Crisp White (#FFFFFF) */}
        <div className="bg-[#1E3A8A] px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-white w-full">
          <div className="flex items-center gap-2 font-mono font-black text-lg sm:text-xl tracking-tight">
            <Bus className="w-5 h-5 sm:w-6 sm:h-6 text-white stroke-[2.5] flex-shrink-0" />
            MUST<span className="text-white opacity-80"> Express Pass</span>
          </div>

          <div className="text-left sm:text-right font-mono">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Booking Reference</div>
            <div className="text-base sm:text-lg font-black text-white">{booking.bookingRef}</div>
          </div>
        </div>

        {/* Boarding Details */}
        <div className="p-4 sm:p-6 space-y-6 w-full">
          {/* Route Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-100 pb-4">
            <div>
              <div className="text-xl sm:text-2xl font-black text-[#1E3A8A] font-mono break-words">
                {booking.trip.route.origin} → {booking.trip.route.destination}
              </div>
              <div className="text-xs text-[#1E3A8A] font-extrabold flex items-center gap-1 mt-1 flex-wrap">
                <ShieldCheck className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
                <span>{booking.trip.vehicle.operatorName} • {booking.trip.vehicle.regNumber}</span>
              </div>
            </div>

            <div className="text-left sm:text-right font-mono">
              <div className="text-xs text-slate-500 font-bold">Total Paid</div>
              <div className="text-lg sm:text-xl font-black text-[#1E3A8A]">UGX {booking.totalAmountUGX.toLocaleString()}</div>
            </div>
          </div>

          {/* Departure Date & Times */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 sm:p-4 text-center bg-slate-50 rounded-2xl border border-slate-200 font-mono w-full">
            <div className="p-2 sm:p-0">
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
                <Calendar className="w-3 h-3 text-[#1E3A8A]" /> Travel Date
              </div>
              <div className="text-xs font-black text-[#1E3A8A] mt-1">{depDateStr}</div>
            </div>

            <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
              <div className="text-[10px] text-slate-500 font-bold uppercase flex items-center justify-center gap-1">
                <Clock className="w-3 h-3 text-[#1E3A8A]" /> Departure
              </div>
              <div className="text-sm sm:text-base font-black text-[#1E3A8A] mt-0.5">{depTimeStr}</div>
            </div>

            <div className="p-2 sm:p-0 border-t sm:border-t-0 sm:border-l border-slate-200 pt-2 sm:pt-0">
              <div className="text-[10px] text-slate-500 font-bold uppercase">Est. Arrival</div>
              <div className="text-sm sm:text-base font-black text-[#1E3A8A] mt-0.5">{arrTimeStr}</div>
            </div>
          </div>

          {/* Passenger & Seat Allocation */}
          <div className="space-y-3">
            <h4 className="text-xs font-black text-[#1E3A8A] uppercase tracking-wider font-mono">Passenger & Seat Manifest</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {passengersList.map((t, idx) => (
                <div key={t.id || idx} className="p-3 sm:p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs font-mono">
                  <div className="truncate pr-2">
                    <div className="font-extrabold text-[#1E3A8A] truncate">{t.fullName}</div>
                    <div className="text-[10px] text-slate-500 font-bold">{t.phone}</div>
                  </div>
                  <div className="px-2.5 py-1 rounded-lg bg-[#1E3A8A] text-white font-black text-xs sm:text-sm flex-shrink-0">
                    Seat {t.seat?.seatNumber || '1A'}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Boarding QR Pass Code */}
          <div className="border-t-2 border-dashed border-slate-200 pt-5 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <div className="text-xs font-black text-[#1E3A8A] flex items-center justify-center sm:justify-start gap-1">
                <QrCode className="w-4 h-4 text-[#1E3A8A]" /> Boarding QR Pass Code
              </div>
              <p className="text-[11px] text-slate-500 font-medium max-w-xs">
                Present this code on your phone to MUST terminal staff at departure for live scanning verification.
              </p>
            </div>

            {/* QR Visual */}
            <div className="bg-white p-3 rounded-2xl border-2 border-[#1E3A8A] shadow-md flex flex-col items-center flex-shrink-0">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(booking.bookingRef)}`}
                alt="Digital Boarding QR Code"
                className="w-24 h-24"
              />
              <span className="text-[10px] font-mono text-[#1E3A8A] font-black mt-1">{booking.bookingRef}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Print Action */}
      <button
        onClick={handlePrint}
        className="w-full py-3.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1b365d] text-white font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md uppercase tracking-wider"
      >
        <Printer className="w-4 h-4" /> Print Official MUST E-Ticket / Download PDF
      </button>
    </div>
  );
};
