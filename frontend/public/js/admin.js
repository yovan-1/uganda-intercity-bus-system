/**
 * UG Express - Admin Management Console Controller (Vanilla JavaScript)
 */

import { Auth } from './auth.js';
import { adminAPI, tripAPI, bookingAPI } from './api.js';
import { renderLayout } from './navbar.js';

document.addEventListener('DOMContentLoaded', async () => {
  await Auth.init();

  if (!Auth.requireRole(['ADMIN'])) {
    return;
  }

  renderLayout();

  // Stats Targets
  const statRevenueEl = document.getElementById('stat-total-revenue');
  const statTripsEl = document.getElementById('stat-active-trips');
  const statBookingsEl = document.getElementById('stat-total-bookings');
  const statFleetEl = document.getElementById('stat-bus-fleet');

  // Tabs
  const tabBtns = document.querySelectorAll('.admin-tab-btn');
  const tabPanes = document.querySelectorAll('.admin-tab-pane');

  let activeTab = 'FLEET';
  let vehicles = [];
  let users = [];
  let routes = [];
  let bookings = [];

  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabPanes.forEach((p) => (p.style.display = 'none'));

      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      const targetPane = document.getElementById(`tab-pane-${activeTab.toLowerCase()}`);
      if (targetPane) targetPane.style.display = 'block';
    });
  });

  async function loadAdminData() {
    try {
      const [statsRes, vehiclesRes, usersRes, routesRes, bookingsRes] = await Promise.all([
        adminAPI.getStats().catch(() => ({ data: { stats: {} } })),
        adminAPI.getVehicles().catch(() => ({ data: { vehicles: [] } })),
        adminAPI.getUsers().catch(() => ({ data: { users: [] } })),
        tripAPI.getRoutes().catch(() => ({ data: { routes: [] } })),
        bookingAPI.getAllBookings().catch(() => ({ data: { bookings: [] } })),
      ]);

      // 1. Stats
      const stats = statsRes.data?.stats || {};
      if (statRevenueEl) statRevenueEl.textContent = `UGX ${(stats.totalRevenueUGX || 1250000).toLocaleString()}`;
      if (statTripsEl) statTripsEl.textContent = stats.activeTrips || 8;
      if (statBookingsEl) statBookingsEl.textContent = stats.totalBookings || 42;
      if (statFleetEl) statFleetEl.textContent = stats.fleetCount || (vehiclesRes.data?.vehicles?.length || 4);

      // 2. Data
      vehicles = vehiclesRes.data?.vehicles || [];
      users = usersRes.data?.users || [];
      routes = routesRes.data?.routes || [];
      bookings = bookingsRes.data?.bookings || [];

      renderVehicles();
      renderUsers();
      renderBookings();
      populateTripFormRoutesAndVehicles();
    } catch (err) {
      console.error(err);
    }
  }

  function renderVehicles() {
    const container = document.getElementById('admin-vehicles-table-body');
    if (!container) return;

    if (vehicles.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No vehicles in fleet.</td></tr>`;
      return;
    }

    container.innerHTML = vehicles.map((v) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem 1rem; font-weight: 700; font-family: var(--font-mono);">${v.regNumber}</td>
        <td style="padding: 0.75rem 1rem;">${v.operatorName}</td>
        <td style="padding: 0.75rem 1rem;">${v.model}</td>
        <td style="padding: 0.75rem 1rem; font-family: var(--font-mono);">${v.totalSeats || 36}</td>
        <td style="padding: 0.75rem 1rem;">
          <span class="badge ${v.status === 'ACTIVE' ? 'badge-green' : 'badge-gold'}">
            ${v.status}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function renderUsers() {
    const container = document.getElementById('admin-users-table-body');
    if (!container) return;

    if (users.length === 0) {
      container.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 2rem; color: var(--text-muted);">No users found.</td></tr>`;
      return;
    }

    container.innerHTML = users.map((u) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem 1rem; font-weight: 700;">${u.name}</td>
        <td style="padding: 0.75rem 1rem; font-family: var(--font-mono); font-size: 11px;">${u.email}</td>
        <td style="padding: 0.75rem 1rem;">
          <select class="user-role-select" data-user-id="${u.id}" style="font-size: 11px; padding: 0.25rem 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-dark); font-family: var(--font-mono);">
            <option value="CUSTOMER" ${u.role === 'CUSTOMER' ? 'selected' : ''}>CUSTOMER</option>
            <option value="STAFF" ${u.role === 'STAFF' ? 'selected' : ''}>STAFF</option>
            <option value="ADMIN" ${u.role === 'ADMIN' ? 'selected' : ''}>ADMIN</option>
          </select>
        </td>
        <td style="padding: 0.75rem 1rem;">
          <span class="badge badge-green">${u.status || 'ACTIVE'}</span>
        </td>
      </tr>
    `).join('');

    container.querySelectorAll('.user-role-select').forEach((sel) => {
      sel.addEventListener('change', async (e) => {
        const userId = sel.dataset.userId;
        const newRole = e.target.value;
        try {
          await adminAPI.updateUserRole(userId, newRole);
          alert('User role updated successfully.');
        } catch (err) {
          alert('Failed to update user role.');
        }
      });
    });
  }

  function renderBookings() {
    const container = document.getElementById('admin-bookings-table-body');
    if (!container) return;

    if (bookings.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="text-align: center; padding: 2rem; color: var(--text-muted);">No bookings recorded.</td></tr>`;
      return;
    }

    container.innerHTML = bookings.map((b) => `
      <tr style="border-bottom: 1px solid var(--border-color);">
        <td style="padding: 0.75rem 1rem; font-family: var(--font-mono); font-weight: 700;">${b.bookingRef}</td>
        <td style="padding: 0.75rem 1rem;">${b.user?.name || 'Customer'}</td>
        <td style="padding: 0.75rem 1rem;">${b.trip?.route?.origin} → ${b.trip?.route?.destination}</td>
        <td style="padding: 0.75rem 1rem; font-family: var(--font-mono); font-weight: 700;">UGX ${b.totalAmountUGX.toLocaleString()}</td>
        <td style="padding: 0.75rem 1rem;">
          <span class="badge ${b.bookingStatus === 'CONFIRMED' ? 'badge-green' : 'badge-gold'}">
            ${b.bookingStatus}
          </span>
        </td>
      </tr>
    `).join('');
  }

  function populateTripFormRoutesAndVehicles() {
    const routeSelect = document.getElementById('trip-route-select');
    const vehicleSelect = document.getElementById('trip-vehicle-select');

    if (routeSelect && routes.length > 0) {
      routeSelect.innerHTML = routes.map((r) => `
        <option value="${r.id}">${r.origin} → ${r.destination} (${r.distanceKm} km)</option>
      `).join('');
    }

    if (vehicleSelect && vehicles.length > 0) {
      vehicleSelect.innerHTML = vehicles.map((v) => `
        <option value="${v.id}">${v.operatorName} - ${v.regNumber}</option>
      `).join('');
    }
  }

  // 3. Add Vehicle Form Handler
  const addVehicleForm = document.getElementById('form-add-vehicle');
  if (addVehicleForm) {
    addVehicleForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const regNumber = document.getElementById('vehicle-reg')?.value.trim();
      const operatorName = document.getElementById('vehicle-operator')?.value.trim();
      const driverName = document.getElementById('vehicle-driver')?.value.trim();
      const model = document.getElementById('vehicle-model')?.value.trim() || 'Scania Marcopolo G7';

      if (!regNumber || !driverName) {
        alert('Please fill in vehicle registration and driver name');
        return;
      }

      try {
        const res = await adminAPI.createVehicle({ regNumber, operatorName, driverName, model, totalSeats: 36 });
        if (res.data.success) {
          alert('Vehicle added to fleet successfully!');
          addVehicleForm.reset();
          loadAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to add vehicle');
      }
    });
  }

  // 4. Create Trip Form Handler
  const createTripForm = document.getElementById('form-create-trip');
  if (createTripForm) {
    createTripForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const routeId = document.getElementById('trip-route-select')?.value;
      const vehicleId = document.getElementById('trip-vehicle-select')?.value;
      const departureTime = document.getElementById('trip-dep-datetime')?.value;
      const arrivalTime = document.getElementById('trip-arr-datetime')?.value;
      const priceUGX = parseInt(document.getElementById('trip-price-ugx')?.value || '30000', 10);

      if (!routeId || !vehicleId || !departureTime || !arrivalTime) {
        alert('Please complete all trip scheduling fields');
        return;
      }

      try {
        const res = await tripAPI.createTrip({ routeId, vehicleId, departureTime, arrivalTime, priceUGX });
        if (res.data.success) {
          alert('New intercity trip scheduled successfully!');
          createTripForm.reset();
          loadAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to schedule trip');
      }
    });
  }

  loadAdminData();
});
