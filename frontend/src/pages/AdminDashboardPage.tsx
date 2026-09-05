import React, { useState, useEffect } from 'react';
import { adminAPI, tripAPI } from '../services/api';
import { Trip, Vehicle, Route as RouteType } from '../types';
import { ShieldCheck, Bus, Plus, Route, Users, DollarSign } from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [routes, setRoutes] = useState<RouteType[]>([]);

  // New Trip Form State
  const [newTrip, setNewTrip] = useState({
    routeId: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    priceUGX: 35000,
  });
  const [createMsg, setCreateMsg] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [statsRes, tripsRes, vehRes, routeRes] = await Promise.all([
          adminAPI.getStats(),
          tripAPI.searchTrips({}),
          adminAPI.getVehicles(),
          tripAPI.getRoutes(),
        ]);

        if (statsRes.data.success) setStats(statsRes.data.stats);
        if (tripsRes.data.success) setTrips(tripsRes.data.trips);
        if (vehRes.data.success) setVehicles(vehRes.data.vehicles);
        if (routeRes.data.success) setRoutes(routeRes.data.routes);
      } catch (err) {
        console.error('Failed to load admin data:', err);
      }
    };

    fetchAdminData();
  }, []);

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateMsg('');
    if (!newTrip.routeId || !newTrip.vehicleId || !newTrip.departureTime || !newTrip.arrivalTime) {
      setCreateMsg('Please fill in all required fields.');
      return;
    }

    try {
      const res = await tripAPI.createTrip(newTrip);
      if (res.data.success) {
        setTrips([res.data.trip, ...trips]);
        setCreateMsg('New bus trip scheduled successfully!');
        setNewTrip({ routeId: '', vehicleId: '', departureTime: '', arrivalTime: '', priceUGX: 35000 });
      }
    } catch (err: any) {
      console.error('Failed to create trip:', err);
      setCreateMsg(err.response?.data?.error || 'Failed to create trip.');
    }
  };

  return (
    <div className="space-y-8 pb-16 text-[#242424] text-left">
      {/* Header Banner */}
      <div className="bg-white border-2 border-[#1E3A8A] rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-[#242424] flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-[#1E3A8A]" /> MUST Fleet & Admin Dashboard
          </h1>
          <p className="text-xs text-slate-500 font-bold font-mono">
            Full system control • Schedule bus trips, manage vehicles & view financial metrics.
          </p>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
            <span>Total Revenue</span>
            <DollarSign className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-black text-[#242424] font-mono">
            UGX {stats?.totalRevenue?.toLocaleString() || '1,250,000'}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
            <span>Total Bookings</span>
            <Users className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-black text-[#242424] font-mono">
            {stats?.totalBookings || 42}
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
            <span>Active Bus Fleet</span>
            <Bus className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-black text-[#242424] font-mono">
            {vehicles.length || 3} Coaches
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-200 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-bold">
            <span>Serviced Routes</span>
            <Route className="w-4 h-4 text-[#1E3A8A]" />
          </div>
          <div className="text-2xl font-black text-[#242424] font-mono">
            {routes.length || 5} Routes
          </div>
        </div>
      </div>

      {/* Schedule New Trip Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-3">
          <Plus className="w-4 h-4 text-[#1E3A8A]" /> Schedule New Bus Trip
        </h3>

        <form onSubmit={handleCreateTrip} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div>
            <label className="text-[11px] font-bold text-[#242424] block mb-1">Route</label>
            <select
              value={newTrip.routeId}
              onChange={(e) => setNewTrip({ ...newTrip, routeId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#242424]"
            >
              <option value="">Select Route</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>{r.origin} → {r.destination}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#242424] block mb-1">Vehicle / Coach</label>
            <select
              value={newTrip.vehicleId}
              onChange={(e) => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#242424]"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.id} value={v.id}>{v.operatorName} ({v.regNumber})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#242424] block mb-1">Departure</label>
            <input
              type="datetime-local"
              value={newTrip.departureTime}
              onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs font-bold text-[#242424]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#242424] block mb-1">Arrival</label>
            <input
              type="datetime-local"
              value={newTrip.arrivalTime}
              onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
              className="w-full bg-white border border-slate-300 rounded-xl px-2 py-2 text-xs font-bold text-[#242424]"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-[#242424] block mb-1">Fare (UGX)</label>
            <input
              type="number"
              step="1000"
              value={newTrip.priceUGX}
              onChange={(e) => setNewTrip({ ...newTrip, priceUGX: parseInt(e.target.value, 10) })}
              className="w-full bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-[#242424]"
            />
          </div>

          <div className="pt-5">
            <button
              type="submit"
              className="w-full py-2.5 bg-[#1E3A8A] hover:bg-[#1b365d] text-white font-black text-xs uppercase rounded-xl shadow-md"
            >
              Add Schedule
            </button>
          </div>
        </form>

        {createMsg && (
          <p className="text-xs font-bold text-[#1E3A8A] pt-2">{createMsg}</p>
        )}
      </div>

      {/* Scheduled Trips Table */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-200 space-y-4">
        <h3 className="text-sm font-black text-[#242424] uppercase tracking-wider font-mono flex items-center gap-2">
          <Bus className="w-4 h-4 text-[#1E3A8A]" /> All Active Trips ({trips.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-extrabold uppercase">
                <th className="pb-2">Route</th>
                <th className="pb-2">Operator & Coach</th>
                <th className="pb-2">Departure</th>
                <th className="pb-2">Fare</th>
                <th className="pb-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {trips.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="py-3 font-extrabold text-[#242424]">
                    {t.route?.origin} → {t.route?.destination}
                  </td>
                  <td className="py-3 text-slate-600 font-bold">
                    {t.vehicle?.operatorName || 'MUST Express'} ({t.vehicle?.regNumber})
                  </td>
                  <td className="py-3 text-slate-600">
                    {new Date(t.departureTime).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-3 font-black text-[#1E3A8A]">
                    UGX {t.priceUGX.toLocaleString()}
                  </td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-1 rounded bg-blue-50 text-[#1E3A8A] border border-[#1E3A8A]/20 font-bold">
                      Active
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
