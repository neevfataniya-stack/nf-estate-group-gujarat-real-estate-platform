import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Enquiry, SiteVisitRequest, Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { 
  User as UserIcon, 
  Mail, 
  Phone, 
  Calendar, 
  Clock, 
  Heart, 
  FileText, 
  LogOut, 
  ShieldCheck, 
  Loader2, 
  MapPin, 
  Building,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

interface CustomerDashboardProps {
  initialTab?: 'profile' | 'enquiries' | 'visits' | 'saved';
  onViewProperty: (property: Property) => void;
  onEnquireProperty: (property: Property) => void;
  onOpenEnquiryModal: () => void;
  onNavigateHome: () => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({
  initialTab = 'enquiries',
  onViewProperty,
  onEnquireProperty,
  onOpenEnquiryModal,
  onNavigateHome,
}) => {
  const { user, logout, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'enquiries' | 'visits' | 'saved'>(initialTab);

  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);
  const [savedProperties, setSavedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  const loadCustomerData = async () => {
    setLoading(true);
    try {
      const [enqRes, visitRes, savedRes] = await Promise.all([
        api.getMyEnquiries(),
        api.getMySiteVisits(),
        api.getSavedProperties(),
      ]);
      setEnquiries(enqRes.enquiries || []);
      setSiteVisits(visitRes.visits || []);
      setSavedProperties(savedRes.properties || []);
    } catch (err) {
      console.error('Failed to load customer dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadCustomerData();
    }
  }, [user]);

  const handleToggleSave = async (propertyId: string) => {
    try {
      await api.toggleSavedProperty(propertyId);
      const res = await api.getSavedProperties();
      setSavedProperties(res.properties || []);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-16 px-4 text-center">
        <h2 className="font-heading text-2xl font-bold text-[#17211D]">
          Please Log In
        </h2>
        <p className="mt-2 text-sm text-[#17211D]/70">
          Sign in to access your confidential account records, submitted enquiries, and saved properties.
        </p>
      </div>
    );
  }

  const getStatusBadge = (status: Enquiry['status']) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Contacted':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Visit Scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Closed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'Not Interested':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Top Profile Banner */}
      <div className="bg-[#17211D] text-[#F4F0E7] rounded-2xl p-6 sm:p-8 shadow-lg border border-[#23312C] mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#B87952] text-white flex items-center justify-center font-heading text-2xl font-bold uppercase shadow-inner">
              {user.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-heading text-2xl font-bold text-[#F4F0E7]">
                  {user.name}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#23312C] text-[#C8D6B0] border border-[#33463f]">
                  {user.role}
                </span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-4 text-xs text-[#F4F0E7]/75">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#C8D6B0]" />
                  {user.email}
                </span>
                <span className="flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-[#C8D6B0]" />
                  {user.phone}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenEnquiryModal}
              className="px-4 py-2 bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-semibold rounded-lg shadow-sm transition-colors whitespace-nowrap"
            >
              New Property Enquiry
            </button>
            <button
              onClick={async () => {
                await logout();
                onNavigateHome();
              }}
              className="px-3.5 py-2 border border-[#33463f] hover:bg-[#23312C] text-red-400 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 whitespace-nowrap"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#17211D]/15 mb-6 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'enquiries'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <FileText className="w-4 h-4 text-[#B87952]" />
          <span>My Enquiries ({enquiries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('visits')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'visits'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <Calendar className="w-4 h-4 text-[#B87952]" />
          <span>Site Visits ({siteVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'saved'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <Heart className="w-4 h-4 text-[#B87952]" />
          <span>Saved Properties ({savedProperties.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'profile'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <UserIcon className="w-4 h-4 text-[#B87952]" />
          <span>Profile Info</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#17211D]/60 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#B87952]" />
          <span className="text-sm">Fetching secure database records...</span>
        </div>
      ) : (
        <div>
          {/* TAB: MY ENQUIRIES */}
          {activeTab === 'enquiries' && (
            <div>
              {enquiries.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#17211D]/10">
                  <FileText className="w-12 h-12 text-[#C8D6B0] mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#17211D]">
                    No Submitted Enquiries Yet
                  </h3>
                  <p className="mt-1 text-xs text-[#17211D]/70 max-w-sm mx-auto">
                    When you submit an enquiry on any residential, commercial, or industrial property in Gujarat, it will appear here for live status tracking.
                  </p>
                  <button
                    onClick={onOpenEnquiryModal}
                    className="mt-5 px-5 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Submit an Enquiry
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {enquiries.map((enq) => (
                    <div
                      key={enq.id}
                      className="bg-white rounded-xl p-5 border border-[#17211D]/10 hover:border-[#B87952]/30 transition-all shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#B87952]">
                            {enq.id}
                          </span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border self-start sm:self-auto ${getStatusBadge(enq.status)}`}>
                          Status: {enq.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <span className="text-slate-500 block">Property / Subject:</span>
                          <span className="font-bold text-[#17211D] text-sm mt-0.5 block">
                            {enq.selectedPropertyTitle || `${enq.category} Property Consultation`}
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block">Gujarat Location:</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">
                            {enq.locality}, {enq.city}, Gujarat
                          </span>
                        </div>

                        <div>
                          <span className="text-slate-500 block">Preferred Contact:</span>
                          <span className="font-semibold text-slate-800 mt-0.5 block">
                            {enq.preferredContactMethod} ({enq.phone})
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-50 text-xs text-slate-600 bg-slate-50/60 p-3 rounded-lg">
                        <span className="font-semibold text-slate-800">Your Message: </span>
                        {enq.message}
                      </div>

                      {enq.internalNotes && (
                        <div className="mt-2 text-xs text-[#23312C] bg-[#C8D6B0]/20 p-2.5 rounded-lg border border-[#C8D6B0]/40">
                          <span className="font-semibold">Advisor Follow-Up Note: </span>
                          {enq.internalNotes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SITE VISITS */}
          {activeTab === 'visits' && (
            <div>
              {siteVisits.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#17211D]/10">
                  <Calendar className="w-12 h-12 text-[#C8D6B0] mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#17211D]">
                    No Site Visits Scheduled
                  </h3>
                  <p className="mt-1 text-xs text-[#17211D]/70 max-w-sm mx-auto">
                    You can request private escorted site tours on any property details page.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {siteVisits.map((v) => (
                    <div
                      key={v.id}
                      className="bg-white rounded-xl p-5 border border-[#17211D]/10 shadow-sm"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-[#B87952]">{v.id}</span>
                          <span className="text-slate-300">·</span>
                          <span className="text-xs text-slate-500">
                            Booked on {new Date(v.createdAt).toLocaleDateString('en-IN')}
                          </span>
                        </div>

                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#C8D6B0]/30 text-[#23312C] border border-[#C8D6B0]">
                          {v.status}
                        </span>
                      </div>

                      <div className="mt-3 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-slate-500 block">Property:</span>
                          <span className="font-bold text-[#17211D]">{v.propertyTitle}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Scheduled Date:</span>
                          <span className="font-semibold text-slate-800">
                            {new Date(v.preferredDate).toLocaleDateString('en-IN', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Time Slot:</span>
                          <span className="font-semibold text-slate-800">{v.preferredTimeSlot}</span>
                        </div>
                      </div>

                      {v.notes && (
                        <p className="mt-2 text-xs text-slate-500">
                          <strong>Note:</strong> {v.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: SAVED PROPERTIES */}
          {activeTab === 'saved' && (
            <div>
              {savedProperties.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-[#17211D]/10">
                  <Heart className="w-12 h-12 text-[#C8D6B0] mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#17211D]">
                    No Saved Properties
                  </h3>
                  <p className="mt-1 text-xs text-[#17211D]/70 max-w-sm mx-auto">
                    Click the heart icon on any property card to save listings for fast comparison.
                  </p>
                  <button
                    onClick={onNavigateHome}
                    className="mt-5 px-5 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    Browse Gujarat Inventory
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedProperties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      isSaved={true}
                      onViewDetails={onViewProperty}
                      onEnquire={onEnquireProperty}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: PROFILE */}
          {activeTab === 'profile' && (
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#17211D]/10 max-w-2xl">
              <h3 className="font-heading text-lg font-bold text-[#17211D] mb-4">
                Customer Account Information
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="text-slate-500 block mb-1">Full Legal Name</label>
                  <div className="p-3 bg-slate-50 rounded-lg font-semibold text-slate-800 border border-slate-200">
                    {user.name}
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Registered Email</label>
                  <div className="p-3 bg-slate-50 rounded-lg font-semibold text-slate-800 border border-slate-200">
                    {user.email}
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Contact Phone</label>
                  <div className="p-3 bg-slate-50 rounded-lg font-semibold text-slate-800 border border-slate-200">
                    {user.phone}
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Account Role & Privileges</label>
                  <div className="p-3 bg-slate-50 rounded-lg font-semibold text-slate-800 border border-slate-200 uppercase tracking-wider text-[11px]">
                    {user.role} {isAdmin && '— Full Administrator Access'}
                  </div>
                </div>

                <div>
                  <label className="text-slate-500 block mb-1">Member Since</label>
                  <div className="p-3 bg-slate-50 rounded-lg text-slate-600 border border-slate-200">
                    {new Date(user.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
};
