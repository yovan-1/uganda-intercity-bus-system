import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { Trip } from '../types';
import { Bus, Filter, ArrowRight, Wifi, Zap, Shield } from 'lucide-react';

export const SearchResultsPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const origin = searchParams.get('origin') || 'Kampala';
  const destination = searchParams.get('destination') || 'Mbarara';
  const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const passengers = parseInt(searchParams.get('passengers') || '1', 10);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtering / Sorting
  const [sortBy, setSortBy] = useState<'time' | 'price'>('time');
  const [operatorFilter, setOperatorFilter] = useState('ALL');

  useEffect(() => {
    const fetchTrips = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await tripAPI.searchTrips({ origin, destination, date, passengers });
        if (res.data.success) {
          setTrips(res.data.trips);
        } else {
          setError('No trips found for the selected route.');
        }
      } catch (err) {
        console.error('Search trips failed:', err);
        setError('Unable to fetch bus schedules. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, [origin, destination, date, passengers]);

  const handleSelectTrip = (tripId: string) => {
    navigate(`/select-seat/${tripId}?passengers=${passengers}`);
  };

  // Filter & sort calculation
  const filteredTrips = trips
    .filter((t) => operatorFilter === 'ALL' || t.vehicle?.operatorName === operatorFilter)
    .sort((a, b) => {
      if (sortBy === 'price') return a.priceUGX - b.priceUGX;
      return new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime();
    });

  const operators = Array.from(new Set(trips.map((t) => t.vehicle?.operatorName).filter(Boolean)));

  return (
    <div className="space-y-8 pb-16 text-slate-800 text-left w-full">
      {/* Modify Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-blue-700 text-white flex items-center justify-center font-bold shadow-sm flex-shrink-0">
            <Bus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-base sm:text-lg font-semibold text-slate-900 font-mono flex-wrap">
              <span>{origin}</span>
              <ArrowRight className="w-4 h-4 text-blue-700 flex-shrink-0" />
              <span>{destination}</span>
            </div>
            <div className="text-xs text-slate-600 font-normal font-mono mt-0.5">
              Departure: <span className="text-slate-800 font-medium">{date}</span> • <span className="text-slate-800 font-medium">{passengers} Passenger{passengers > 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/')}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider transition-colors shadow-sm text-center"
        >
          Modify Search
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start w-full">
        {/* Filters Column */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-4 sm:p-5 space-y-6 border border-slate-200 shadow-sm w-full">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 className="font-semibold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-2 font-mono">
              <Filter className="w-4 h-4 text-blue-700" /> Filter Results
            </h3>
          </div>

          {/* Sort By */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider font-mono block">Sort By</label>
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
              <button
                onClick={() => setSortBy('time')}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-colors ${
                  sortBy === 'time'
                    ? 'bg-blue-700 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Earliest Departure
              </button>
              <button
                onClick={() => setSortBy('price')}
                className={`py-2 px-3 rounded-xl text-xs font-medium text-left transition-colors ${
                  sortBy === 'price'
                    ? 'bg-blue-700 text-white shadow-sm font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Cheapest Fare
              </button>
            </div>
          </div>

          {/* Operator Filter */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600 uppercase tracking-wider font-mono block">Bus Operator</label>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-normal text-slate-800 focus:border-blue-700 focus:outline-none"
            >
              <option value="ALL">All Operators ({trips.length})</option>
              {operators.map((op) => (
                <option key={op} value={op}>{op}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Trips Results Column */}
        <div className="lg:col-span-9 space-y-4 w-full">
          {loading ? (
            <div className="p-12 text-center space-y-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 border-4 border-blue-700 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-normal text-slate-500 font-mono">Loading real-time MUST bus connections...</p>
            </div>
          ) : error ? (
            <div className="p-8 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-center text-xs font-normal">
              {error}
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-600 text-xs font-normal space-y-3 shadow-sm">
              <p>No bus schedules match your filters.</p>
              <button
                onClick={() => setOperatorFilter('ALL')}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => {
              const availableCount = trip.availableSeats ?? (trip.seats ? trip.seats.filter((s) => s.isAvailable).length : 0);
              const depTimeStr = new Date(trip.departureTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const arrTimeStr = new Date(trip.arrivalTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={trip.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 transition-all space-y-4 sm:space-y-5 shadow-sm hover:border-blue-700 w-full"
                >
                  {/* Card Header: Operator & Vehicle Info */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="w-10 h-10 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 flex-shrink-0">
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
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-blue-700 text-xs bg-blue-50 px-3 py-1 rounded-lg border border-blue-200 font-mono">
                          {trip.vehicle?.operatorName || 'MUST Express'}
                        </span>
                        <span className="text-xs text-slate-600 font-mono font-normal">
                          {trip.vehicle?.regNumber} ({trip.vehicle?.totalSeats || 36} Seats)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-600 font-mono">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-normal">Direct Connection</span>
                    </div>
                  </div>

                  {/* Route Timeline & Price */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-center w-full">
                    {/* Departure Time */}
                    <div className="md:col-span-3 text-left">
                      <div className="text-lg sm:text-xl font-semibold text-slate-900 font-mono">{depTimeStr}</div>
                      <div className="text-xs font-semibold text-slate-800">{trip.route?.origin}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Main Bus Terminal</div>
                    </div>

                    {/* Timeline Line */}
                    <div className="md:col-span-4 flex flex-col items-center justify-center space-y-1 py-1 md:py-0">
                      <span className="text-[10px] text-slate-500 font-mono font-normal">Direct</span>
                      <div className="w-full flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-700 flex-shrink-0" />
                        <div className="flex-1 h-0.5 bg-slate-200" />
                        <div className="w-2 h-2 rounded-full bg-blue-700 flex-shrink-0" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono font-normal">Est. Journey</span>
                    </div>

                    {/* Arrival Time */}
                    <div className="md:col-span-3 text-left md:text-right">
                      <div className="text-lg sm:text-xl font-semibold text-slate-900 font-mono">{arrTimeStr}</div>
                      <div className="text-xs font-semibold text-slate-800">{trip.route?.destination}</div>
                      <div className="text-[10px] text-slate-500 font-normal">Central Station</div>
                    </div>

                    {/* Fare & Select Seat CTA */}
                    <div className="md:col-span-2 text-left md:text-right space-y-2 border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                      <div className="flex items-center justify-start md:justify-end gap-2 text-xs text-slate-500">
                        <Wifi className="w-3.5 h-3.5 text-blue-700" />
                        <Zap className="w-3.5 h-3.5 text-blue-700" />
                        <Shield className="w-3.5 h-3.5 text-blue-700" />
                      </div>

                      <div className="text-lg sm:text-xl font-semibold text-slate-900 font-mono">
                        UGX {trip.priceUGX.toLocaleString()}
                      </div>

                      <div className="text-[10px] text-slate-500 font-normal font-mono">
                        {availableCount} seats left
                      </div>

                      <button
                        onClick={() => handleSelectTrip(trip.id)}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider flex items-center justify-center gap-1 transition-colors shadow-sm"
                      >
                        Select Bus & Seat &gt;
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
