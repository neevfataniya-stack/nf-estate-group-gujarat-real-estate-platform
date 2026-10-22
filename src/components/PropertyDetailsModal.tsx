import React, { useState } from 'react';
import { Property } from '../types';
import { 
  X, 
  MapPin, 
  Maximize2, 
  CheckCircle2, 
  ShieldCheck, 
  Calendar, 
  MessageSquare, 
  PhoneCall, 
  Building,
  Heart,
  Share2
} from 'lucide-react';

interface PropertyDetailsModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onEnquire: (property: Property) => void;
  onRequestSiteVisit: (property: Property) => void;
  onContactTeam: (property: Property) => void;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
}

export const PropertyDetailsModal: React.FC<PropertyDetailsModalProps> = ({
  property,
  isOpen,
  onClose,
  onEnquire,
  onRequestSiteVisit,
  onContactTeam,
  isSaved = false,
  onToggleSave,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !property) return null;

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-4xl bg-[#F4F0E7] rounded-2xl shadow-2xl border border-[#17211D]/15 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7] border-b border-[#23312C]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#C8D6B0]">
              Gujarat Real Estate Listing
            </span>
            <span className="text-xs text-[#F4F0E7]/60">·</span>
            <span className="text-xs font-mono text-[#DE9F7B]">{property.id}</span>
          </div>

          <div className="flex items-center gap-2">
            {onToggleSave && (
              <button
                onClick={() => onToggleSave(property.id)}
                className={`p-1.5 rounded-lg border transition-colors ${
                  isSaved
                    ? 'bg-[#B87952] border-[#B87952] text-white'
                    : 'border-[#33463f] text-[#F4F0E7] hover:bg-[#23312C]'
                }`}
                title="Save Property"
              >
                <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
              </button>
            )}

            <button
              onClick={handleShare}
              className="p-1.5 rounded-lg border border-[#33463f] text-[#F4F0E7] hover:bg-[#23312C] transition-colors"
              title="Copy Link"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#F4F0E7]/70 hover:text-white hover:bg-[#23312C] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-6">
          
          {/* Main Visual */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-[#17211D]">
            <img
              src={property.imageUrl}
              alt={property.title}
              referrerPolicy="no-referrer"
              onLoad={() => setImageLoaded(true)}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4 bg-[#17211D]/90 backdrop-blur-sm text-xs font-medium text-[#F4F0E7] px-3 py-1.5 rounded-md flex items-center gap-2">
              <span>{property.category}</span>
              <span className="text-[#C8D6B0]">·</span>
              <span>{property.transactionType}</span>
            </div>
            {copied && (
              <div className="absolute bottom-4 right-4 bg-[#17211D] text-[#C8D6B0] text-xs font-semibold px-3 py-1.5 rounded shadow">
                Link copied to clipboard!
              </div>
            )}
          </div>

          {/* Title & Price Header */}
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pb-5 border-b border-[#17211D]/15">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold text-[#B87952] mb-1">
                <MapPin className="w-3.5 h-3.5" />
                <span>{property.locality}, {property.city}, Gujarat</span>
              </div>
              <h2 className="font-heading text-2xl font-bold text-[#17211D]">
                {property.title}
              </h2>
              <p className="mt-1 text-sm text-[#17211D]/70">
                {property.address}
              </p>
            </div>

            <div className="md:text-right shrink-0">
              <span className="text-xs text-[#17211D]/60 block font-medium">Price / Outlay</span>
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-[#17211D] tabular-nums">
                {property.priceDisplay}
              </span>
              <span className="text-xs text-[#17211D]/60 block mt-0.5">
                (Inclusive of verified Gujarat property documentation)
              </span>
            </div>
          </div>

          {/* Key Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-white border border-[#17211D]/10">
              <span className="text-xs text-[#17211D]/60 block font-medium">Built-Up Area</span>
              <span className="font-heading text-base font-bold text-[#17211D] tabular-nums">
                {property.sizeSqFt.toLocaleString('en-IN')} sq.ft
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#17211D]/10">
              <span className="text-xs text-[#17211D]/60 block font-medium">Property Type</span>
              <span className="font-heading text-base font-bold text-[#17211D] truncate block">
                {property.propertyType}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#17211D]/10">
              <span className="text-xs text-[#17211D]/60 block font-medium">Bedrooms / Units</span>
              <span className="font-heading text-base font-bold text-[#17211D]">
                {property.bedrooms ? `${property.bedrooms} BHK` : 'N/A'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-white border border-[#17211D]/10">
              <span className="text-xs text-[#17211D]/60 block font-medium">Verification Status</span>
              <div className="flex items-center gap-1 text-[#23312C] font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-[#A3B584]" />
                <span>Title Verified</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="font-heading text-base font-bold text-[#17211D] mb-2">
              Property Description & Architecture
            </h3>
            <p className="text-sm text-[#17211D]/80 leading-relaxed whitespace-pre-line">
              {property.description}
            </p>
          </div>

          {/* Amenities & Infrastructure */}
          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h3 className="font-heading text-base font-bold text-[#17211D] mb-3">
                Key Amenities & Specifications
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {property.amenities.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs font-medium text-[#17211D]/85">
                    <CheckCircle2 className="w-4 h-4 text-[#B87952] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Location Verification Notice */}
          <div className="p-4 rounded-xl bg-[#C8D6B0]/25 border border-[#C8D6B0] text-xs text-[#17211D]">
            <span className="font-bold">Gujarat Regulatory Compliance:</span> This property is verified under the Gujarat Real Estate Regulation standards. All title documents, town planning approvals, and municipal permissions have been verified by NF ESTATE GROUP legal advisors.
          </div>

        </div>

        {/* Footer CTAs (Three Mandatory CTAs from Requirement 5) */}
        <div className="p-4 sm:p-5 bg-white border-t border-[#17211D]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
          
          <button
            onClick={() => onContactTeam(property)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-[#17211D] text-[#17211D] text-xs font-semibold hover:bg-[#17211D] hover:text-[#F4F0E7] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <PhoneCall className="w-4 h-4 text-[#B87952]" />
            Contact Our Team
          </button>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <button
              onClick={() => onRequestSiteVisit(property)}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg border border-[#B87952] text-[#B87952] hover:bg-[#B87952]/10 text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <Calendar className="w-4 h-4" />
              Request a Site Visit
            </button>

            <button
              onClick={() => onEnquire(property)}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <MessageSquare className="w-4 h-4" />
              Enquire About This Property
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
