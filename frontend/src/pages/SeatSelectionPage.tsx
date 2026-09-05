import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { Trip, Seat } from '../types';
import { BusSeatMap } from '../components/BusSeatMap';
import { ArrowLeft, Bus, Calendar, Clock, ShoppingCart, AlertCircle, Loader2 } from 'lucide-react';

export const SeatSelectionPage: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const passengersCount = parseInt(searchParams.get('passengers') || '1', 10);

  const [trip, setTrip] = useState<Trip | null>(null);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTripDetails = async () => {
      if (!tripId) return;
      setLoading(true);
      try {
        const res = await tripAPI.getTripById(tripId);
        if (res.data.success) {
          setTrip(res.data.trip);
        } else {
          setError('Trip details not found.');
        }
      } catch (err) {
        console.error('Fetch trip error:', err);
        setError('Failed to load trip seat map.');
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetails();
  }, [tripId]);

  const handleToggleSeat = (seat: Seat) => {
    if (selectedSeatIds.includes(seat.id)) {
      setSelectedSeatIds(selectedSeatIds.filter((id) => id !== seat.id));
    } else {
      if (selectedSeatIds.length >= passengersCount) {
        // Auto replace last or alert
        if (passengersCount === 1) {
          setSelectedSeatIds([seat.id]);
        } else {
          alert(`You can only select up to ${passengersCount} seats based on your search query.`);
        }
      } else {
        setSelectedSeatIds([...selectedSeatIds, seat.id]);
      }
    }
  };

  const handleProceedToCheckout = () => {
    if (!trip) return;
    if (selectedSeatIds.length === 0) {
      alert('Please select at least 1 seat before proceeding.');
      return;
    }

    const allAvailableSeats: Seat[] = trip.seats || trip.vehicle?.seats || [];
    const selectedSeats = allAvailableSeats.filter((s) => selectedSeatIds.includes(s.id));

    // Save state into session storage for checkout step
    sessionStorage.setItem(
      'current_booking_flow',
      JSON.stringify({
        trip,
        selectedSeats,
        passengersCount,
      })
    );

    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <Loader2 className="w-10 h-10 border-blue-700 text-blue-700 animate-spin mx-auto" />
        <p className="text-xs text-slate-500 font-mono">Rendering interactive bus seat map...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="py-16 text-center space-y-4 max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h2 className="text-lg font-semibold text-slate-900">Trip Seat Map Error</h2>
        <p className="text-xs text-slate-600">{error || 'Could not retrieve bus information.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 rounded-xl bg-blue-700 text-white font-medium text-xs uppercase"
        >
          Back to Search
        </button>
      </div>
    );
  }

  const tripSeats: Seat[] = trip?.seats || trip?.vehicle?.seats || [];
  const selectedSeats = tripSeats.filter((s) => selectedSeatIds.includes(s.id));
  const totalFareUGX = trip.priceUGX * selectedSeatIds.length;
  const depDateStr = new Date(trip.departureTime).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const depTimeStr = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="space-y-6 pb-16 text-slate-800 text-left max-w-7xl mx-auto w-full">
      {/* Top Header Step Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-mono text-slate-600 hover:text-blue-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Search Results
        </button>

        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-800 font-semibold border border-blue-200">
            Step 2 of 4: Select Bus Seat
          </span>
        </div>
      </div>

      {/* Main Grid: Seat Map (Left) & Booking Summary (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* BUS SEAT MAP COMPONENT */}
        <div className="lg:col-span-7 space-y-4 w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2 font-mono">
              <Bus className="w-5 h-5 text-blue-700" /> Select Seat Positions
            </h2>
            <span className="text-xs text-slate-500 font-mono font-normal">
              {trip.vehicle?.operatorName} ({trip.vehicle?.regNumber})
            </span>
          </div>

          <BusSeatMap
            seats={tripSeats}
            selectedSeatIds={selectedSeatIds}
            onToggleSeat={handleToggleSeat}
            maxSeats={passengersCount}
          />
        </div>

        {/* TRIP SUMMARY & SEAT SELECTION SIDEBAR */}
        <div className="lg:col-span-5 space-y-6 w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-md space-y-6 lg:sticky lg:top-24 w-full">
            <h3 className="font-semibold text-slate-900 text-base border-b border-slate-200 pb-3 flex items-center gap-2 font-mono">
              <ShoppingCart className="w-5 h-5 text-blue-700" /> Reservation Summary
            </h3>

            {/* Route & Schedule Card */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-normal">
                <div className="flex items-center gap-2">
                  <img
                    src={
                      trip.vehicle?.operatorName === 'Global Coach'
                        ? '/pictures/bus.jpeg'
                        : trip.vehicle?.operatorName === 'Link Bus'
                        ? '/pictures/bus1.jpeg'
                        : trip.vehicle?.operatorName === 'MUST Express'
                        ? '/pictures/bus3.jpeg'
                        : '/pictures/bus4.jpeg'
                    }
                    alt={trip.vehicle?.operatorName || 'Bus'}
                    className="w-7 h-7 rounded-lg object-cover border border-slate-200"
                  />
                  <span>{trip.vehicle?.operatorName}</span>
                </div>
                <span className="font-mono text-blue-800 font-semibold">{trip.vehicle?.regNumber}</span>
              </div>

              <div className="text-base font-semibold text-slate-900 flex items-center justify-between font-mono">
                <span>{trip.route?.origin}</span>
                <span className="text-xs text-slate-400">→</span>
                <span>{trip.route?.destination}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-700 font-normal pt-2 border-t border-slate-200 font-mono">
                <span className="flex items-center gap-1 text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-blue-700" /> {depDateStr}
                </span>
                <span className="flex items-center gap-1 font-semibold text-blue-800">
                  <Clock className="w-3.5 h-3.5 text-blue-700" /> {depTimeStr}
                </span>
              </div>
            </div>

            {/* Selected Seats Badges */}
            <div className="space-y-2">
              <label className="text-xs text-slate-600 font-medium uppercase font-mono block">Allocated Seat Numbers</label>
              {selectedSeats.length === 0 ? (
                <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-200 text-center">
                  Click seats on the bus map to assign your tickets.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.map((s) => (
                    <span
                      key={s.id}
                      className="px-3 py-1.5 rounded-lg bg-blue-700 text-white font-mono font-semibold text-xs shadow-xs"
                    >
                      Seat {s.seatNumber}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Total Fare Calculation */}
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600 font-normal">
                <span>Fare per seat</span>
                <span className="font-mono text-slate-800">UGX {trip.priceUGX.toLocaleString()}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-600 font-normal">
                <span>Seats Selected</span>
                <span className="font-mono text-slate-800">{selectedSeatIds.length} of {passengersCount}</span>
              </div>

              <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-200">
                <span className="text-slate-900">Total Price</span>
                <span className="text-xl text-blue-800 font-mono">
                  UGX {totalFareUGX.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Continue Button */}
            <button
              onClick={handleProceedToCheckout}
              disabled={selectedSeatIds.length === 0}
              className="w-full py-3.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider shadow-sm transition-colors disabled:opacity-40"
            >
              Continue to Passenger Details &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
