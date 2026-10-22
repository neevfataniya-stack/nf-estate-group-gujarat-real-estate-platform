import React, { useState } from 'react';
import { Property } from '../types';
import { Building, MapPin, Maximize2, Heart, ArrowRight, ShieldCheck } from 'lucide-react';

interface PropertyCardProps {
  property: Property;
  isSaved?: boolean;
  onViewDetails: (property: Property) => void;
  onEnquire: (property: Property) => void;
  onToggleSave?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  isSaved = false,
  onViewDetails,
  onEnquire,
  onToggleSave,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <article className="group bg-white rounded-xl overflow-hidden border border-[#17211D]/10 hover:border-[#B87952]/40 transition-all duration-200 hover:shadow-xl flex flex-col h-full">
      
      {/* Property Visual Carrier with Fallback */}
      <div className="relative aspect-[16/10] bg-[#17211D] overflow-hidden">
        {!imageError ? (
          <img
            src={property.imageUrl}
            alt={`${property.title} in ${property.locality}, ${property.city}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : null}

        {/* Resilient Fallback Container */}
        {(!imageLoaded || imageError) && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#17211D] via-[#23312C] to-[#17211D] flex flex-col items-center justify-center p-6 text-center text-[#F4F0E7]">
            <Building className="w-10 h-10 text-[#C8D6B0] mb-2 stroke-[1.5]" />
            <span className="font-heading text-sm font-semibold text-[#F4F0E7] line-clamp-1">
              {property.title}
            </span>
            <span className="text-xs text-[#C8D6B0] mt-1">
              {property.locality}, {property.city}
            </span>
          </div>
        )}

        {/* Transaction Type Tag (quiet architectural overlay) */}
        <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-[#17211D]/85 backdrop-blur-sm text-xs text-[#F4F0E7] px-2.5 py-1 rounded">
          <span className="font-medium">For {property.transactionType}</span>
          <span className="text-[#C8D6B0]">·</span>
          <span className="text-[#C8D6B0] font-medium">{property.category}</span>
        </div>

        {/* Wishlist Button */}
        {onToggleSave && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-sm transition-colors ${
              isSaved
                ? 'bg-[#B87952] text-white shadow-md'
                : 'bg-[#17211D]/60 hover:bg-[#17211D] text-white'
            }`}
            aria-label={isSaved ? 'Remove from saved' : 'Save property'}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Unboxed Metadata (Zero-Pill Discipline) */}
        <div className="flex items-center gap-1.5 text-xs text-[#17211D]/70 font-medium">
          <span>{property.locality}</span>
          <span aria-hidden="true">·</span>
          <span className="font-semibold text-[#17211D]">{property.city}, Gujarat</span>
          <span aria-hidden="true">·</span>
          <span>{property.propertyType}</span>
        </div>

        {/* Primary Title */}
        <h3 className="mt-2 font-heading text-base font-bold text-[#17211D] line-clamp-2 leading-snug group-hover:text-[#B87952] transition-colors">
          {property.title}
        </h3>

        {/* Key Spatial Specs */}
        <div className="mt-3 flex items-center gap-3 text-xs text-[#17211D]/80 pb-4 border-b border-[#17211D]/10">
          <div className="flex items-center gap-1">
            <Maximize2 className="w-3.5 h-3.5 text-[#B87952]" />
            <span className="font-semibold tabular-nums">{property.sizeSqFt.toLocaleString('en-IN')}</span> sq.ft
          </div>

          {property.bedrooms && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-medium">{property.bedrooms} BHK</span>
            </>
          )}

          {property.bathrooms && (
            <>
              <span className="text-slate-300">|</span>
              <span className="font-medium">{property.bathrooms} Baths</span>
            </>
          )}

          <div className="ml-auto flex items-center gap-1 text-[11px] text-[#A3B584]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-3 mb-4">
          <span className="text-xs text-[#17211D]/60 block font-medium">Price</span>
          <span className="font-heading text-lg font-bold text-[#17211D] tabular-nums tracking-tight">
            {property.priceDisplay}
          </span>
        </div>

        {/* Mandatory Action CTAs */}
        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-2">
          {/* Secondary CTA: View Details (Forest Green) */}
          <button
            onClick={() => onViewDetails(property)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg border border-[#17211D] text-[#17211D] bg-transparent hover:bg-[#17211D] hover:text-[#F4F0E7] transition-colors whitespace-nowrap text-center focus:outline-none"
          >
            View Details
          </button>

          {/* Primary CTA: Enquire Now (Copper) */}
          <button
            onClick={() => onEnquire(property)}
            className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white shadow-sm transition-colors whitespace-nowrap text-center focus:outline-none focus:ring-2 focus:ring-[#B87952] focus:ring-offset-1"
          >
            Enquire Now
          </button>
        </div>

      </div>

    </article>
  );
};
