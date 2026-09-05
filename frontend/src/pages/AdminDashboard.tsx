import React, { useState, useEffect } from 'react';
import { adminAPI, tripAPI, bookingAPI } from '../services/api';
import { User, Vehicle, Route, Booking } from '../types';
import { ShieldCheck, Bus, Users, Ticket, DollarSign, Plus, Loader2 } from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'FLEET' | 'TRIPS' | 'USERS' | 'BOOKINGS'>('FLEET');

  const [stats, setStats] = useState<any>(null);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  // New Vehicle Form State
  const [newVehicle, setNewVehicle] = useState({
    regNumber: '',
    model: 'Scania Marcopolo G7',
    totalSeats: 36,
    operatorName: 'Global Coach',
    driverName: '',
  });

  // New Trip Form State
  const [newTrip, setNewTrip] = useState({
    routeId: '',
    vehicleId: '',
    departureTime: '',
    arrivalTime: '',
    priceUGX: 30000,
  });

  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, vehiclesRes, usersRes, routesRes, bookingsRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getVehicles(),
        adminAPI.getUsers(),
        tripAPI.getRoutes(),
        bookingAPI.getAllBookings(),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.vehicles);
      if (usersRes.data.success) setUsers(usersRes.data.users);
      if (routesRes.data.success) {
        setRoutes(routesRes.data.routes);
        if (routesRes.data.routes.length > 0) {
          setNewTrip((prev) => ({ ...prev, routeId: routesRes.data.routes[0].id }));
        }
      }
      if (bookingsRes.data.success) setBookings(bookingsRes.data.bookings);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicle.regNumber || !newVehicle.driverName) return;

    try {
      const res = await adminAPI.createVehicle(newVehicle);
      if (res.data.success) {
        setActionMsg('Vehicle added to fleet successfully!');
        setNewVehicle({ regNumber: '', model: 'Scania Marcopolo G7', totalSeats: 36, operatorName: 'Global Coach', driverName: '' });
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleCreateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTrip.routeId || !newTrip.vehicleId || !newTrip.departureTime || !newTrip.arrivalTime) return;

    try {
      const res = await tripAPI.createTrip(newTrip);
      if (res.data.success) {
        setActionMsg('New trip scheduled successfully!');
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to schedule trip');
    }
  };

  const handleUpdateRole = async (userId: string, role: string) => {
    try {
      await adminAPI.updateUserRole(userId, role);
      setUsers(users.map((u) => (u.id === userId ? { ...u, role: role as any } : u)));
    } catch (err: any) {
      alert(err.response?.data?.message || 'Role update failed');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="w-10 h-10 border-purple-500 text-purple-400 animate-spin mx-auto" />
        <p className="text-slate-400 text-sm mt-2">Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-16 w-full text-left">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 w-full">
        <div>
          <span className="text-xs font-mono text-purple-400 uppercase tracking-widest block flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> MUST Administrative Control Center
          </span>
          <h1 className="text-xl sm:text-3xl font-extrabold text-white">
            System Admin Operations & Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-1">Manage fleet, routes, user roles, reservations, and platform revenue.</p>
        </div>
      </div>

      {/* Metrics Cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400">Total System Revenue</span>
            <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">
              UGX {stats.totalRevenueUGX.toLocaleString()}
            </div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400">Total Reservations</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalBookings}</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400">Fleet Vehicles</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalVehicles}</div>
          </div>

          <div className="glass-card p-5 sm:p-6 rounded-2xl space-y-2">
            <span className="text-xs text-slate-400">Registered Users</span>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats.totalUsers}</div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 text-xs font-bold overflow-x-auto bus-grid-scrollbar w-full">
        {[
          { key: 'FLEET', label: 'Fleet & Vehicle Management', icon: Bus },
          { key: 'TRIPS', label: 'Trip Schedule Creator', icon: Ticket },
          { key: 'USERS', label: 'User Role Manager', icon: Users },
          { key: 'BOOKINGS', label: 'Reservations & Payments', icon: DollarSign },
        ].map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key as any)}
              className={`px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all whitespace-nowrap ${
                activeTab === t.key
                  ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" /> {t.label}
            </button>
          );
        })}
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between">
          <span>{actionMsg}</span>
          <button onClick={() => setActionMsg('')} className="text-emerald-400 font-bold">✕</button>
        </div>
      )}

      {/* TAB 1: FLEET MANAGEMENT */}
      {activeTab === 'FLEET' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 w-full">
          {/* Add Vehicle Form */}
          <div className="lg:col-span-5 space-y-4 w-full">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 w-full">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Add New Bus to Fleet
              </h3>
              <form onSubmit={handleAddVehicle} className="space-y-3 text-xs w-full">
                <div>
                  <label className="text-slate-300 font-medium block mb-1">Registration Number</label>
                  <input
                    type="text"
                    value={newVehicle.regNumber}
                    onChange={(e) => setNewVehicle({ ...newVehicle, regNumber: e.target.value })}
                    placeholder="UBG 421X"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Bus Model</label>
                  <input
                    type="text"
                    value={newVehicle.model}
                    onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })}
                    placeholder="Scania Marcopolo G7"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Total Capacity</label>
                    <select
                      value={newVehicle.totalSeats}
                      onChange={(e) => setNewVehicle({ ...newVehicle, totalSeats: parseInt(e.target.value) })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value={28}>28 Seats (VIP)</option>
                      <option value={36}>36 Seats (Standard)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-slate-300 font-medium block mb-1">Operator</label>
                    <select
                      value={newVehicle.operatorName}
                      onChange={(e) => setNewVehicle({ ...newVehicle, operatorName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option value="Global Coach">Global Coach</option>
                      <option value="Link Bus">Link Bus</option>
                      <option value="Jaguar Executive">Jaguar Executive VIP</option>
                      <option value="Mbarara Express">Mbarara Express</option>
                      <option value="Horizon Executive">Horizon Executive</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-slate-300 font-medium block mb-1">Assigned Driver Name</label>
                  <input
                    type="text"
                    value={newVehicle.driverName}
                    onChange={(e) => setNewVehicle({ ...newVehicle, driverName: e.target.value })}
                    placeholder="e.g. Kato Paul"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg"
                >
                  Save Vehicle & Generate Seats
                </button>
              </form>
            </div>
          </div>

          {/* Fleet Table */}
          <div className="lg:col-span-7 space-y-4 w-full">
            <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 w-full">
              <h3 className="font-bold text-white text-base">Fleet Register ({vehicles.length} Vehicles)</h3>
              <div className="overflow-x-auto bus-grid-scrollbar w-full">
                <table className="w-full min-w-[500px] text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Reg No</th>
                      <th className="p-3">Model</th>
                      <th className="p-3">Operator</th>
                      <th className="p-3">Seats</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {vehicles.map((v) => (
                      <tr key={v.id}>
                        <td className="p-3 font-bold font-mono text-emerald-400">{v.regNumber}</td>
                        <td className="p-3 font-semibold text-white">{v.model}</td>
                        <td className="p-3">{v.operatorName}</td>
                        <td className="p-3 font-mono">{v.totalSeats}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                            {v.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TRIP BUILDER */}
      {activeTab === 'TRIPS' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 max-w-2xl mx-auto space-y-4 w-full">
          <h3 className="font-bold text-white text-base flex items-center gap-2">
            <Plus className="w-4 h-4 text-emerald-400" /> Schedule New Bus Trip
          </h3>
          <form onSubmit={handleCreateTrip} className="space-y-4 text-xs w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Route</label>
                <select
                  value={newTrip.routeId}
                  onChange={(e) => setNewTrip({ ...newTrip, routeId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.origin} → {r.destination} ({r.estimatedDuration})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Assigned Fleet Vehicle</label>
                <select
                  value={newTrip.vehicleId}
                  onChange={(e) => setNewTrip({ ...newTrip, vehicleId: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.operatorName} - {v.regNumber} ({v.model})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Departure Time</label>
                <input
                  type="datetime-local"
                  value={newTrip.departureTime}
                  onChange={(e) => setNewTrip({ ...newTrip, departureTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Arrival Time</label>
                <input
                  type="datetime-local"
                  value={newTrip.arrivalTime}
                  onChange={(e) => setNewTrip({ ...newTrip, arrivalTime: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Fare Per Seat (UGX)</label>
              <input
                type="number"
                step="1000"
                value={newTrip.priceUGX}
                onChange={(e) => setNewTrip({ ...newTrip, priceUGX: parseInt(e.target.value) })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg"
            >
              Schedule & Publish Trip
            </button>
          </form>
        </div>
      )}

      {/* TAB 3: USER ROLES */}
      {activeTab === 'USERS' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 w-full">
          <h3 className="font-bold text-white text-base">User Directory & Role Authorization</h3>
          <div className="overflow-x-auto bus-grid-scrollbar w-full">
            <table className="w-full min-w-[620px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">User Name</th>
                  <th className="p-3">Email Address</th>
                  <th className="p-3">Phone</th>
                  <th className="p-3">Assigned Role</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="p-3 font-bold text-white">{u.name}</td>
                    <td className="p-3">{u.email}</td>
                    <td className="p-3 font-mono">{u.phone}</td>
                    <td className="p-3 font-bold">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] ${
                          u.role === 'ADMIN'
                            ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                            : u.role === 'STAFF'
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 space-x-1 whitespace-nowrap">
                      {['CUSTOMER', 'STAFF', 'ADMIN'].map((r) => (
                        <button
                          key={r}
                          disabled={u.role === r}
                          onClick={() => handleUpdateRole(u.id, r)}
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            u.role === r ? 'opacity-40 cursor-default' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                          }`}
                        >
                          Make {r}
                        </button>
                      ))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: BOOKINGS & PAYMENTS */}
      {activeTab === 'BOOKINGS' && (
        <div className="glass-panel p-5 sm:p-6 rounded-3xl border border-slate-800 space-y-4 w-full">
          <h3 className="font-bold text-white text-base">All Reservations & Financial Audit</h3>
          <div className="overflow-x-auto bus-grid-scrollbar w-full">
            <table className="w-full min-w-[580px] text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-mono uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Route</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bookings.map((b) => (
                  <tr key={b.id}>
                    <td className="p-3 font-bold font-mono text-emerald-400">{b.bookingRef}</td>
                    <td className="p-3 font-semibold text-white">{b.user?.name || 'Customer'}</td>
                    <td className="p-3">{b.trip.route.origin} → {b.trip.route.destination}</td>
                    <td className="p-3 font-mono font-bold text-white">UGX {b.totalAmountUGX.toLocaleString()}</td>
                    <td className="p-3 font-mono text-emerald-300">{b.payment?.method || 'MTN_MOMO'}</td>
                    <td className="p-3 font-bold">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px]">
                        {b.bookingStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
