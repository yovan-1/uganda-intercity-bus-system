import React from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, UserCheck, Wrench } from 'lucide-react';
import { Role } from '../types';

export const DemoRoleSwitcher: React.FC = () => {
  const { user, demoLogin, logout } = useAuth();

  const handleSwitch = async (role: Role) => {
    await demoLogin(role);
  };

  return (
    <div className="bg-white text-[#242424] border-b border-slate-200 px-4 py-2 text-xs sticky top-0 z-50 shadow-sm font-mono">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[#242424] font-bold">
          <span>Interactive Demo Bar:</span>
          <span className="text-slate-500 font-normal hidden md:inline">Quick Switch Persona</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap font-sans">
          <button
            onClick={() => handleSwitch('CUSTOMER')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold transition-all ${
              user?.role === 'CUSTOMER'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-black'
                : 'bg-slate-100 text-[#242424] hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            Passenger / Customer
          </button>

          <button
            onClick={() => handleSwitch('STAFF')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold transition-all ${
              user?.role === 'STAFF'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-black'
                : 'bg-slate-100 text-[#242424] hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Bus Staff
          </button>

          <button
            onClick={() => handleSwitch('ADMIN')}
            className={`px-3 py-1 rounded-full flex items-center gap-1.5 font-bold transition-all ${
              user?.role === 'ADMIN'
                ? 'bg-[#1E3A8A] text-white shadow-sm font-black'
                : 'bg-slate-100 text-[#242424] hover:bg-slate-200 border border-slate-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            System Admin
          </button>

          {user && (
            <button
              onClick={logout}
              className="px-2.5 py-1 text-slate-500 hover:text-red-500 transition-colors ml-2 underline underline-offset-2"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
