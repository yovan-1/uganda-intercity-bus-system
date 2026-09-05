import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { Booking } from '../types';
import { TicketCard } from '../components/TicketCard';
import { Ticket, Calendar, Bus, Eye, Loader2, X, CreditCard } from 'lucide-react';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await bookingAPI.getUserBookings();
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this booking? Reserved seats will be released.')) return;

    try {
      const res = await bookingAPI.cancelBooking(id);
      if (res.data.success) {
        setBookings(bookings.map((b) => (b.id === id ? { ...b, bookingStatus: 'CANCELLED', paymentStatus: 'REFUNDED' } : b)));
        if (selectedBooking?.id === id) setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Cancellation failed');
    }
  };

  const totalSpentUGX = bookings
    .filter((b) => b.bookingStatus !== 'CANCELLED')
    .reduce((sum, b) => sum + b.totalAmountUGX, 0);

  const upcomingCount = bookings.filter((b) => b.bookingStatus === 'CONFIRMED').length;

  return (
    <div className="space-y-8 pb-16 w-full text-left text-[#242424]">
      {/* Header Banner */}
      <div className="bg-white border-2 border-blue-700 rounded-2xl p-6 sm:p-8 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold text-blue-700 uppercase tracking-widest block">Passenger Customer Portal</span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#242424]">
            Welcome back, {user?.name || 'Traveler'}
          </h1>
          <p className="text-xs text-slate-500 font-medium">Manage your active reservations, tickets, and travel history across Uganda.</p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-xs font-black font-mono">
            {bookings.length} Total Reservation{bookings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 w-full">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-mono block">Upcoming Trips</span>
            <div className="text-2xl sm:text-3xl font-black text-[#242424] font-mono">{upcomingCount}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-mono block">Total Bookings</span>
            <div className="text-2xl sm:text-3xl font-black text-[#242424] font-mono">{bookings.length}</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center flex-shrink-0">
            <Ticket className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider font-mono block">Total Travel Spend</span>
            <div className="text-lg sm:text-xl font-black text-blue-800 font-mono">
              UGX {totalSpentUGX.toLocaleString()}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center flex-shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Bookings Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs space-y-4 w-full">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h2 className="font-black text-[#242424] text-base sm:text-lg flex items-center gap-2 font-mono uppercase tracking-wider">
            <Ticket className="w-5 h-5 text-blue-700" /> My Reservation Records
          </h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="w-8 h-8 text-blue-700 animate-spin mx-auto" />
            <p className="text-xs text-slate-500 font-bold mt-2">Loading reservations...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs font-semibold space-y-2">
            <Bus className="w-10 h-10 text-slate-400 mx-auto" />
            <p>You have not made any bus reservations yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bus-grid-scrollbar w-full">
            <table className="w-full min-w-[640px] text-left text-xs text-slate-800">
              <thead className="bg-slate-50 text-slate-600 font-mono uppercase tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3.5">Booking Ref</th>
                  <th className="p-3.5">Route</th>
                  <th className="p-3.5">Departure</th>
                  <th className="p-3.5">Seats</th>
                  <th className="p-3.5">Total UGX</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bookings.map((b) => {
                  const depDate = new Date(b.trip.departureTime);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold font-mono">
                        <span className="text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded border border-blue-200">
                          {b.bookingRef}
                        </span>
                      </td>
                      <td className="p-3.5 font-extrabold text-[#242424] font-mono">
                        {b.trip.route.origin} → {b.trip.route.destination}
                      </td>
                      <td className="p-3.5 font-mono text-slate-600 font-medium">
                        {depDate.toLocaleDateString('en-GB')} {depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </td>
                      <td className="p-3.5 font-mono font-bold text-[#242424]">
                        {b.passengers.map((p) => p.seat.seatNumber).join(', ')}
                      </td>
                      <td className="p-3.5 font-bold font-mono text-[#242424]">
                        UGX {b.totalAmountUGX.toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] uppercase font-mono border ${
                            b.bookingStatus === 'CONFIRMED'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          {b.bookingStatus}
                        </span>
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <button
                          onClick={() => setSelectedBooking(b)}
                          className="px-3.5 py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" /> Ticket
                        </button>
                        {b.bookingStatus === 'CONFIRMED' && (
                          <button
                            onClick={() => handleCancelBooking(b.id)}
                            className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-700 border border-slate-200 text-xs font-semibold transition-colors"
                          >
                            Cancel
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Digital Ticket Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 relative my-8 max-h-[90vh] overflow-y-auto text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-[#242424] text-base font-mono">Digital Boarding E-Ticket</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <TicketCard booking={selectedBooking} />
          </div>
        </div>
      )}
    </div>
  );
};
