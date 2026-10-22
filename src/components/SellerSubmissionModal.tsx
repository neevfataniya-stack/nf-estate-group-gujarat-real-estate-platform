import React, { useState } from 'react';
import { SellerSubmission } from '../types';
import { api } from '../api/client';
import { GUJARAT_CITIES, getLocalitiesForCity } from '../data/gujaratLocations';
import { 
  X, 
  Building, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ShieldCheck,
  Send
} from 'lucide-react';

interface SellerSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (submission: SellerSubmission) => void;
}

export const SellerSubmissionModal: React.FC<SellerSubmissionModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [locality, setLocality] = useState('Bodakdev');
  const [category, setCategory] = useState<'Residential' | 'Commercial' | 'Industrial'>('Residential');
  const [propertyType, setPropertyType] = useState('Apartment / Flat');
  const [transactionType, setTransactionType] = useState<'Buy' | 'Rent'>('Buy');
  const [expectedPrice, setExpectedPrice] = useState('');
  const [areaSqFt, setAreaSqFt] = useState('');
  const [propertyAddress, setPropertyAddress] = useState('');
  const [description, setDescription] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedData, setSubmittedData] = useState<SellerSubmission | null>(null);

  if (!isOpen) return null;

  const localities = getLocalitiesForCity(city);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    if (!ownerName || !email || !phone || !city || !category || !expectedPrice) {
      setErrorMessage('Please complete all required fields (*).');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitSellerListing({
        ownerName,
        email,
        phone,
        state: 'Gujarat',
        city,
        locality,
        category,
        propertyType,
        transactionType,
        expectedPrice,
        areaSqFt,
        propertyAddress,
        description,
      });

      setSubmittedData(res.submission);
      if (onSuccess) onSuccess(res.submission);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit property details. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-2xl bg-[#F4F0E7] rounded-2xl shadow-2xl border border-[#17211D]/15 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7] border-b border-[#23312C]">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#F4F0E7]">
              Have a Property to List in Gujarat?
            </h3>
            <p className="text-xs text-[#C8D6B0]">
              Direct Owner Submission · Confidential Title Review
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F4F0E7]/70 hover:text-white hover:bg-[#23312C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {submittedData ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C8D6B0]/40 text-[#17211D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#23312C]" />
              </div>

              <h4 className="font-heading text-xl font-bold text-[#17211D]">
                Property Details Submitted for Review!
              </h4>

              <div className="p-4 bg-white rounded-xl border border-[#17211D]/10 text-left space-y-2 text-xs max-w-md mx-auto">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Submission ID:</span>
                  <span className="font-mono font-bold text-[#B87952]">{submittedData.id}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Owner Name:</span>
                  <span className="font-semibold text-slate-800">{submittedData.ownerName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Location:</span>
                  <span className="font-semibold text-slate-800">{submittedData.locality}, {submittedData.city}, Gujarat</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Review Status:</span>
                  <span className="font-bold text-[#DE9F7B] bg-[#B87952]/10 px-2 py-0.5 rounded">
                    Under Review (Pending Verification)
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#17211D]/75 max-w-sm mx-auto">
                Thank you! Our Gujarat acquisitions desk will review your property documentation and get in touch within 24 business hours. Unverified properties are never published publicly.
              </p>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#17211D] text-[#F4F0E7] text-xs font-semibold hover:bg-[#23312C]"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Owner Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Owner Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 XXXXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              {/* Gujarat Location */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">State</label>
                  <input
                    type="text"
                    value="Gujarat (Only)"
                    disabled
                    className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs font-bold text-[#17211D] cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">City *</label>
                  <select
                    value={city}
                    onChange={(e) => {
                      setCity(e.target.value);
                      const locs = getLocalitiesForCity(e.target.value);
                      setLocality(locs[0] || 'General Locality');
                    }}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    {GUJARAT_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Locality / Area *</label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    {localities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category, Type, Transaction */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    <option value="Residential">Residential Real Estate</option>
                    <option value="Commercial">Commercial Real Estate</option>
                    <option value="Industrial">Industrial Real Estate</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Property Type</label>
                  <input
                    type="text"
                    placeholder="e.g. 4 BHK Villa, Industrial Shed..."
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Intent</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    <option value="Buy">Sell (Outright Sale)</option>
                    <option value="Rent">Lease / Rent Out</option>
                  </select>
                </div>
              </div>

              {/* Price & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Expected Price (INR) *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ₹2.50 Cr or ₹1.20 Lakh/month"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Plot / Carpet Area</label>
                  <input
                    type="text"
                    placeholder="e.g. 3,500 sq.ft."
                    value={areaSqFt}
                    onChange={(e) => setAreaSqFt(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">Full Property Address</label>
                <input
                  type="text"
                  placeholder="Plot/Survey No., Street, Landmark..."
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">Property Features & Details</label>
                <textarea
                  rows={3}
                  placeholder="Key features, current occupancy status, road width, power capacity..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                />
              </div>

              {/* Verification Notice */}
              <div className="flex items-center gap-2 p-3 rounded-lg bg-[#C8D6B0]/30 border border-[#C8D6B0] text-xs text-[#17211D]">
                <ShieldCheck className="w-4 h-4 text-[#23312C] shrink-0" />
                <span>
                  NF ESTATE GROUP verifies all titles prior to publishing. Your submission will be stored in our private owner repository for administrative review.
                </span>
              </div>

              {/* CTA Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Submitting Property Details...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Property Details
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
