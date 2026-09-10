import React from 'react';
import { Bus, MapPin, Phone, Mail, ShieldCheck, Globe, Wifi, Zap, Smartphone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer id="help" className="bg-white border-t-2 border-slate-200 text-[#242424] text-sm mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand & Mission */}
        <div className="space-y-4 text-left">
          <div className="flex items-center gap-2.5 text-[#242424] font-extrabold text-xl font-mono">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] flex items-center justify-center">
              <Bus className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            UG<span className="text-[#1E3A8A]"> Express</span>
          </div>
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            Convenient, sustainable, and affordable long-distance bus travel across Uganda.
          </p>
          <div className="flex items-center gap-2 text-xs text-[#242424] font-bold">
            <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
            Official Express Passenger Booking Platform
          </div>
        </div>

        {/* Bus Routes Column */}
        <div className="space-y-3 text-left">
          <h4 className="text-[#242424] font-black text-xs uppercase tracking-wider font-mono">Popular Bus Connections</h4>
          <ul className="space-y-2 text-xs font-semibold text-[#242424]">
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Bus Kampala ↔ Mbarara</a></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Bus Kampala ↔ Kabale</a></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Bus Kampala ↔ Fort Portal</a></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Bus Kampala ↔ Gulu</a></li>
            <li><a href="#" className="hover:text-[#1E3A8A] transition-colors">Bus Kampala ↔ Jinja</a></li>
          </ul>
        </div>

        {/* Services On Board */}
        <div className="space-y-3 text-left">
          <h4 className="text-[#242424] font-black text-xs uppercase tracking-wider font-mono">Services On Board</h4>
          <ul className="space-y-2.5 text-xs font-semibold text-[#242424]">
            <li className="flex items-center gap-2"><Wifi className="w-4 h-4 text-[#1E3A8A]" /> High-Speed Wi-Fi</li>
            <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#1E3A8A]" /> Power Outlets & USB Charging</li>
            <li className="flex items-center gap-2"><Smartphone className="w-4 h-4 text-[#1E3A8A]" /> Digital Ticket & QR Boarding</li>
            <li className="flex items-center gap-2"><Bus className="w-4 h-4 text-[#1E3A8A]" /> Extra Legroom & Reclining Seats</li>
          </ul>
        </div>

        {/* Contact & Terminal Info */}
        <div className="space-y-3 text-left">
          <h4 className="text-[#242424] font-black text-xs uppercase tracking-wider font-mono">Central Terminal Contact</h4>
          <div className="flex items-start gap-2 text-xs font-medium text-[#242424]">
            <MapPin className="w-4 h-4 text-[#1E3A8A] flex-shrink-0 mt-0.5" />
            <span>Central Express Bus Station, Kampala, Uganda</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#242424]">
            <Phone className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
            <span>+256 771 234567 / +256 414 123456</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-[#242424]">
            <Mail className="w-4 h-4 text-[#1E3A8A] flex-shrink-0" />
            <span>support@travel.ug</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 font-bold font-mono">
            <Globe className="w-4 h-4 text-[#1E3A8A]" />
            <span>Ugandan Shilling (UGX)</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 py-4 text-center text-xs text-slate-500 font-medium">
        © 2026 UG Express Bus Network Uganda. All rights reserved. Built with React & Express.
      </div>
    </footer>
  );
};
