import React from 'react';
import { NFMonogram } from './NFMonogram';
import { MapPin, Phone, Mail, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GUJARAT_CITIES } from '../data/gujaratLocations';

interface FooterProps {
  onNavigate: (view: string) => void;
  onOpenLegal: (type: 'privacy' | 'terms') => void;
  onOpenSellerModal: () => void;
  onOpenEnquiryModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenLegal,
  onOpenSellerModal,
  onOpenEnquiryModal,
}) => {
  return (
    <footer className="w-full bg-[#17211D] text-[#F4F0E7] border-t border-[#23312C] pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#23312C]">
          
          {/* Col 1 & 2: Brand Lockup & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <NFMonogram size={42} inverted />
              <div>
                <span className="font-heading text-xl font-bold tracking-tight text-[#F4F0E7] block">
                  NF ESTATE GROUP
                </span>
                <span className="text-xs text-[#C8D6B0] font-medium tracking-wider uppercase">
                  Gujarat Real Estate
                </span>
              </div>
            </div>

            <p className="font-heading text-lg font-semibold text-[#DE9F7B] italic">
              “Your Future. Our Foundation.”
            </p>

            <p className="text-xs text-[#F4F0E7]/70 leading-relaxed max-w-sm">
              Gujarat’s premier real estate advisory group specializing in verified high-value residential developments, Grade-A commercial towers, and industrial manufacturing corridors across 20 Gujarat cities.
            </p>

            <div className="flex items-center gap-2 text-xs text-[#C8D6B0]">
              <MapPin className="w-4 h-4 text-[#B87952] shrink-0" />
              <span>Gujarat State Headquarters · Ahmedabad & Surat</span>
            </div>
          </div>

          {/* Col 3: Categories */}
          <div>
            <h4 className="font-heading text-sm font-bold text-[#F4F0E7] uppercase tracking-wider mb-4">
              Real Estate Segments
            </h4>
            <ul className="space-y-2 text-xs text-[#F4F0E7]/75">
              <li>
                <button
                  onClick={() => onNavigate('residential')}
                  className="hover:text-[#C8D6B0] transition-colors"
                >
                  Residential Real Estate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('commercial')}
                  className="hover:text-[#C8D6B0] transition-colors"
                >
                  Commercial Real Estate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('industrial')}
                  className="hover:text-[#C8D6B0] transition-colors"
                >
                  Industrial Real Estate
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('properties')}
                  className="hover:text-[#C8D6B0] transition-colors"
                >
                  All Verified Gujarat Properties
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSellerModal}
                  className="hover:text-[#C8D6B0] transition-colors flex items-center gap-1"
                >
                  <span>List Your Property</span>
                  <ArrowUpRight className="w-3 h-3 text-[#B87952]" />
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Top Gujarat Cities */}
          <div>
            <h4 className="font-heading text-sm font-bold text-[#F4F0E7] uppercase tracking-wider mb-4">
              Key Gujarat Hubs
            </h4>
            <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5 text-xs text-[#F4F0E7]/75">
              {GUJARAT_CITIES.slice(0, 10).map((city) => (
                <li key={city.name} className="truncate">
                  <span className="text-[#C8D6B0] mr-1">·</span>
                  {city.name}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] text-[#C8D6B0]/70 italic">
              + 10 more municipal regions across Gujarat
            </p>
          </div>

          {/* Col 5: Client Advisory */}
          <div>
            <h4 className="font-heading text-sm font-bold text-[#F4F0E7] uppercase tracking-wider mb-4">
              Direct Advisory
            </h4>
            <p className="text-xs text-[#F4F0E7]/70 leading-relaxed mb-3">
              Need assistance evaluating property titles, zoning permissions, or Gujarat RERA registrations?
            </p>
            <button
              onClick={onOpenEnquiryModal}
              className="w-full py-2.5 px-3 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-sm text-center"
            >
              Consult an Advisor
            </button>
            <div className="mt-3 text-[11px] text-[#C8D6B0] flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#B87952]" />
              <span>Gujarat Exclusive Portfolio</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar: Copyright & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#F4F0E7]/60">
          <p>
            © 2026 NF ESTATE GROUP. All rights reserved. Gujarat, India.
          </p>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenLegal('privacy')}
              className="hover:text-[#C8D6B0] transition-colors"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegal('terms')}
              className="hover:text-[#C8D6B0] transition-colors"
            >
              Terms of Service
            </button>
            <button
              onClick={() => onNavigate('admin')}
              className="hover:text-[#DE9F7B] transition-colors font-medium"
            >
              Owner Portal
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
