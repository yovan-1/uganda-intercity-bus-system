import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookingAPI } from '../services/api';
import { Trip, Seat, PassengerInput } from '../types';
import { passengerSchema } from '../schemas/validation';
import { MockPaymentModal } from '../components/MockPaymentModal';
import { Bus, User, Phone, Mail, CreditCard, ArrowLeft, AlertCircle, LogIn, X } from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [bookingFlowData, setBookingFlowData] = useState<{
    trip: Trip;
    selectedSeats: Seat[];
    passengersCount: number;
  } | null>(null);

  const [passengers, setPassengers] = useState<PassengerInput[]>([]);
  const [formErrors, setFormErrors] = useState<Record<number, Record<string, string>>>({});
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [authRequiredModalOpen, setAuthRequiredModalOpen] = useState(false);
  const [generalError, setGeneralError] = useState('');

  useEffect(() => {
    const raw = sessionStorage.getItem('current_booking_flow');
    if (!raw) {
      navigate('/');
      return;
    }
    const parsed = JSON.parse(raw);
    setBookingFlowData(parsed);

    const initialPassengers: PassengerInput[] = parsed.selectedSeats.map((seat: Seat, idx: number) => ({
      seatId: seat.id,
      seatNumber: seat.seatNumber,
      fullName: idx === 0 && user ? user.name : '',
      phone: idx === 0 && user ? user.phone : '0771234567',
      email: idx === 0 && user ? user.email : 'passenger@travel.ug',
    }));

    setPassengers(initialPassengers);
  }, [navigate, user]);

  if (!bookingFlowData) return null;

  const { trip, selectedSeats } = bookingFlowData;
  const totalAmountUGX = trip.priceUGX * selectedSeats.length;

  const handlePassengerChange = (index: number, field: keyof PassengerInput, value: string) => {
    const updated = [...passengers];
    updated[index] = { ...updated[index], [field]: value };
    setPassengers(updated);

    if (formErrors[index] && formErrors[index][field]) {
      const copy = { ...formErrors[index] };
      delete copy[field];
      setFormErrors({ ...formErrors, [index]: copy });
    }
  };

  const validateAllPassengers = (): boolean => {
    let isValid = true;
    const newErrors: Record<number, Record<string, string>> = {};

    passengers.forEach((p, idx) => {
      const res = passengerSchema.safeParse(p);
      if (!res.success) {
        isValid = false;
        const pErrors: Record<string, string> = {};
        res.error.issues.forEach((err) => {
          if (err.path[0]) pErrors[err.path[0].toString()] = err.message;
        });
        newErrors[idx] = pErrors;
      }
    });

    setFormErrors(newErrors);
    return isValid;
  };

  const handleOpenPaymentModal = () => {
    setGeneralError('');
    if (!validateAllPassengers()) {
      setGeneralError('Please fix validation errors in the passenger forms below before continuing.');
      return;
    }
    if (!user) {
      setAuthRequiredModalOpen(true);
      return;
    }
    setPaymentModalOpen(true);
  };

  const handlePaymentSuccess = async (paymentMethod: string) => {
    try {
      const payload = {
        tripId: trip.id,
        passengerDetails: passengers,
        paymentMethod,
      };

      const res = await bookingAPI.createBooking(payload);
      if (res.data.success) {
        sessionStorage.removeItem('current_booking_flow');
        navigate(`/confirmation/${res.data.booking.bookingRef}`);
      }
    } catch (err: any) {
      setGeneralError(err.response?.data?.message || 'Booking submission failed');
      setPaymentModalOpen(false);
    }
  };

  const depDate = new Date(trip.departureTime);

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-left w-full">
      {/* Top Navigation & Step Indicator */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 w-full">
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs flex items-center gap-2 border border-slate-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-blue-800" /> Back to Seat Selection
        </button>

        <span className="text-xs font-mono font-medium text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
          Step 3 of 4 • Passenger Details
        </span>
      </div>

      {generalError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* PASSENGER DETAILS FORM */}
        <div className="lg:col-span-7 space-y-6 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2 font-mono">
              <User className="w-5 h-5 text-blue-800" /> Passenger Information
            </h2>
            <span className="text-xs font-medium text-slate-500 font-mono">{selectedSeats.length} Seat(s) Reserved</span>
          </div>

          {passengers.map((p, idx) => {
            const errors = formErrors[idx] || {};

            return (
              <div key={p.seatId} className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-sm space-y-4 w-full">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="font-semibold text-slate-800 text-sm flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-800 text-white text-xs flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    Passenger #{idx + 1}
                  </span>
                  <span className="text-xs font-mono font-medium text-blue-800 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                    Seat {p.seatNumber}
                  </span>
                </div>

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-blue-800" /> Full Name
                  </label>
                  <input
                    type="text"
                    value={p.fullName}
                    onChange={(e) => handlePassengerChange(idx, 'fullName', e.target.value)}
                    placeholder="e.g. Ikayo Emmanuel"
                    className={`w-full bg-white border rounded-xl px-3.5 py-2 text-slate-800 text-xs font-normal focus:outline-none ${
                      errors.fullName ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-800'
                    }`}
                  />
                  {errors.fullName ? (
                    <p className="text-red-600 text-[11px] font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" /> {errors.fullName}
                    </p>
                  ) : (
                    <p className="text-[11px] text-slate-500 font-normal">Must not contain numbers or special characters</p>
                  )}
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-blue-800" /> Ugandan Phone Number
                    </label>
                    <input
                      type="tel"
                      value={p.phone}
                      onChange={(e) => handlePassengerChange(idx, 'phone', e.target.value)}
                      placeholder="0771234567"
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-slate-800 text-xs font-normal font-mono focus:outline-none ${
                        errors.phone ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-800'
                      }`}
                    />
                    {errors.phone ? (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.phone}
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-500 font-normal">e.g. 0771234567</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-blue-800" /> Email Address
                    </label>
                    <input
                      type="email"
                      value={p.email}
                      onChange={(e) => handlePassengerChange(idx, 'email', e.target.value)}
                      placeholder="passenger@travel.ug"
                      className={`w-full bg-white border rounded-xl px-3.5 py-2 text-slate-800 text-xs font-normal focus:outline-none ${
                        errors.email ? 'border-red-500 ring-1 ring-red-500' : 'border-slate-300 focus:border-blue-800'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-600 text-[11px] font-medium flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {errors.email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOOKING SUMMARY CARD */}
        <div className="lg:col-span-5 space-y-6 w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-lg space-y-6 lg:sticky lg:top-24 w-full">
            <h3 className="font-bold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2 font-mono">
              <Bus className="w-5 h-5 text-blue-800" /> Trip & Fare Summary
            </h3>

            {/* Route Timetable */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-medium">
                <span>{trip.vehicle.operatorName}</span>
                <span className="font-mono text-blue-800 font-semibold">{trip.vehicle.regNumber}</span>
              </div>

              <div className="text-base font-bold text-slate-900 flex items-center justify-between font-mono">
                <span>{trip.route.origin}</span>
                <span className="text-xs text-slate-400">→</span>
                <span>{trip.route.destination}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 font-medium pt-2 border-t border-slate-200 font-mono">
                <span className="text-slate-500">Departure: {depDate.toLocaleDateString('en-GB')}</span>
                <span className="font-semibold text-blue-800">{depDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            {/* Fare Breakdown */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 font-normal">
                <span>Base Fare ({selectedSeats.length} seat × UGX {trip.priceUGX.toLocaleString()})</span>
                <span className="font-mono text-slate-800">UGX {(trip.priceUGX * selectedSeats.length).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600 font-normal">
                <span>Digital Booking Fee</span>
                <span className="font-mono text-emerald-700 font-medium">UGX 0 (Waived)</span>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-sm">
                <span className="font-bold text-slate-900">Total Amount</span>
                <span className="font-bold text-lg sm:text-xl text-blue-800 font-mono">
                  UGX {totalAmountUGX.toLocaleString()}
                </span>
              </div>
            </div>

            <button
              onClick={handleOpenPaymentModal}
              className="w-full py-3.5 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-medium text-[11px] sm:text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
            >
              <CreditCard className="w-4 h-4 flex-shrink-0" />
              <span>PROCEED TO PAY UGX {totalAmountUGX.toLocaleString()}</span>
            </button>
          </div>
        </div>
      </div>

      {/* AUTH REQUIRED POPUP MODAL */}
      {authRequiredModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-4 sm:p-6 shadow-2xl space-y-6 relative text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-blue-800 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
                  <LogIn className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base font-mono">Sign In Required</h3>
                  <p className="text-xs text-slate-500 font-normal">Account access needed to issue ticket</p>
                </div>
              </div>
              <button
                onClick={() => setAuthRequiredModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-700 font-normal leading-relaxed">
              To reserve your seats and receive your MUST digital ticket with instant QR validation, please sign in or register an account.
            </p>

            <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate('/auth?redirect=/checkout')}
                className="w-full py-3 rounded-xl bg-blue-800 hover:bg-blue-900 text-white font-medium text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                <span>Go to Sign In / Register Page</span>
              </button>

              <button
                onClick={() => setAuthRequiredModalOpen(false)}
                className="w-full py-2 rounded-xl border border-slate-300 text-slate-600 font-medium text-xs hover:bg-slate-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mock Payment Modal */}
      <MockPaymentModal
        isOpen={paymentModalOpen}
        totalAmountUGX={totalAmountUGX}
        onClose={() => setPaymentModalOpen(false)}
        onPaymentSuccess={handlePaymentSuccess}
      />
    </div>
  );
};
