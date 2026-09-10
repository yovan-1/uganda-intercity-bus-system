import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI } from '../services/api';
import { searchSchema } from '../schemas/validation';
import { MapPin, Calendar, Users, ArrowRightLeft, Search, ChevronLeft, ChevronRight, Info, Wifi, Zap, Smartphone, ShieldCheck } from 'lucide-react';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  // Route choices
  const [origins, setOrigins] = useState<string[]>(['Kampala', 'Mbarara', 'Kabale', 'Fort Portal', 'Gulu', 'Jinja']);
  const [destinations, setDestinations] = useState<string[]>(['Mbarara', 'Kampala', 'Kabale', 'Fort Portal', 'Gulu', 'Jinja']);

  const todayObj = new Date();
  const todayStr = todayObj.toISOString().split('T')[0];

  // Search Mask State
  const [tripType, setTripType] = useState<'ONE_WAY' | 'ROUND_TRIP'>('ONE_WAY');
  const [origin, setOrigin] = useState('Kampala');
  const [destination, setDestination] = useState('Mbarara');
  const [departureDate, setDepartureDate] = useState(todayStr);
  const [returnDate] = useState('');
  const [passengers, setPassengers] = useState(1);
  const [findAccommodation, setFindAccommodation] = useState(true);

  const [passengerDropdownOpen, setPassengerDropdownOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const res = await tripAPI.getRoutes();
        if (res.data.success && res.data.origins.length > 0) {
          setOrigins(res.data.origins);
          setDestinations(res.data.destinations);
        }
      } catch (err) {
        console.error('Failed to load routes from backend:', err);
      }
    };
    fetchRoutes();
  }, []);

  const handleSwap = () => {
    const temp = origin;
    setOrigin(destination);
    setDestination(temp);
  };

  const handleDateStep = (days: number) => {
    const curr = new Date(departureDate || todayStr);
    curr.setDate(curr.getDate() + days);
    if (curr >= new Date(todayStr)) {
      setDepartureDate(curr.toISOString().split('T')[0]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const result = searchSchema.safeParse({
      origin,
      destination,
      date: departureDate,
      passengers,
      returnDate: tripType === 'ROUND_TRIP' ? returnDate : undefined,
    });

    if (!result.success) {
      const formattedErrors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        if (err.path[0]) formattedErrors[err.path[0].toString()] = err.message;
      });
      setErrors(formattedErrors);
      return;
    }

    let url = `/search?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&date=${departureDate}&passengers=${passengers}`;
    if (tripType === 'ROUND_TRIP' && returnDate) {
      url += `&returnDate=${returnDate}`;
    }
    navigate(url);
  };

  return (
    <div className="space-y-12 pb-16 w-full max-w-full">
      {/* HERO BANNER & SEARCH CONTAINER */}
      <div className="relative w-full">
        {/* TALL HERO BANNER WITH ORIGINAL BUS BACKGROUND PHOTO */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl min-h-[380px] sm:min-h-[460px] flex flex-col justify-start p-5 sm:p-10 lg:p-12 text-white w-full">
          {/* Original Bus Photo Background */}
          <div
            className="absolute inset-0 bg-cover bg-center pointer-events-none"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1920&q=80')`,
            }}
          />

          {/* Soft Gradient Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/20 to-transparent pointer-events-none" />

          {/* Hero Headline Overlay */}
          <div className="relative z-10 space-y-3 pt-2 text-left max-w-2xl">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight leading-tight drop-shadow-md">
              Low cost bus travel
            </h1>
            <p className="text-slate-100 text-xs sm:text-sm lg:text-base font-normal drop-shadow-sm">
              Official intercity digital bus booking platform across Uganda.
            </p>
          </div>
        </div>

        {/* FLOATING CLEAN WHITE SEARCH MASK CARD */}
        <div className="relative z-20 -mt-20 sm:-mt-28 max-w-6xl mx-auto px-2 sm:px-4 w-full">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xl space-y-4 text-left text-slate-800 w-full">
            {/* Top Radio Toggles */}
            <div className="flex items-center gap-6 sm:gap-8 text-xs font-normal text-slate-700">
              <label className="flex items-center gap-2 cursor-pointer hover:text-blue-700 transition-colors">
                <input
                  type="radio"
                  name="tripType"
                  checked={tripType === 'ONE_WAY'}
                  onChange={() => setTripType('ONE_WAY')}
                  className="w-4 h-4 accent-blue-700 cursor-pointer"
                />
                <span className={tripType === 'ONE_WAY' ? 'text-blue-700 font-medium' : ''}>One Way</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer hover:text-blue-700 transition-colors">
                <input
                  type="radio"
                  name="tripType"
                  checked={tripType === 'ROUND_TRIP'}
                  onChange={() => setTripType('ROUND_TRIP')}
                  className="w-4 h-4 accent-blue-700 cursor-pointer"
                />
                <span className={tripType === 'ROUND_TRIP' ? 'text-blue-700 font-medium' : ''}>Round Trip</span>
              </label>
            </div>

            {/* Form Inputs Grid */}
            <form onSubmit={handleSearch} className="space-y-4 w-full">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center w-full">
                {/* From Input */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block uppercase tracking-wider font-mono">From</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <select
                      value={origin}
                      onChange={(e) => setOrigin(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-normal text-xs focus:border-blue-700 focus:outline-none"
                    >
                      {origins.map((o) => (
                        <option key={o} value={o}>{o}</option>
                      ))}
                    </select>
                  </div>
                  {errors.origin && <p className="text-red-600 text-[11px] font-normal">{errors.origin}</p>}
                </div>

                {/* Overlapping Swap Icon Button */}
                <div className="md:col-span-1 flex items-center justify-center py-1 md:pt-4">
                  <button
                    type="button"
                    onClick={handleSwap}
                    className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 flex items-center justify-center transition-colors shadow-sm"
                    title="Swap Departure and Destination"
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                  </button>
                </div>

                {/* To Input */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block uppercase tracking-wider font-mono">To</label>
                  <div className="relative flex items-center">
                    <MapPin className="w-4 h-4 text-slate-500 absolute left-3 pointer-events-none" />
                    <select
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-800 font-normal text-xs focus:border-blue-700 focus:outline-none"
                    >
                      {destinations.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  {errors.destination && <p className="text-red-600 text-[11px] font-normal">{errors.destination}</p>}
                </div>

                {/* Departure Date Input */}
                <div className="md:col-span-3 space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block uppercase tracking-wider font-mono">Departure</label>
                  <div className="relative flex items-center bg-slate-50 border border-slate-200 rounded-xl px-2 py-1 focus-within:border-blue-700">
                    <Calendar className="w-4 h-4 text-slate-500 ml-1 flex-shrink-0" />
                    <input
                      type="date"
                      min={todayStr}
                      value={departureDate}
                      onChange={(e) => setDepartureDate(e.target.value)}
                      className="bg-transparent text-slate-800 font-normal text-xs px-2 py-1.5 focus:outline-none w-full min-w-0"
                    />
                    <div className="flex items-center gap-0.5 border-l border-slate-200 pl-1 text-slate-500 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleDateStep(-1)}
                        className="p-1 hover:text-blue-700"
                        title="Previous Day"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDateStep(1)}
                        className="p-1 hover:text-blue-700"
                        title="Next Day"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                  {errors.date && <p className="text-red-600 text-[11px] font-normal">{errors.date}</p>}
                </div>

                {/* Passengers Dropdown */}
                <div className="md:col-span-2 space-y-1">
                  <label className="text-[11px] font-medium text-slate-600 block uppercase tracking-wider font-mono">Passengers</label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setPassengerDropdownOpen(!passengerDropdownOpen)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-normal text-xs flex items-center justify-between focus:border-blue-700"
                    >
                      <span className="truncate">{passengers} Adult{passengers > 1 ? 's' : ''}</span>
                      <Users className="w-4 h-4 text-slate-500 flex-shrink-0 ml-1" />
                    </button>

                    {passengerDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl p-4 shadow-xl z-30 space-y-3 text-xs min-w-[220px]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-slate-800">Adult Passengers</div>
                            <div className="text-[10px] text-slate-500 font-normal">Standard Adult Fare</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              disabled={passengers <= 1}
                              onClick={() => setPassengers(Math.max(1, passengers - 1))}
                              className="w-7 h-7 rounded-lg bg-blue-700 text-white disabled:opacity-40 font-medium"
                            >
                              -
                            </button>
                            <span className="font-medium text-sm text-slate-800 w-4 text-center">{passengers}</span>
                            <button
                              type="button"
                              disabled={passengers >= 6}
                              onClick={() => setPassengers(Math.min(6, passengers + 1))}
                              className="w-7 h-7 rounded-lg bg-blue-700 text-white disabled:opacity-40 font-medium"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setPassengerDropdownOpen(false)}
                          className="w-full py-1.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-center transition-colors"
                        >
                          Apply
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* SEARCH CTA BUTTON */}
                <div className="md:col-span-2 pt-2 md:pt-5">
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-medium text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Search className="w-4 h-4 flex-shrink-0" />
                    Search
                  </button>
                </div>
              </div>

              {/* Bottom Checkbox */}
              <div className="pt-2 flex items-center gap-2 text-xs text-slate-600 font-normal">
                <input
                  type="checkbox"
                  id="accommodation"
                  checked={findAccommodation}
                  onChange={(e) => setFindAccommodation(e.target.checked)}
                  className="w-4 h-4 accent-blue-700 rounded cursor-pointer flex-shrink-0"
                />
                <label htmlFor="accommodation" className="cursor-pointer select-none">
                  Find my accommodation
                </label>
                <span title="Find top city & traveler hotel stays">
                  <Info className="w-3.5 h-3.5 text-blue-700 cursor-pointer flex-shrink-0" />
                </span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* POPULAR BUS CONNECTIONS WITH MATCHING PICTURES */}
      <div className="space-y-4 text-left w-full">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Popular Bus Connections</h2>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
            Official Schedules
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {[
            { title: 'Kampala ↔ Mbarara', dist: '280 km', time: '4h 30m', price: 'UGX 30,000', desc: 'Direct luxury coach travel between Kampala and Mbarara', img: '/pictures/bus.jpeg' },
            { title: 'Kampala ↔ Kabale', dist: '410 km', time: '7h 00m', price: 'UGX 45,000', desc: 'Executive seating & Wi-Fi', img: '/pictures/bus1.jpeg' },
            { title: 'Kampala ↔ Fort Portal', dist: '300 km', time: '5h 00m', price: 'UGX 35,000', desc: 'Daily morning departures', img: '/pictures/bus3.jpeg' },
            { title: 'Kampala ↔ Gulu', dist: '335 km', time: '5h 30m', price: 'UGX 40,000', desc: 'Express highway route', img: '/pictures/bus4.jpeg' },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => navigate(`/search?origin=${item.title.split(' ↔ ')[0]}&destination=${item.title.split(' ↔ ')[1]}&date=${departureDate}&passengers=1`)}
              className="bg-white rounded-2xl p-4 cursor-pointer hover:border-blue-700 space-y-3 text-left border border-slate-200 shadow-sm transition-all hover:shadow-md overflow-hidden flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="overflow-hidden rounded-xl h-36 bg-slate-100">
                  <img
                    src={item.img}
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500 font-mono font-normal">
                  <span>{item.dist}</span>
                  <span>{item.time}</span>
                </div>
                <h3 className="font-semibold text-slate-900 text-base">{item.title}</h3>
                <p className="text-xs text-slate-600 font-normal">{item.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500 font-normal">Fare from</span>
                <span className="font-medium text-white bg-blue-700 px-2.5 py-1 rounded text-xs">
                  {item.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AMENITIES SECTION WITH MATCHING PICTURES */}
      <div className="bg-slate-50 p-4 sm:p-8 rounded-3xl space-y-6 border border-slate-200 w-full">
        <h3 className="text-lg sm:text-xl font-semibold text-slate-900 text-center">Intercity Bus Passenger Amenities</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 w-full">
          {/* Free Wi-Fi */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-center shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-hidden rounded-xl h-32 bg-slate-100">
              <img
                src="/pictures/wifi.jpeg"
                alt="Free Wi-Fi"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-blue-700">
                <Wifi className="w-4 h-4 flex-shrink-0" />
                <h4 className="font-semibold text-slate-900 text-sm">Free Wi-Fi</h4>
              </div>
              <p className="text-xs text-slate-600 font-normal">High-speed internet on all intercity routes.</p>
            </div>
          </div>

          {/* Power Outlets */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-center shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-hidden rounded-xl h-32 bg-slate-100">
              <img
                src="/pictures/chargingin_bus.jpeg"
                alt="Power Outlets"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-blue-700">
                <Zap className="w-4 h-4 flex-shrink-0" />
                <h4 className="font-semibold text-slate-900 text-sm">Power Outlets</h4>
              </div>
              <p className="text-xs text-slate-600 font-normal">Charge laptops & phones at your seat.</p>
            </div>
          </div>

          {/* Digital QR E-Ticket */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-center shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-hidden rounded-xl h-32 bg-slate-100">
              <img
                src="/pictures/eticketing.jpeg"
                alt="Digital QR E-Ticket"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-blue-700">
                <Smartphone className="w-4 h-4 flex-shrink-0" />
                <h4 className="font-semibold text-slate-900 text-sm">Digital QR E-Ticket</h4>
              </div>
              <p className="text-xs text-slate-600 font-normal">Instant ticket generation on your device.</p>
            </div>
          </div>

          {/* Verified Staff Security */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3 text-center shadow-sm overflow-hidden flex flex-col justify-between">
            <div className="overflow-hidden rounded-xl h-32 bg-slate-100">
              <img
                src="/pictures/busstaff.jpeg"
                alt="Verified Staff Security"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center gap-1.5 text-blue-700">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <h4 className="font-semibold text-slate-900 text-sm">Verified Staff Security</h4>
              </div>
              <p className="text-xs text-slate-600 font-normal">Staff QR scanner verification at departure.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
