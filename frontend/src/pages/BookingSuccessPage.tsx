import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Booking } from '../types';
import { TicketCard } from '../components/TicketCard';
import { CheckCircle2, Home, LayoutDashboard } from 'lucide-react';

interface SuccessState {
  booking: Booking;
}

export const BookingSuccessPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state as SuccessState | null;

  if (!state || !state.booking) {
    return (
      <div className="p-12 text-center space-y-4 glass-panel rounded-2xl max-w-lg mx-auto text-[#242424]">
        <p className="text-sm font-bold text-slate-500">No booking details found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#1E3A8A] text-white font-black text-xs uppercase rounded-xl"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const { booking } = state;

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16 text-[#242424] text-center">
      {/* Confirmation Banner */}
      <div className="space-y-3 pt-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-[#242424]">Booking Confirmed!</h1>
        <p className="text-xs text-slate-500 font-bold max-w-md mx-auto">
          Your seat has been reserved. Presents this digital QR code ticket at the bus terminal during departure.
        </p>
      </div>

      {/* Official E-Ticket Card Component */}
      <TicketCard booking={booking} />

      {/* Footer Quick Nav Buttons */}
      <div className="flex items-center justify-center gap-4 pt-4 font-mono">
        <button
          onClick={() => navigate('/')}
          className="px-5 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-[#242424] font-bold text-xs flex items-center gap-2"
        >
          <Home className="w-4 h-4 text-[#1E3A8A]" /> Return Home
        </button>

        <button
          onClick={() => navigate('/dashboard')}
          className="px-5 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-[#1b365d] text-white font-black text-xs flex items-center gap-2 shadow-md uppercase"
        >
          <LayoutDashboard className="w-4 h-4" /> Manage My Bookings
        </button>
      </div>
    </div>
  );
};
