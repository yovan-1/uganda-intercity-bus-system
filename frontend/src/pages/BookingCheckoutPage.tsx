import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { bookingAPI } from '../services/api';
import { Trip, Seat } from '../types';
import { useAuth } from '../context/AuthContext';
import { User, Phone, CreditCard, ArrowRight } from 'lucide-react';

interface CheckoutState {
  trip: Trip;
  seats: Seat[];
  passengersCount: number;
}

export const BookingCheckoutPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();

  const state = location.state as CheckoutState | null;

  const [passengersData, setPassengersData] = useState(() => {
    const initial = [];
    const count = state?.seats.length || 1;
    for (let i = 0; i < count; i++) {
      initial.push({
        fullName: i === 0 && user ? user.name : '',
        phone: i === 0 && user ? user.phone || '' : '',
        email: i === 0 && user ? user.email || '' : '',
        seatId: state?.seats[i]?.id || '',
      });
    }
    return initial;
  });

  const [paymentMethod, setPaymentMethod] = useState<'MOBILE_MONEY' | 'CARD'>('MOBILE_MONEY');
  const [mobileMoneyNumber, setMobileMoneyNumber] = useState(user?.phone || '0771234567');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!state || !state.trip || state.seats.length === 0) {
    return (
      <div className="p-12 text-center space-y-4 glass-panel rounded-2xl max-w-lg mx-auto text-[#242424]">
        <p className="text-sm font-bold text-slate-500">No active trip session found.</p>
        <button
          onClick={() => navigate('/')}
          className="px-6 py-2.5 bg-[#1E3A8A] text-white font-black text-xs uppercase rounded-xl"
        >
          Return to Search
        </button>
      </div>
    );
  }

  const { trip, seats } = state;
  const totalAmount = trip.priceUGX * seats.length;

  const handlePassengerChange = (index: number, field: string, value: string) => {
    const updated = [...passengersData];
    updated[index] = { ...updated[index], [field]: value };
    setPassengersData(updated);
  };

  const handleConfirmBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const payload = {
        tripId: trip.id,
        passengerDetails: passengersData.map((p, idx) => ({
          fullName: p.fullName || `Passenger ${idx + 1}`,
          phone: p.phone || '0770000000',
          email: p.email || 'passenger@travel.ug',
          seatId: seats[idx].id,
        })),
        paymentMethod: paymentMethod === 'MOBILE_MONEY' ? 'MTN_MOMO' : 'VISA_CARD',
      };

      const res = await bookingAPI.createBooking(payload);
      if (res.data.success) {
        navigate('/booking-success', { state: { booking: res.data.booking } });
      } else {
        setError(res.data.message || 'Failed to create booking.');
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const depDateStr = new Date(trip.departureTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  const depTimeStr = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16 text-[#242424] text-left">
      {/* Header Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-black text-[#242424]">Passenger & Payment Checkout</h1>
        <p className="text-xs text-slate-500 font-bold font-mono">Complete traveler details for digital QR e-ticket issuance.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Passenger Form & Payment */}
        <form onSubmit={handleConfirmBooking} className="lg:col-span-8 space-y-6">
          {/* Passenger Details Cards */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
            <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-3">
              <User className="w-4 h-4 text-[#1E3A8A]" /> Traveler Information ({seats.length} Person{seats.length > 1 ? 's' : ''})
            </h3>

            {seats.map((seat, idx) => (
              <div key={seat.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="font-extrabold text-[#242424]">Passenger {idx + 1}</span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-[#1E3A8A] text-white font-black text-xs">
                    Seat {seat.seatNumber}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-[#242424] block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={passengersData[idx]?.fullName || ''}
                      onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                      placeholder="e.g. John Mugisha"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#242424] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-[#242424] block mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={passengersData[idx]?.phone || ''}
                      onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                      placeholder="0771234567"
                      className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#242424] focus:border-[#1E3A8A] focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Payment Selection Card */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="w-4 h-4 text-[#1E3A8A]" /> Payment Method
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('MOBILE_MONEY')}
                className={`p-4 rounded-xl border-2 text-left space-y-1 transition-all ${
                  paymentMethod === 'MOBILE_MONEY'
                    ? 'border-[#1E3A8A] bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-[#242424]">
                  <span>MTN / Airtel Mobile Money</span>
                  <Phone className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Instant PIN Prompt on Phone</div>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-4 rounded-xl border-2 text-left space-y-1 transition-all ${
                  paymentMethod === 'CARD'
                    ? 'border-[#1E3A8A] bg-blue-50/50'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-bold text-xs text-[#242424]">
                  <span>Visa / MasterCard</span>
                  <CreditCard className="w-4 h-4 text-[#1E3A8A]" />
                </div>
                <div className="text-[10px] text-slate-500 font-medium">Debit or Credit Card</div>
              </button>
            </div>

            {paymentMethod === 'MOBILE_MONEY' && (
              <div className="pt-3 space-y-1">
                <label className="text-[11px] font-bold text-[#242424] block">Enter Mobile Money Phone Number</label>
                <input
                  type="tel"
                  required
                  value={mobileMoneyNumber}
                  onChange={(e) => setMobileMoneyNumber(e.target.value)}
                  placeholder="0771234567"
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2.5 text-xs font-bold text-[#242424] focus:border-[#1E3A8A] focus:outline-none"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
              {error}
            </div>
          )}

          {/* Confirm & Pay CTA */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-4 rounded-xl bg-[#1E3A8A] hover:bg-[#1b365d] text-white font-black text-sm uppercase tracking-wider shadow-lg disabled:opacity-40 flex items-center justify-center gap-2 transition-all"
          >
            {submitting ? 'Processing Booking...' : `Pay UGX ${totalAmount.toLocaleString()} & Get E-Ticket`}
          </button>
        </form>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-slate-200 space-y-6">
          <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono border-b border-slate-100 pb-3">
            Trip Summary
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between font-mono">
              <span className="font-extrabold text-[#242424] text-base">{trip.route?.origin}</span>
              <ArrowRight className="w-4 h-4 text-[#1E3A8A]" />
              <span className="font-extrabold text-[#242424] text-base">{trip.route?.destination}</span>
            </div>

            <div className="space-y-2 text-xs font-mono bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>Date:</span>
                <span className="text-[#242424]">{depDateStr}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>Departure:</span>
                <span className="text-[#242424]">{depTimeStr}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>Operator:</span>
                <span className="text-[#1E3A8A] font-extrabold">{trip.vehicle?.operatorName || 'MUST Express'}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 font-bold">
                <span>Seats:</span>
                <span className="text-[#242424]">{seats.map((s) => s.seatNumber).join(', ')}</span>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 space-y-2 font-mono">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Fare per seat:</span>
                <span className="font-bold text-[#242424]">UGX {trip.priceUGX.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Seats count:</span>
                <span className="font-bold text-[#242424]">{seats.length}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-[#242424] pt-2 border-t border-slate-100">
                <span>Total Amount:</span>
                <span className="text-[#1E3A8A]">UGX {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
