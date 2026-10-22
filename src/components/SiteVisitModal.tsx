import React, { useState } from 'react';
import { Property, SiteVisitRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  X, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Building,
  MapPin
} from 'lucide-react';

interface SiteVisitModalProps {
  property: Property | null;
  isOpen: boolean;
  onClose: () => void;
  onRequireLogin: () => void;
  onSuccess: (visit: SiteVisitRequest) => void;
}

export const SiteVisitModal: React.FC<SiteVisitModalProps> = ({
  property,
  isOpen,
  onClose,
  onRequireLogin,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Tomorrow as min date
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const minDateStr = tomorrow.toISOString().split('T')[0];

  const [preferredDate, setPreferredDate] = useState<string>(minDateStr);
  const [preferredTimeSlot, setPreferredTimeSlot] = useState<
    'Morning (10 AM - 1 PM)' | 'Afternoon (1 PM - 4 PM)' | 'Evening (4 PM - 7 PM)'
  >('Morning (10 AM - 1 PM)');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedVisit, setConfirmedVisit] = useState<SiteVisitRequest | null>(null);

  if (!isOpen || !property) return null;

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
            <Calendar className="w-6 h-6" />
          </div>

          <h3 className="font-heading text-xl font-bold text-[#17211D]">
            Sign In to Schedule Site Visit
          </h3>
          <p className="mt-2 text-sm text-[#17211D]/75">
            To coordinate security gate passes and escort arrangements at the Gujarat property site, please log in with your account.
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
    if (submitting) return;

    if (!preferredDate || !preferredTimeSlot) {
      setErrorMessage('Please select a valid date and preferred time slot.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await api.submitSiteVisit({
        propertyId: property.id,
        propertyTitle: property.title,
        preferredDate,
        preferredTimeSlot,
        notes,
      });

      setConfirmedVisit(res.visit);
      onSuccess(res.visit);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to submit site visit request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div 
        className="relative w-full max-w-lg bg-[#F4F0E7] rounded-2xl shadow-2xl border border-[#17211D]/15 overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7] border-b border-[#23312C]">
          <div>
            <h3 className="font-heading text-lg font-bold text-[#F4F0E7]">
              Request a Site Visit
            </h3>
            <p className="text-xs text-[#C8D6B0]">
              Gujarat On-Site Inspection & Tour
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#F4F0E7]/70 hover:text-white hover:bg-[#23312C] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {confirmedVisit ? (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#C8D6B0]/40 text-[#17211D] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-[#23312C]" />
              </div>

              <h4 className="font-heading text-xl font-bold text-[#17211D]">
                Site Visit Request Registered!
              </h4>

              <div className="p-4 bg-white rounded-xl border border-[#17211D]/10 text-left space-y-2 text-xs">
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Visit Request ID:</span>
                  <span className="font-mono font-bold text-[#B87952]">{confirmedVisit.id}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Property:</span>
                  <span className="font-semibold text-slate-800 line-clamp-1">{confirmedVisit.propertyTitle}</span>
                </div>
                <div className="flex justify-between pb-1 border-b border-slate-100">
                  <span className="text-slate-500">Requested Date:</span>
                  <span className="font-semibold text-slate-800">{new Date(confirmedVisit.preferredDate).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Time Window:</span>
                  <span className="font-semibold text-slate-800">{confirmedVisit.preferredTimeSlot}</span>
                </div>
              </div>

              <p className="text-xs text-[#17211D]/75">
                Our property executive in {property.city} will contact you to confirm directions and gate access permissions.
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

              {/* Property Snapshot */}
              <div className="p-3 bg-white rounded-xl border border-[#17211D]/10 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#17211D] overflow-hidden shrink-0">
                  <img src={property.imageUrl} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <h5 className="font-heading text-xs font-bold text-[#17211D] truncate">
                    {property.title}
                  </h5>
                  <p className="text-[11px] text-[#17211D]/70">
                    {property.locality}, {property.city} · {property.priceDisplay}
                  </p>
                </div>
              </div>

              {/* Customer Contact Details */}
              <div className="p-3 bg-white/70 rounded-xl border border-[#17211D]/10 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitor:</span>
                  <span className="font-semibold text-slate-800">{user.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Contact Phone:</span>
                  <span className="font-semibold text-slate-800">{user.phone}</span>
                </div>
              </div>

              {/* Date Selector */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Preferred Inspection Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    min={minDateStr}
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                  />
                </div>
              </div>

              {/* Preferred Time Slot */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1.5">
                  Preferred Time Slot *
                </label>
                <div className="space-y-2">
                  {[
                    'Morning (10 AM - 1 PM)',
                    'Afternoon (1 PM - 4 PM)',
                    'Evening (4 PM - 7 PM)',
                  ].map((slot) => (
                    <label
                      key={slot}
                      className={`flex items-center gap-2.5 p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                        preferredTimeSlot === slot
                          ? 'bg-[#C8D6B0]/20 border-[#B87952] text-[#17211D] font-semibold'
                          : 'bg-white border-[#17211D]/15 text-[#17211D]/80'
                      }`}
                    >
                      <input
                        type="radio"
                        name="preferredTimeSlot"
                        value={slot}
                        checked={preferredTimeSlot === slot}
                        onChange={() => setPreferredTimeSlot(slot as any)}
                        className="text-[#B87952] focus:ring-[#B87952]"
                      />
                      <Clock className="w-3.5 h-3.5 text-[#B87952]" />
                      <span>{slot}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Notes / Specific Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Bringing technical architect; need parking space for two vehicles..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#17211D]/20 rounded-lg text-xs text-[#17211D] focus:outline-none focus:border-[#B87952]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3 px-4 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Registering Request in Database...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Confirm Site Visit Appointment
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
