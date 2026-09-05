import React, { useState, useEffect } from 'react';
import { bookingAPI } from '../services/api';
import { Booking } from '../types';
import { TicketCard } from '../components/TicketCard';
import { useAuth } from '../context/AuthContext';
import { Ticket, Bus } from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  useEffect(() => {
    const fetchUserBookings = async () => {
      setLoading(true);
      try {
        const res = await bookingAPI.getUserBookings();
        if (res.data.success) {
          setBookings(res.data.bookings);
        }
      } catch (err) {
        console.error('Failed to fetch bookings:', err);
        setError('Could not load your bookings.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserBookings();
  }, []);

  return (
    <div className="space-y-8 pb-16 text-[#242424] text-left">
      {/* Dashboard Title Banner */}
      <div className="bg-white border-2 border-[#1E3A8A] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#242424]">Passenger Booking Dashboard</h1>
          <p className="text-xs text-slate-500 font-bold font-mono">
            Welcome back, <span className="text-[#1E3A8A]">{user?.name || 'Passenger'}</span> • Manage active reservations & tickets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-[#1E3A8A]/20 text-[#1E3A8A] text-xs font-black font-mono">
            {bookings.length} Total Reservation{bookings.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Bookings List Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2">
            <Ticket className="w-4 h-4 text-[#1E3A8A]" /> My Reserved Tickets
          </h3>

          {loading ? (
            <div className="p-8 text-center glass-panel rounded-2xl">
              <div className="w-8 h-8 border-4 border-[#1E3A8A] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500 font-bold mt-2">Loading reservations...</p>
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs font-bold rounded-xl">{error}</div>
          ) : bookings.length === 0 ? (
            <div className="p-8 text-center glass-panel rounded-2xl text-slate-500 text-xs font-bold space-y-2">
              <p>You have no active bus reservations.</p>
            </div>
          ) : (
            bookings.map((b) => {
              const isSelected = selectedBooking?.id === b.id;
              const depDateStr = new Date(b.trip?.departureTime || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBooking(b)}
                  className={`bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all space-y-3 ${
                    isSelected ? 'border-[#1E3A8A] shadow-md ring-2 ring-[#1E3A8A]/20' : 'border-slate-200 hover:border-[#1E3A8A]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="font-black text-[#1E3A8A] bg-blue-50 px-2.5 py-0.5 rounded border border-[#1E3A8A]/20">
                      {b.bookingRef}
                    </span>
                    <span className="font-extrabold text-slate-500">{depDateStr}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-black text-[#242424] text-base font-mono">
                        {b.trip?.route?.origin} → {b.trip?.route?.destination}
                      </div>
                      <div className="text-xs text-slate-500 font-bold font-mono">
                        Operator: {b.trip?.vehicle?.operatorName || 'MUST Express'} • Seats: {b.passengers?.map((p) => p.seat?.seatNumber).join(', ') || 'N/A'}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-black text-[#242424] font-mono">
                        UGX {b.totalAmountUGX.toLocaleString()}
                      </div>
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {b.bookingStatus}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Ticket Preview Panel */}
        <div className="lg:col-span-6 space-y-4">
          <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2">
            <Bus className="w-4 h-4 text-[#1E3A8A]" /> E-Ticket QR Preview
          </h3>

          {selectedBooking ? (
            <TicketCard booking={selectedBooking} />
          ) : (
            <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 text-xs font-bold">
              Select a reservation on the left to view and print your QR code boarding pass.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
