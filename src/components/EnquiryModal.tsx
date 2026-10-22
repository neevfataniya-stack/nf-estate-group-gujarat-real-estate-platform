import React, { useState, useEffect } from 'react';
import { Property, Enquiry } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { GUJARAT_CITIES, getLocalitiesForCity } from '../data/gujaratLocations';
import { 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building, 
  MapPin, 
  ShieldCheck,
  Send
} from 'lucide-react';

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedProperty?: Property | null;
  onRequireLogin: () => void;
  onSuccess: (enquiry: Enquiry) => void;
}

export const EnquiryModal: React.FC<EnquiryModalProps> = ({
  isOpen,
  onClose,
  selectedProperty,
  onRequireLogin,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [city, setCity] = useState<string>('Ahmedabad');
  const [locality, setLocality] = useState<string>('Bodakdev');
  const [category, setCategory] = useState<'Residential' | 'Commercial' | 'Industrial'>('Residential');
  const [propertyType, setPropertyType] = useState<string>('Apartment / Flat');
  const [transactionType, setTransactionType] = useState<'Buy' | 'Rent'>('Buy');
  const [minBudget, setMinBudget] = useState<string>('25000000');
  const [maxBudget, setMaxBudget] = useState<string>('50000000');
  const [message, setMessage] = useState<string>('I am interested in exploring verified properties in Gujarat and would like a consultation.');
  const [preferredContactMethod, setPreferredContactMethod] = useState<'Phone Call' | 'WhatsApp' | 'Email'>('Phone Call');
  const [consentGiven, setConsentGiven] = useState<boolean>(true);

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedEnquiry, setSubmittedEnquiry] = useState<Enquiry | null>(null);

  // Sync with selected property when opened
  useEffect(() => {
    if (selectedProperty) {
      setCity(selectedProperty.city);
      setLocality(selectedProperty.locality);
      setCategory(selectedProperty.category);
      setPropertyType(selectedProperty.propertyType);
      setTransactionType(selectedProperty.transactionType);
      setMinBudget(String(Math.floor(selectedProperty.price * 0.9)));
      setMaxBudget(String(Math.ceil(selectedProperty.price * 1.1)));
      setMessage(`I am interested in "${selectedProperty.title}" (ID: ${selectedProperty.id}) located in ${selectedProperty.locality}, ${selectedProperty.city}. Please share complete documentation and pricing breakdown.`);
    } else {
      setCity('Ahmedabad');
      setLocality('Bodakdev');
      setCategory('Residential');
      setPropertyType('Apartment / Flat');
      setTransactionType('Buy');
      setMinBudget('25000000');
      setMaxBudget('50000000');
      setMessage('I am looking for property options across Gujarat and would like to arrange a consultation with NF Estate Group.');
    }
    setSubmittedEnquiry(null);
    setErrorMessage(null);
  }, [selectedProperty, isOpen]);

  // Dependent localities
  const availableLocalities = getLocalitiesForCity(city);

  if (!isOpen) return null;

  // Prompt login if user is unauthenticated
  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="relative w-full max-w-md bg-[#F4F0E7] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#17211D]/15 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-[#17211D]/60 hover:text-[#17211D]"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-full bg-[#17211D] text-[#C8D6B0] flex items-center justify-center mx-auto mb-4">
            <Building className="w-6 h-6" />
          </div>

          <h3 className="font-heading text-xl font-bold text-[#17211D]">
            Customer Login Required
          </h3>
          <p className="mt-2 text-sm text-[#17211D]/75">
            To ensure complete enquiry security and enable tracking in your account, please log in or create an account before submitting your enquiry.
          </p>

          <div className="mt-6 flex flex-col gap-2.5">
            <button
              onClick={() => {
                onClose();
                onRequireLogin();
              }}
              className="w-full py-2.5 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-semibold transition-colors shadow-sm"
            >
              Login to Your Account
            </button>
            <button
              onClick={onClose}
              className="w-full py-2 px-4 rounded-lg border border-[#17211D]/20 text-[#17211D] text-xs font-medium hover:bg-black/5"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return; // Prevent duplicate clicks

    if (!city || !category || !transactionType) {
      setErrorMessage('Please fill in all required location and category fields.');
      return;
    }

    if (!consentGiven) {
      setErrorMessage('Please give your consent to be contacted regarding this enquiry.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await api.submitEnquiry({
        city,
        locality,
        category,
        propertyType,
        transactionType,
        minBudget: Number(minBudget) || 0,
        maxBudget: Number(maxBudget) || 0,
        selectedPropertyId: selectedProperty?.id,
        selectedPropertyTitle: selectedProperty?.title,
        message,
        preferredContactMethod,
        consentGiven: true,
      });

      setSubmittedEnquiry(response.enquiry);
      onSuccess(response.enquiry);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to save enquiry to the database. Please try again.');
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
              {selectedProperty ? 'Property Enquiry' : 'Submit Property Requirements'}
            </h3>
            <p className="text-xs text-[#C8D6B0]">
              State: Gujarat Only · Direct Database Persistence
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F4F0E7]/70 hover:text-white hover:bg-[#23312C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          
          {submittedEnquiry ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C8D6B0]/40 text-[#17211D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#23312C]" />
              </div>

              <h4 className="font-heading text-xl font-bold text-[#17211D]">
                Enquiry Successfully Saved!
              </h4>

              <div className="p-4 bg-white rounded-xl border border-[#17211D]/10 text-left max-w-md mx-auto space-y-2 text-xs">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Enquiry ID:</span>
                  <span className="font-mono font-bold text-[#B87952]">{submittedEnquiry.id}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Customer:</span>
                  <span className="font-semibold text-slate-800">{submittedEnquiry.customerName}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Gujarat Location:</span>
                  <span className="font-semibold text-slate-800">{submittedEnquiry.locality}, {submittedEnquiry.city}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Category & Type:</span>
                  <span className="font-semibold text-slate-800">{submittedEnquiry.category} · {submittedEnquiry.propertyType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Status:</span>
                  <span className="font-bold text-[#23312C] bg-[#C8D6B0]/50 px-2 py-0.5 rounded text-[11px]">
                    {submittedEnquiry.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#17211D]/70 max-w-sm mx-auto">
                Your enquiry has been recorded in the central database. You can track this and all your enquiries anytime under <strong>My Account</strong>.
              </p>

              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-lg bg-[#17211D] text-[#F4F0E7] text-xs font-semibold hover:bg-[#23312C] transition-colors"
              >
                Close Window
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

              {/* Selected Property preview if any */}
              {selectedProperty && (
                <div className="p-3 bg-white rounded-xl border border-[#17211D]/10 flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#17211D] overflow-hidden shrink-0">
                    <img 
                      src={selectedProperty.imageUrl} 
                      alt="" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] uppercase font-bold text-[#B87952]">Selected Property</span>
                    <h5 className="font-heading text-xs font-bold text-[#17211D] truncate">
                      {selectedProperty.title}
                    </h5>
                    <p className="text-[11px] text-[#17211D]/70">
                      {selectedProperty.locality}, {selectedProperty.city} · {selectedProperty.priceDisplay}
                    </p>
                  </div>
                </div>
              )}

              {/* Customer Info (Auto-filled from user account) */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 bg-white/70 rounded-xl border border-[#17211D]/10 text-xs">
                <div>
                  <span className="text-[#17211D]/60 block font-medium">Customer Name</span>
                  <span className="font-semibold text-[#17211D]">{user.name}</span>
                </div>
                <div>
                  <span className="text-[#17211D]/60 block font-medium">Email Address</span>
                  <span className="font-semibold text-[#17211D] truncate block">{user.email}</span>
                </div>
                <div>
                  <span className="text-[#17211D]/60 block font-medium">Phone Number</span>
                  <span className="font-semibold text-[#17211D]">{user.phone}</span>
                </div>
              </div>

              {/* Location Controls (State: Gujarat, City, Locality) */}
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
                      setLocality(locs[0] || 'All Areas');
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
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Locality / Area</label>
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    <option value="All Areas">All Areas</option>
                    {availableLocalities.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Transaction */}
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
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    placeholder="e.g. Villa, 4 BHK, Office..."
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Transaction</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  >
                    <option value="Buy">Buy (Outright)</option>
                    <option value="Rent">Rent (Lease)</option>
                  </select>
                </div>
              </div>

              {/* Budget Range */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Min Budget (₹)</label>
                  <input
                    type="number"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#17211D] mb-1">Max Budget (₹)</label>
                  <input
                    type="number"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              {/* Preferred Contact Method */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                  Preferred Contact Method
                </label>
                <div className="flex items-center gap-4 text-xs">
                  {(['Phone Call', 'WhatsApp', 'Email'] as const).map((method) => (
                    <label key={method} className="flex items-center gap-1.5 cursor-pointer">
                      <input
                        type="radio"
                        name="preferredContactMethod"
                        value={method}
                        checked={preferredContactMethod === method}
                        onChange={() => setPreferredContactMethod(method)}
                        className="text-[#B87952] focus:ring-[#B87952]"
                      />
                      <span>{method}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Enquiry Message & Specific Requirements
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                />
              </div>

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2 text-xs text-[#17211D]/80 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-0.5 rounded text-[#B87952] focus:ring-[#B87952]"
                />
                <span>
                  I consent to NF ESTATE GROUP contacting me regarding this property enquiry via phone, WhatsApp, or email.
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-3">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving Enquiry to Database...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Verified Enquiry
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
