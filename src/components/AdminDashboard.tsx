import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { 
  Enquiry, 
  Property, 
  SiteVisitRequest, 
  SellerSubmission, 
  AdminStats 
} from '../types';
import { GUJARAT_CITIES, getLocalitiesForCity, formatINR } from '../data/gujaratLocations';
import { 
  ShieldCheck, 
  FileText, 
  Users, 
  Building, 
  Calendar, 
  Download, 
  Search, 
  Filter, 
  Eye, 
  Edit3, 
  Plus, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  ChevronRight,
  TrendingUp,
  Inbox,
  Clock
} from 'lucide-react';

interface AdminDashboardProps {
  onNavigateHome: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateHome }) => {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'enquiries' | 'visits' | 'sellers' | 'inventory'>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [siteVisits, setSiteVisits] = useState<SiteVisitRequest[]>([]);
  const [sellerSubmissions, setSellerSubmissions] = useState<SellerSubmission[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Filters for enquiries
  const [enquirySearch, setEnquirySearch] = useState<string>('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState<string>('All');
  const [enquiryCityFilter, setEnquiryCityFilter] = useState<string>('All');
  const [enquiryCategoryFilter, setEnquiryCategoryFilter] = useState<string>('All');

  // Selected enquiry for detail modal
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [statusUpdateVal, setStatusUpdateVal] = useState<Enquiry['status']>('New');
  const [notesUpdateVal, setNotesUpdateVal] = useState<string>('');
  const [isUpdatingEnquiry, setIsUpdatingEnquiry] = useState<boolean>(false);

  // Property modal state
  const [showAddPropertyModal, setShowAddPropertyModal] = useState<boolean>(false);
  const [newPropTitle, setNewPropTitle] = useState('');
  const [newPropCategory, setNewPropCategory] = useState<'Residential' | 'Commercial' | 'Industrial'>('Residential');
  const [newPropType, setNewPropType] = useState('Apartment / Flat');
  const [newPropTx, setNewPropTx] = useState<'Buy' | 'Rent'>('Buy');
  const [newPropPrice, setNewPropPrice] = useState('25000000');
  const [newPropPriceDisplay, setNewPropPriceDisplay] = useState('₹2.50 Cr');
  const [newPropCity, setNewPropCity] = useState('Ahmedabad');
  const [newPropLocality, setNewPropLocality] = useState('Bodakdev');
  const [newPropAddress, setNewPropAddress] = useState('');
  const [newPropSize, setNewPropSize] = useState('2400');
  const [newPropBedrooms, setNewPropBedrooms] = useState('3');
  const [newPropBathrooms, setNewPropBathrooms] = useState('3');
  const [newPropDesc, setNewPropDesc] = useState('');
  const [newPropAmenities, setNewPropAmenities] = useState('24/7 Security, Reserved Parking, Lift, Power Backup');
  const [newPropImage, setNewPropImage] = useState('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80');

  const loadAllAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, enqRes, visitRes, sellRes, propRes] = await Promise.all([
        api.getAdminStats(),
        api.getAdminEnquiries({
          status: enquiryStatusFilter !== 'All' ? enquiryStatusFilter : undefined,
          city: enquiryCityFilter !== 'All' ? enquiryCityFilter : undefined,
          category: enquiryCategoryFilter !== 'All' ? enquiryCategoryFilter : undefined,
          search: enquirySearch.trim() || undefined,
        }),
        api.getAdminSiteVisits(),
        api.getAdminSellerSubmissions(),
        api.request<{ properties: Property[] }>('/api/admin/properties'),
      ]);

      setStats(statsRes.stats);
      setEnquiries(enqRes.enquiries || []);
      setSiteVisits(visitRes.visits || []);
      setSellerSubmissions(sellRes.submissions || []);
      setProperties(propRes.properties || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadAllAdminData();
    }
  }, [isAdmin, enquiryStatusFilter, enquiryCityFilter, enquiryCategoryFilter]);

  const handleEnquirySearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadAllAdminData();
  };

  const handleOpenEnquiryDetail = (enq: Enquiry) => {
    setSelectedEnquiry(enq);
    setStatusUpdateVal(enq.status);
    setNotesUpdateVal(enq.internalNotes || '');
  };

  const handleSaveEnquiryStatus = async () => {
    if (!selectedEnquiry) return;
    setIsUpdatingEnquiry(true);
    try {
      const res = await api.updateEnquiryStatus(selectedEnquiry.id, statusUpdateVal, notesUpdateVal);
      // update in local state
      setEnquiries((prev) =>
        prev.map((e) => (e.id === res.enquiry.id ? res.enquiry : e))
      );
      setSelectedEnquiry(res.enquiry);
      // Refresh stats
      const statsRes = await api.getAdminStats();
      setStats(statsRes.stats);
    } catch (err) {
      alert('Failed to update enquiry status.');
    } finally {
      setIsUpdatingEnquiry(false);
    }
  };

  const handleTogglePropertyActive = async (prop: Property) => {
    try {
      await api.updateProperty(prop.id, { isActive: !prop.isActive });
      setProperties((prev) =>
        prev.map((p) => (p.id === prop.id ? { ...p, isActive: !p.isActive } : p))
      );
    } catch (err) {
      alert('Failed to update property status.');
    }
  };

  const handleCreateProperty = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const amenitiesArr = newPropAmenities
        .split(',')
        .map((a) => a.trim())
        .filter(Boolean);

      await api.createProperty({
        title: newPropTitle,
        category: newPropCategory,
        propertyType: newPropType,
        transactionType: newPropTx,
        price: Number(newPropPrice) || 1000000,
        priceDisplay: newPropPriceDisplay || '₹1 Cr',
        state: 'Gujarat',
        city: newPropCity,
        locality: newPropLocality,
        address: newPropAddress || `${newPropLocality}, ${newPropCity}, Gujarat`,
        sizeSqFt: Number(newPropSize) || 2000,
        bedrooms: newPropBedrooms ? Number(newPropBedrooms) : undefined,
        bathrooms: newPropBathrooms ? Number(newPropBathrooms) : undefined,
        description: newPropDesc,
        amenities: amenitiesArr,
        imageUrl: newPropImage,
        isActive: true,
      });

      setShowAddPropertyModal(false);
      loadAllAdminData();
    } catch (err: any) {
      alert(err.message || 'Failed to create property.');
    }
  };

  const handleExportCSV = () => {
    window.location.href = api.getAdminExportUrl();
  };

  if (!isAdmin) {
    return (
      <div className="max-w-xl mx-auto py-20 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-heading text-2xl font-bold text-[#17211D]">
          Restricted Owner Access
        </h2>
        <p className="mt-2 text-sm text-[#17211D]/75">
          This portal is protected with server-side authorization and reserved for authorized NF ESTATE GROUP administrators and business owners.
        </p>
        <button
          onClick={onNavigateHome}
          className="mt-6 px-6 py-2.5 rounded-lg bg-[#17211D] text-[#F4F0E7] text-xs font-semibold"
        >
          Return to Public Site
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Top Banner */}
      <div className="bg-[#17211D] text-[#F4F0E7] rounded-2xl p-6 sm:p-8 shadow-xl border border-[#23312C] mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#DE9F7B] uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-[#B87952]" />
              <span>Owner & Management Control Console</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F0E7]">
              NF ESTATE GROUP Admin
            </h1>
            <p className="text-xs text-[#C8D6B0] mt-1">
              Gujarat Real Estate Database · Confirmed Owner Account ({user?.email})
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-lg bg-[#23312C] hover:bg-[#2b3d36] text-[#C8D6B0] border border-[#33463f] text-xs font-semibold transition-colors flex items-center gap-2 whitespace-nowrap shadow-sm"
            >
              <Download className="w-4 h-4 text-[#DE9F7B]" />
              Export Enquiries to CSV
            </button>

            <button
              onClick={() => setShowAddPropertyModal(true)}
              className="px-4 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors flex items-center gap-2 whitespace-nowrap shadow-md"
            >
              <Plus className="w-4 h-4" />
              Add Property Listing
            </button>
          </div>
        </div>

        {/* Overview Metric Cards */}
        {stats && (
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-[#C8D6B0] font-medium block">Total Enquiries</span>
              <span className="font-heading text-2xl font-bold text-[#F4F0E7] tabular-nums mt-1 block">
                {stats.totalEnquiries}
              </span>
            </div>

            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-amber-300 font-medium block">New Enquiries</span>
              <span className="font-heading text-2xl font-bold text-amber-400 tabular-nums mt-1 block">
                {stats.newEnquiries}
              </span>
            </div>

            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-blue-300 font-medium block">Contacted</span>
              <span className="font-heading text-2xl font-bold text-blue-400 tabular-nums mt-1 block">
                {stats.contactedEnquiries}
              </span>
            </div>

            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-purple-300 font-medium block">Site Visits</span>
              <span className="font-heading text-2xl font-bold text-purple-400 tabular-nums mt-1 block">
                {stats.siteVisitRequests}
              </span>
            </div>

            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-emerald-300 font-medium block">Closed</span>
              <span className="font-heading text-2xl font-bold text-emerald-400 tabular-nums mt-1 block">
                {stats.closedEnquiries}
              </span>
            </div>

            <div className="bg-[#23312C] p-4 rounded-xl border border-[#33463f]">
              <span className="text-[11px] text-[#C8D6B0] font-medium block">Total Listings</span>
              <span className="font-heading text-2xl font-bold text-[#F4F0E7] tabular-nums mt-1 block">
                {stats.totalListings}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-[#17211D]/15 mb-6 overflow-x-auto pb-1 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <TrendingUp className="w-4 h-4 text-[#B87952]" />
          <span>Executive Overview</span>
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'enquiries'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <Inbox className="w-4 h-4 text-[#B87952]" />
          <span>Customer Enquiries ({enquiries.length})</span>
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
          <span>Site Visit Requests ({siteVisits.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'sellers'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <Building className="w-4 h-4 text-[#B87952]" />
          <span>Owner Listing Submissions ({sellerSubmissions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className={`px-4 py-2.5 rounded-t-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'bg-[#17211D] text-[#F4F0E7]'
              : 'text-[#17211D]/70 hover:text-[#17211D]'
          }`}
        >
          <Building className="w-4 h-4 text-[#B87952]" />
          <span>Gujarat Property Inventory ({properties.length})</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-[#17211D]/60 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#B87952]" />
          <span className="text-sm">Loading admin records from server database...</span>
        </div>
      ) : (
        <div>
          {/* TAB 1: EXECUTIVE OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Recent Inbound Enquiries */}
                <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="font-heading text-base font-bold text-[#17211D]">
                      Recent Customer Enquiries
                    </h3>
                    <button
                      onClick={() => setActiveTab('enquiries')}
                      className="text-xs text-[#B87952] font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {enquiries.slice(0, 4).map((e) => (
                      <div
                        key={e.id}
                        onClick={() => handleOpenEnquiryDetail(e)}
                        className="p-3 rounded-xl bg-slate-50 hover:bg-[#C8D6B0]/20 border border-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#B87952]">{e.id}</span>
                            <span className="text-xs font-semibold text-slate-800 truncate">{e.customerName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {e.locality}, {e.city} · {e.selectedPropertyTitle || `${e.category} Enquiry`}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white border text-slate-700 ml-2">
                          {e.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Upcoming Site Visits */}
                <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 shadow-sm">
                  <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                    <h3 className="font-heading text-base font-bold text-[#17211D]">
                      Upcoming Site Inspections
                    </h3>
                    <button
                      onClick={() => setActiveTab('visits')}
                      className="text-xs text-[#B87952] font-semibold hover:underline"
                    >
                      View All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {siteVisits.slice(0, 4).map((v) => (
                      <div
                        key={v.id}
                        className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[11px] font-bold text-[#B87952]">{v.id}</span>
                            <span className="text-xs font-semibold text-slate-800 truncate">{v.customerName}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 truncate mt-0.5">
                            {new Date(v.preferredDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} · {v.preferredTimeSlot}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#C8D6B0]/30 text-[#23312C] ml-2">
                          {v.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Geographic Distribution Summary */}
              <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 shadow-sm">
                <h3 className="font-heading text-base font-bold text-[#17211D] mb-4">
                  Gujarat Geographic Coverage & System Invariants
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">State Strict Enclosure</span>
                    <span className="font-bold text-[#17211D] text-sm">Gujarat, India Only</span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Non-Gujarat locations are rejected at the database schema constraint level.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Top Active Gujarat Markets</span>
                    <span className="font-bold text-[#17211D] text-sm">Ahmedabad, Surat, Gandhinagar, Vadodara</span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      GIFT City, SG Highway, Bodakdev, Vesu, and GIDC corridors.
                    </p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-500 block mb-1">Data Privacy Standard</span>
                    <span className="font-bold text-[#17211D] text-sm">Customer PII Protected</span>
                    <p className="mt-1 text-[11px] text-slate-500">
                      Phone and email records isolated; unauthenticated public access blocked.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENQUIRIES MANAGEMENT */}
          {activeTab === 'enquiries' && (
            <div className="bg-white rounded-2xl border border-[#17211D]/10 shadow-sm overflow-hidden">
              
              {/* Search & Filter Bar */}
              <div className="p-5 bg-slate-50 border-b border-slate-200">
                <form onSubmit={handleEnquirySearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Search Customer or ID</label>
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Search..."
                        value={enquirySearch}
                        onChange={(e) => setEnquirySearch(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Filter Status</label>
                    <select
                      value={enquiryStatusFilter}
                      onChange={(e) => setEnquiryStatusFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="All">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Visit Scheduled">Visit Scheduled</option>
                      <option value="Closed">Closed</option>
                      <option value="Not Interested">Not Interested</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Filter Gujarat City</label>
                    <select
                      value={enquiryCityFilter}
                      onChange={(e) => setEnquiryCityFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="All">All Cities</option>
                      {GUJARAT_CITIES.map((c) => (
                        <option key={c.name} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Filter Category</label>
                    <select
                      value={enquiryCategoryFilter}
                      onChange={(e) => setEnquiryCategoryFilter(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                    >
                      <option value="All">All Categories</option>
                      <option value="Residential">Residential</option>
                      <option value="Commercial">Commercial</option>
                      <option value="Industrial">Industrial</option>
                    </select>
                  </div>
                </form>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Enquiry ID</th>
                      <th className="py-3 px-4">Customer</th>
                      <th className="py-3 px-4">Contact</th>
                      <th className="py-3 px-4">Gujarat Locality</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Budget Range</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {enquiries.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-500">
                          No matching customer enquiries found.
                        </td>
                      </tr>
                    ) : (
                      enquiries.map((enq) => (
                        <tr key={enq.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono font-bold text-[#B87952]">
                            {enq.id}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {enq.customerName}
                          </td>
                          <td className="py-3.5 px-4 text-slate-600">
                            <div>{enq.phone}</div>
                            <div className="text-[11px] text-slate-400">{enq.email}</div>
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-medium">{enq.locality}</span>, {enq.city}
                          </td>
                          <td className="py-3.5 px-4 text-slate-700">
                            <span className="font-semibold">{enq.category}</span>
                            <span className="text-[11px] text-slate-400 block">{enq.propertyType}</span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-800 font-semibold tabular-nums">
                            {enq.minBudget && enq.maxBudget
                              ? `${formatINR(enq.minBudget)} - ${formatINR(enq.maxBudget)}`
                              : 'Custom'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 tabular-nums">
                            {new Date(enq.createdAt).toLocaleDateString('en-IN', {
                              day: '2-digit',
                              month: 'short',
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#C8D6B0]/30 text-[#17211D] border border-[#C8D6B0]">
                              {enq.status}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => handleOpenEnquiryDetail(enq)}
                              className="px-3 py-1 bg-[#17211D] hover:bg-[#23312C] text-white rounded text-[11px] font-semibold transition-colors"
                            >
                              Manage
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: SITE VISITS */}
          {activeTab === 'visits' && (
            <div className="bg-white rounded-2xl border border-[#17211D]/10 shadow-sm overflow-hidden p-6">
              <h3 className="font-heading text-base font-bold text-[#17211D] mb-4">
                Escorted Site Visit Appointments
              </h3>

              <div className="space-y-4">
                {siteVisits.map((v) => (
                  <div key={v.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#B87952]">{v.id}</span>
                        <span className="font-bold text-sm text-[#17211D]">{v.propertyTitle}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span><strong>Client:</strong> {v.customerName} ({v.phone})</span>
                        <span>·</span>
                        <span><strong>Scheduled:</strong> {new Date(v.preferredDate).toLocaleDateString('en-IN')}</span>
                        <span>·</span>
                        <span><strong>Slot:</strong> {v.preferredTimeSlot}</span>
                      </div>
                      {v.notes && <p className="mt-1 text-xs text-slate-500 italic">Notes: {v.notes}</p>}
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <select
                        value={v.status}
                        onChange={async (e) => {
                          await api.updateSiteVisitStatus(v.id, e.target.value);
                          const res = await api.getAdminSiteVisits();
                          setSiteVisits(res.visits);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      >
                        <option value="Pending Confirmation">Pending Confirmation</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: SELLER SUBMISSIONS */}
          {activeTab === 'sellers' && (
            <div className="bg-white rounded-2xl border border-[#17211D]/10 shadow-sm overflow-hidden p-6">
              <h3 className="font-heading text-base font-bold text-[#17211D] mb-4">
                Owner & Seller Submissions ("Have a Property to List?")
              </h3>

              <div className="space-y-4">
                {sellerSubmissions.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#B87952]">{s.id}</span>
                        <span className="font-bold text-sm text-[#17211D]">{s.ownerName}</span>
                        <span className="text-slate-400">({s.phone} · {s.email})</span>
                      </div>
                      <p className="text-slate-700">
                        <strong>Property:</strong> {s.category} ({s.propertyType}) in {s.locality}, {s.city}, Gujarat
                      </p>
                      <p className="text-slate-700">
                        <strong>Expected Price:</strong> {s.expectedPrice} · <strong>Area:</strong> {s.areaSqFt}
                      </p>
                      {s.description && (
                        <p className="text-slate-500 italic">"{s.description}"</p>
                      )}
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-auto">
                      <select
                        value={s.status}
                        onChange={async (e) => {
                          await api.updateSellerSubmissionStatus(s.id, e.target.value);
                          const res = await api.getAdminSellerSubmissions();
                          setSellerSubmissions(res.submissions);
                        }}
                        className="px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs font-semibold"
                      >
                        <option value="Under Review">Under Review</option>
                        <option value="Verified">Verified</option>
                        <option value="Listed">Listed</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: PROPERTY INVENTORY */}
          {activeTab === 'inventory' && (
            <div className="bg-white rounded-2xl border border-[#17211D]/10 shadow-sm overflow-hidden p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-base font-bold text-[#17211D]">
                  Gujarat Property Inventory Manager
                </h3>
                <button
                  onClick={() => setShowAddPropertyModal(true)}
                  className="px-4 py-2 rounded-lg bg-[#B87952] text-white text-xs font-bold hover:bg-[#9E6340] flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Add New Listing
                </button>
              </div>

              <div className="space-y-4">
                {properties.map((p) => (
                  <div key={p.id} className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 rounded-lg bg-[#17211D] overflow-hidden shrink-0">
                        <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#B87952]">{p.id}</span>
                          <span className="font-bold text-sm text-[#17211D]">{p.title}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          {p.locality}, {p.city}, Gujarat · {p.category} · {p.priceDisplay}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end md:self-auto">
                      <button
                        onClick={() => handleTogglePropertyActive(p)}
                        className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                          p.isActive
                            ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
                        }`}
                      >
                        {p.isActive ? 'Active (Public)' : 'Inactive (Draft)'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ENQUIRY DETAIL MODAL */}
      {selectedEnquiry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            
            <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7]">
              <div>
                <span className="text-xs text-[#DE9F7B] font-mono">{selectedEnquiry.id}</span>
                <h3 className="font-heading text-lg font-bold text-[#F4F0E7]">
                  Enquiry Management
                </h3>
              </div>
              <button
                onClick={() => setSelectedEnquiry(null)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-xl">
                <div>
                  <span className="text-slate-400 block font-medium">Customer Name</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedEnquiry.customerName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Phone</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.phone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Email</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">City / Locality</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.locality}, {selectedEnquiry.city}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Category / Type</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.category} · {selectedEnquiry.propertyType}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-medium">Preferred Contact</span>
                  <span className="font-bold text-slate-900">{selectedEnquiry.preferredContactMethod}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-500 font-bold block mb-1">Customer Message:</span>
                <p className="p-3 bg-slate-50 rounded-lg text-slate-700 leading-relaxed border border-slate-200">
                  {selectedEnquiry.message}
                </p>
              </div>

              {/* Status Update */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">Update Enquiry Status:</label>
                <select
                  value={statusUpdateVal}
                  onChange={(e) => setStatusUpdateVal(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                >
                  <option value="New">New</option>
                  <option value="Contacted">Contacted</option>
                  <option value="Visit Scheduled">Visit Scheduled</option>
                  <option value="Closed">Closed</option>
                  <option value="Not Interested">Not Interested</option>
                </select>
              </div>

              {/* Internal Notes */}
              <div>
                <label className="text-slate-700 font-bold block mb-1">Internal Owner / Advisor Notes:</label>
                <textarea
                  rows={3}
                  placeholder="Record follow-up calls, client requirements, site visit notes..."
                  value={notesUpdateVal}
                  onChange={(e) => setNotesUpdateVal(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedEnquiry(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isUpdatingEnquiry}
                  onClick={handleSaveEnquiryStatus}
                  className="px-6 py-2 bg-[#B87952] text-white font-bold rounded-lg hover:bg-[#9E6340] shadow-sm flex items-center gap-1.5"
                >
                  {isUpdatingEnquiry ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ADD PROPERTY MODAL */}
      {showAddPropertyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
            <div className="flex items-center justify-between px-6 py-4 bg-[#17211D] text-[#F4F0E7]">
              <h3 className="font-heading text-lg font-bold text-[#F4F0E7]">
                Add Verified Gujarat Property Listing
              </h3>
              <button
                onClick={() => setShowAddPropertyModal(false)}
                className="p-1 rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProperty} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              <div>
                <label className="font-bold block mb-1">Property Title *</label>
                <input
                  type="text"
                  required
                  value={newPropTitle}
                  onChange={(e) => setNewPropTitle(e.target.value)}
                  placeholder="e.g. Royal Heights — 4 BHK Luxury Apartment"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Category *</label>
                  <select
                    value={newPropCategory}
                    onChange={(e) => setNewPropCategory(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Industrial">Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">Property Type</label>
                  <input
                    type="text"
                    value={newPropType}
                    onChange={(e) => setNewPropType(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-bold block mb-1">Transaction</label>
                  <select
                    value={newPropTx}
                    onChange={(e) => setNewPropTx(e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    <option value="Buy">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Price Numeric (INR) *</label>
                  <input
                    type="number"
                    value={newPropPrice}
                    onChange={(e) => setNewPropPrice(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Display Price (e.g. ₹2.50 Cr) *</label>
                  <input
                    type="text"
                    value={newPropPriceDisplay}
                    onChange={(e) => setNewPropPriceDisplay(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-bold block mb-1">Gujarat City *</label>
                  <select
                    value={newPropCity}
                    onChange={(e) => {
                      setNewPropCity(e.target.value);
                      const locs = getLocalitiesForCity(e.target.value);
                      setNewPropLocality(locs[0] || 'General Locality');
                    }}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {GUJARAT_CITIES.map((c) => (
                      <option key={c.name} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-bold block mb-1">Locality *</label>
                  <select
                    value={newPropLocality}
                    onChange={(e) => setNewPropLocality(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  >
                    {getLocalitiesForCity(newPropCity).map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Full Address</label>
                <input
                  type="text"
                  value={newPropAddress}
                  onChange={(e) => setNewPropAddress(e.target.value)}
                  placeholder="Plot/Survey No., Road, Area"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-bold block mb-1">Area (sq.ft)</label>
                  <input
                    type="number"
                    value={newPropSize}
                    onChange={(e) => setNewPropSize(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bedrooms</label>
                  <input
                    type="number"
                    value={newPropBedrooms}
                    onChange={(e) => setNewPropBedrooms(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-bold block mb-1">Bathrooms</label>
                  <input
                    type="number"
                    value={newPropBathrooms}
                    onChange={(e) => setNewPropBathrooms(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">Description</label>
                <textarea
                  rows={3}
                  value={newPropDesc}
                  onChange={(e) => setNewPropDesc(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Amenities (comma-separated)</label>
                <input
                  type="text"
                  value={newPropAmenities}
                  onChange={(e) => setNewPropAmenities(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">Image URL</label>
                <input
                  type="text"
                  value={newPropImage}
                  onChange={(e) => setNewPropImage(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddPropertyModal(false)}
                  className="px-4 py-2 border rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#B87952] text-white font-bold rounded-lg hover:bg-[#9E6340]"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
