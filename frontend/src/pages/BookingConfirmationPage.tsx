import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { Booking } from '../types';
import { TicketCard } from '../components/TicketCard';
import confetti from 'canvas-confetti';
import { CheckCircle2, Ticket, Home, AlertCircle, Loader2 } from 'lucide-react';

export const BookingConfirmationPage: React.FC = () => {
  const { bookingRef } = useParams<{ bookingRef: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingRef) return;
      try {
        const res = await bookingAPI.getBookingById(bookingRef);
        if (res.data.success) {
          setBooking(res.data.booking);

          // Fire celebratory confetti!
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load booking details');
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingRef]);

  if (loading) {
    return (
      <div className="text-center py-20 space-y-4">
        <Loader2 className="w-10 h-10 border-emerald-500 text-emerald-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm">Generating Digital e-Ticket...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Booking Not Found</h2>
        <p className="text-xs text-slate-400">{error || 'Could not retrieve ticket records.'}</p>
        <Link to="/" className="inline-block px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs">
          Return to Search
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Success Hero Banner */}
      <div className="bg-gradient-to-r from-emerald-900/60 to-teal-900/60 border border-emerald-500/40 rounded-3xl p-6 text-center space-y-3 shadow-2xl">
        <div className="w-14 h-14 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-900/50">
          <CheckCircle2 className="w-8 h-8" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Booking Confirmed & Paid Successfully!
        </h1>

        <p className="text-emerald-200 text-xs sm:text-sm max-w-lg mx-auto">
          Your travel reservation code is <span className="font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-emerald-500/40">{booking.bookingRef}</span>. A digital e-Ticket with QR code has been generated.
        </p>

        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            to="/dashboard"
            className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200 text-xs font-semibold flex items-center gap-1.5"
          >
            <Ticket className="w-4 h-4 text-emerald-400" /> Go to My Bookings
          </Link>
          <Link
            to="/"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" /> Book Another Trip
          </Link>
        </div>
      </div>

      {/* Ticket Card Component */}
      <TicketCard booking={booking} />
    </div>
  );
};
