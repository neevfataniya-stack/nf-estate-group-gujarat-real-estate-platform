import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { api } from './api/client';
import { 
  Property, 
  SearchFilterState, 
  Enquiry, 
  SiteVisitRequest, 
  SellerSubmission 
} from './types';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { GujaratSearchPanel } from './components/GujaratSearchPanel';
import { PropertyCard } from './components/PropertyCard';
import { PropertyDetailsModal } from './components/PropertyDetailsModal';
import { EnquiryModal } from './components/EnquiryModal';
import { SiteVisitModal } from './components/SiteVisitModal';
import { SellerSubmissionModal } from './components/SellerSubmissionModal';
import { AuthModal } from './components/AuthModal';
import { CustomerDashboard } from './components/CustomerDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { LegalModal } from './components/LegalModal';
import { NFMonogram } from './components/NFMonogram';

import { 
  Building, 
  Home, 
  Factory, 
  ArrowRight, 
  Search, 
  MapPin, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall, 
  MessageSquare, 
  Calendar,
  Sparkles,
  Loader2,
  FileText,
  User as UserIcon,
  HelpCircle,
  Clock,
  Award
} from 'lucide-react';

function MainApp() {
  const { user, isAdmin } = useAuth();

  // Navigation view: 'home' | 'properties' | 'residential' | 'commercial' | 'industrial' | 'account' | 'account-enquiries' | 'admin'
  const [currentView, setCurrentView] = useState<string>('home');

  // Search & Filter State
  const [filters, setFilters] = useState<SearchFilterState>({
    state: 'Gujarat',
    city: 'All',
    locality: 'All',
    category: 'All',
    transactionType: 'All',
    propertyType: 'All',
    minBudget: null,
    maxBudget: null,
    searchQuery: '',
  });

  // Properties list
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState<boolean>(true);
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>([]);

  // Modals
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isEnquiryOpen, setIsEnquiryOpen] = useState<boolean>(false);
  const [isSiteVisitOpen, setIsSiteVisitOpen] = useState<boolean>(false);
  const [isSellerModalOpen, setIsSellerModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'signup'>('login');
  const [legalModalType, setLegalModalType] = useState<'privacy' | 'terms' | null>(null);
  const [isDirectCallOpen, setIsDirectCallOpen] = useState<boolean>(false);

  // Pending action after auth redirect (e.g. return to enquiry for selected property)
  const [pendingAction, setPendingAction] = useState<'enquiry' | 'visit' | null>(null);

  // Load properties based on current filters and view
  const fetchProperties = async (customFilters?: SearchFilterState) => {
    setLoadingProperties(true);
    const activeFilters = customFilters || filters;

    try {
      let categoryFilter = activeFilters.category;
      if (currentView === 'residential') categoryFilter = 'Residential';
      if (currentView === 'commercial') categoryFilter = 'Commercial';
      if (currentView === 'industrial') categoryFilter = 'Industrial';

      const res = await api.getProperties({
        city: activeFilters.city !== 'All' ? activeFilters.city : undefined,
        locality: activeFilters.locality !== 'All' ? activeFilters.locality : undefined,
        category: categoryFilter !== 'All' ? categoryFilter : undefined,
        transactionType: activeFilters.transactionType !== 'All' ? activeFilters.transactionType : undefined,
        propertyType: activeFilters.propertyType !== 'All' ? activeFilters.propertyType : undefined,
        minPrice: activeFilters.minBudget || undefined,
        maxPrice: activeFilters.maxBudget || undefined,
        search: activeFilters.searchQuery || undefined,
      });

      setProperties(res.properties || []);
    } catch (err) {
      console.error('Error fetching properties:', err);
    } finally {
      setLoadingProperties(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [currentView]);

  // Load saved property IDs if user is logged in
  useEffect(() => {
    if (user) {
      api.getSavedProperties()
        .then((res) => setSavedPropertyIds(res.ids || []))
        .catch(() => setSavedPropertyIds([]));
    } else {
      setSavedPropertyIds([]);
    }
  }, [user]);

  const handleToggleSave = async (propertyId: string) => {
    if (!user) {
      setAuthInitialTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    try {
      const res = await api.toggleSavedProperty(propertyId);
      setSavedPropertyIds(res.ids);
    } catch (err) {
      console.error('Failed to toggle save:', err);
    }
  };

  const handleSearchSubmit = (newFilters: SearchFilterState) => {
    setFilters(newFilters);
    fetchProperties(newFilters);
    // Smooth scroll to results
    const resultsElem = document.getElementById('properties-results-anchor');
    if (resultsElem) {
      resultsElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    const cleared: SearchFilterState = {
      state: 'Gujarat',
      city: 'All',
      locality: 'All',
      category: 'All',
      transactionType: 'All',
      propertyType: 'All',
      minBudget: null,
      maxBudget: null,
      searchQuery: '',
    };
    setFilters(cleared);
    fetchProperties(cleared);
  };

  const handleViewDetails = (prop: Property) => {
    setSelectedProperty(prop);
    setIsDetailsOpen(true);
  };

  const handleEnquireNow = (prop: Property) => {
    setSelectedProperty(prop);
    if (!user) {
      setPendingAction('enquiry');
      setAuthInitialTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsDetailsOpen(false);
    setIsEnquiryOpen(true);
  };

  const handleRequestSiteVisit = (prop: Property) => {
    setSelectedProperty(prop);
    if (!user) {
      setPendingAction('visit');
      setAuthInitialTab('login');
      setIsAuthModalOpen(true);
      return;
    }
    setIsDetailsOpen(false);
    setIsSiteVisitOpen(true);
  };

  const handleAuthSuccess = () => {
    if (pendingAction === 'enquiry') {
      setIsEnquiryOpen(true);
      setPendingAction(null);
    } else if (pendingAction === 'visit') {
      setIsSiteVisitOpen(true);
      setPendingAction(null);
    }
  };

  const scrollToSearchSection = () => {
    const searchElem = document.getElementById('property-search-section');
    if (searchElem) {
      searchElem.scrollIntoView({ behavior: 'smooth' });
    } else {
      setCurrentView('properties');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F4F0E7] text-[#17211D]">
      
      {/* Top Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenAuth={(tab) => {
          setAuthInitialTab(tab || 'login');
          setIsAuthModalOpen(true);
        }}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenEnquiryModal={() => {
          setSelectedProperty(null);
          setIsEnquiryOpen(true);
        }}
      />

      {/* Main View Switcher */}
      <main className="flex-1">
        
        {/* VIEW: ADMIN DASHBOARD */}
        {currentView === 'admin' && (
          <AdminDashboard onNavigateHome={() => setCurrentView('home')} />
        )}

        {/* VIEW: CUSTOMER ACCOUNT */}
        {(currentView === 'account' || currentView === 'account-enquiries') && (
          <CustomerDashboard
            initialTab={currentView === 'account-enquiries' ? 'enquiries' : 'profile'}
            onViewProperty={handleViewDetails}
            onEnquireProperty={handleEnquireNow}
            onOpenEnquiryModal={() => {
              setSelectedProperty(null);
              setIsEnquiryOpen(true);
            }}
            onNavigateHome={() => setCurrentView('home')}
          />
        )}

        {/* VIEW: HOMEPAGE OR LISTING PAGES */}
        {currentView !== 'admin' && currentView !== 'account' && currentView !== 'account-enquiries' && (
          <div>
            
            {/* 1. HOMEPAGE HERO SECTION */}
            {currentView === 'home' && (
              <section className="relative bg-[#17211D] text-[#F4F0E7] pt-12 pb-24 overflow-hidden border-b border-[#23312C]">
                
                {/* Architectural Accent Gradients */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#C8D6B0_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#B87952]/15 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                  
                  {/* Hero Split Header */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    
                    <div className="lg:col-span-7 space-y-6">
                      
                      {/* Quiet Editorial Kicker */}
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#23312C] text-[#C8D6B0] text-xs font-semibold tracking-wide border border-[#33463f]">
                        <span className="w-2 h-2 rounded-full bg-[#B87952]" />
                        <span>Exclusive Gujarat Real Estate Advisory</span>
                        <span>·</span>
                        <span>RERA Verified</span>
                      </div>

                      {/* Display Headline */}
                      <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#F4F0E7] text-balance leading-tight">
                        Your Future. <br />
                        <span className="text-[#C8D6B0]">Our Foundation.</span>
                      </h1>

                      <p className="text-base sm:text-lg text-[#F4F0E7]/80 max-w-2xl leading-relaxed">
                        NF ESTATE GROUP is Gujarat’s authoritative real estate consultancy. We provide vetted residential sky residences, prime retail showrooms, corporate towers, and industrial logistics facilities across Ahmedabad, Surat, Vadodara, and all major Gujarat growth corridors.
                      </p>

                      {/* 1. HOMEPAGE HERO CTA BUTTONS */}
                      <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                        
                        {/* Primary CTA: Explore Properties */}
                        <button
                          onClick={() => {
                            setCurrentView('properties');
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="px-8 py-3.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-bold transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#B87952] focus:ring-offset-2 focus:ring-offset-[#17211D]"
                        >
                          <span>Explore Properties</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>

                        {/* Secondary CTA: Find Your Property */}
                        <button
                          onClick={scrollToSearchSection}
                          className="px-8 py-3.5 rounded-lg border border-[#C8D6B0]/40 text-[#F4F0E7] hover:bg-[#23312C] hover:border-[#C8D6B0] text-sm font-semibold transition-all flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none"
                        >
                          <Search className="w-4 h-4 text-[#C8D6B0]" />
                          <span>Find Your Property</span>
                        </button>

                      </div>

                      {/* Trust Indicators */}
                      <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-[#C8D6B0]">
                        <div className="flex items-center gap-2">
                          <ShieldCheck className="w-4 h-4 text-[#B87952]" />
                          <span>100% Clear Title Verification</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-[#B87952]" />
                          <span>20 Gujarat Cities Covered</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#B87952]" />
                          <span>Confidential Advisory</span>
                        </div>
                      </div>

                    </div>

                    {/* Hero Architectural Focal Carrier */}
                    <div className="lg:col-span-5">
                      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-[#23312C] bg-[#23312C] aspect-[4/3]">
                        <img
                          src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                          alt="Modern Gujarat Architectural Development"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#17211D] via-transparent to-transparent opacity-80" />
                        
                        <div className="absolute bottom-5 left-5 right-5 p-4 rounded-xl bg-[#17211D]/90 backdrop-blur-md border border-[#33463f] text-xs">
                          <div className="flex items-center justify-between text-[#C8D6B0] mb-1 font-semibold">
                            <span>Prime Commercial & Residential Hub</span>
                            <span className="font-mono text-[#DE9F7B]">Ahmedabad & Surat</span>
                          </div>
                          <p className="text-[#F4F0E7] font-heading font-bold text-sm">
                            High-Yield Investments & Bespoke Living Spaces
                          </p>
                        </div>
                      </div>
                    </div>

                  </div>

                </div>
              </section>
            )}

            {/* SEARCH SECTION & ANCHOR */}
            <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 z-20">
              <GujaratSearchPanel
                initialFilters={filters}
                onSearch={handleSearchSubmit}
                onClear={handleClearFilters}
              />
            </section>

            {/* 6. CUSTOMER LOGIN CTA SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
              <div className="bg-white rounded-2xl p-6 sm:p-7 border border-[#17211D]/10 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#17211D] flex items-center justify-center text-[#C8D6B0] shrink-0">
                    <UserIcon className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-heading text-lg font-bold text-[#17211D]">
                      {user ? `Customer Portal · ${user.name}` : 'Gujarat Customer Account & Enquiry Tracking'}
                    </h3>
                    <p className="text-xs text-[#17211D]/75 mt-0.5">
                      {user
                        ? 'View and manage all your submitted Gujarat property enquiries, site inspection visits, and saved listings.'
                        : 'Register or sign in to save your preferred properties, track enquiry statuses, and schedule escorted site inspections.'}
                    </p>
                  </div>
                </div>

                {/* The 3 Mandatory Buttons from Section 6 */}
                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
                  {!user ? (
                    <>
                      {/* Create Your Account */}
                      <button
                        onClick={() => {
                          setAuthInitialTab('signup');
                          setIsAuthModalOpen(true);
                        }}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors whitespace-nowrap shadow-sm text-center focus:outline-none focus:ring-2 focus:ring-[#B87952]"
                      >
                        Create Your Account
                      </button>

                      {/* Login to Your Account */}
                      <button
                        onClick={() => {
                          setAuthInitialTab('login');
                          setIsAuthModalOpen(true);
                        }}
                        className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg border border-[#17211D] text-[#17211D] hover:bg-[#17211D] hover:text-[#F4F0E7] text-xs font-semibold transition-colors whitespace-nowrap text-center focus:outline-none"
                      >
                        Login to Your Account
                      </button>
                    </>
                  ) : null}

                  {/* View My Enquiries */}
                  <button
                    onClick={() => {
                      if (!user) {
                        setPendingAction('enquiry');
                        setAuthInitialTab('login');
                        setIsAuthModalOpen(true);
                      } else {
                        setCurrentView('account-enquiries');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="flex-1 sm:flex-initial px-5 py-2.5 rounded-lg bg-[#17211D] hover:bg-[#23312C] text-[#F4F0E7] text-xs font-semibold transition-colors whitespace-nowrap flex items-center justify-center gap-2 focus:outline-none"
                  >
                    <FileText className="w-3.5 h-3.5 text-[#C8D6B0]" />
                    <span>View My Enquiries</span>
                  </button>
                </div>
              </div>
            </section>

            {/* 3. PROPERTY CATEGORIES SECTION (HOMEPAGE) */}
            {currentView === 'home' && (
              <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                <div className="text-center max-w-3xl mx-auto mb-12">
                  <div className="flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B87952] mb-2">
                    <Building className="w-4 h-4" />
                    <span>Specialized Property Categories</span>
                  </div>
                  <h2 className="font-heading text-3xl font-extrabold text-[#17211D]">
                    Three Pillars of Gujarat Real Estate
                  </h2>
                  <p className="mt-2 text-sm text-[#17211D]/75">
                    Explore curated listings categorized to match your specific residential, commercial, or industrial expansion objectives.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  
                  {/* Category 1: Residential */}
                  <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 hover:border-[#B87952]/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#C8D6B0]/30 text-[#17211D] flex items-center justify-center mb-4">
                        <Home className="w-6 h-6 text-[#23312C]" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#17211D] mb-2">
                        Residential Real Estate
                      </h3>
                      <p className="text-xs text-[#17211D]/75 leading-relaxed mb-4">
                        Ultra-luxury sky apartments, private modern villas, duplex penthouses, weekend farmhouses, and freehold residential plots in prime Gujarat neighborhoods like Bodakdev, Vesu, and Gotri.
                      </p>
                    </div>

                    {/* CTA Button: Explore Residential Properties */}
                    <button
                      onClick={() => {
                        setCurrentView('residential');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#17211D] hover:bg-[#23312C] text-[#F4F0E7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <span>Explore Residential Properties</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8D6B0]" />
                    </button>
                  </div>

                  {/* Category 2: Commercial */}
                  <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 hover:border-[#B87952]/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#C8D6B0]/30 text-[#17211D] flex items-center justify-center mb-4">
                        <Building className="w-6 h-6 text-[#23312C]" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#17211D] mb-2">
                        Commercial Real Estate
                      </h3>
                      <p className="text-xs text-[#17211D]/75 leading-relaxed mb-4">
                        Corporate headquarters, Grade-A IT offices in GIFT City and SG Highway, high-street retail showrooms, co-working facilities, and commercial SCO plots with exceptional footfall.
                      </p>
                    </div>

                    {/* CTA Button: Explore Commercial Properties */}
                    <button
                      onClick={() => {
                        setCurrentView('commercial');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#17211D] hover:bg-[#23312C] text-[#F4F0E7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <span>Explore Commercial Properties</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8D6B0]" />
                    </button>
                  </div>

                  {/* Category 3: Industrial */}
                  <div className="bg-white rounded-2xl p-6 border border-[#17211D]/10 hover:border-[#B87952]/40 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between">
                    <div>
                      <div className="w-12 h-12 rounded-xl bg-[#C8D6B0]/30 text-[#17211D] flex items-center justify-center mb-4">
                        <Factory className="w-6 h-6 text-[#23312C]" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#17211D] mb-2">
                        Industrial Real Estate
                      </h3>
                      <p className="text-xs text-[#17211D]/75 leading-relaxed mb-4">
                        Pre-engineered logistics warehouses, chemical and pharma manufacturing units in Ankleshwar and Dahej PCPIR, GIDC workshop sheds, and heavy industrial NA land plots.
                      </p>
                    </div>

                    {/* CTA Button: Explore Industrial Properties */}
                    <button
                      onClick={() => {
                        setCurrentView('industrial');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="mt-4 w-full py-2.5 px-4 rounded-lg bg-[#17211D] hover:bg-[#23312C] text-[#F4F0E7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap shadow-sm"
                    >
                      <span>Explore Industrial Properties</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C8D6B0]" />
                    </button>
                  </div>

                </div>
              </section>
            )}

            {/* PROPERTIES LISTINGS SECTION */}
            <section id="properties-results-anchor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#17211D]/15">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#B87952]">
                    <span>Gujarat Inventory Records</span>
                    <span>·</span>
                    <span className="font-semibold text-[#17211D]">
                      {currentView === 'residential' ? 'Residential Only' : currentView === 'commercial' ? 'Commercial Only' : currentView === 'industrial' ? 'Industrial Only' : 'All Categories'}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#17211D] mt-1">
                    {currentView === 'residential'
                      ? 'Residential Properties in Gujarat'
                      : currentView === 'commercial'
                      ? 'Commercial Properties in Gujarat'
                      : currentView === 'industrial'
                      ? 'Industrial Real Estate in Gujarat'
                      : 'Verified Gujarat Properties'}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#17211D]/80 bg-white px-3 py-1.5 rounded-lg border border-[#17211D]/15 tabular-nums">
                    Showing {properties.length} Verified Records
                  </span>
                </div>
              </div>

              {/* Grid of Property Cards */}
              {loadingProperties ? (
                <div className="py-24 flex flex-col items-center justify-center text-[#17211D]/60 gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-[#B87952]" />
                  <span className="text-sm font-medium">Querying verified Gujarat property listings...</span>
                </div>
              ) : properties.length === 0 ? (
                <div className="py-20 text-center bg-white rounded-2xl border border-[#17211D]/10 p-8 my-6">
                  <Building className="w-12 h-12 text-[#C8D6B0] mx-auto mb-3" />
                  <h3 className="font-heading text-lg font-bold text-[#17211D]">
                    No Properties Match Your Current Filters
                  </h3>
                  <p className="mt-1 text-xs text-[#17211D]/70 max-w-md mx-auto">
                    We could not find active listings in the selected Gujarat city, category, or budget range. Try clearing your filters or submit a custom enquiry.
                  </p>
                  <div className="mt-5 flex justify-center gap-3">
                    <button
                      onClick={handleClearFilters}
                      className="px-5 py-2.5 rounded-lg border border-[#17211D] text-[#17211D] text-xs font-semibold hover:bg-[#17211D] hover:text-white transition-colors"
                    >
                      Clear All Filters
                    </button>
                    <button
                      onClick={() => {
                        setSelectedProperty(null);
                        setIsEnquiryOpen(true);
                      }}
                      className="px-5 py-2.5 rounded-lg bg-[#B87952] text-white text-xs font-semibold hover:bg-[#9E6340] transition-colors"
                    >
                      Submit Custom Requirement
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map((prop) => (
                    <PropertyCard
                      key={prop.id}
                      property={prop}
                      isSaved={savedPropertyIds.includes(prop.id)}
                      onViewDetails={handleViewDetails}
                      onEnquire={handleEnquireNow}
                      onToggleSave={handleToggleSave}
                    />
                  ))}
                </div>
              )}

            </section>

            {/* 7. OWNER AND SELLER CTA SECTION */}
            <section className="bg-white border-y border-[#17211D]/15 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-[#17211D] rounded-2xl p-8 sm:p-12 text-[#F4F0E7] flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
                  <div className="space-y-3 max-w-2xl">
                    <span className="text-xs font-bold text-[#DE9F7B] uppercase tracking-wider block">
                      Owner & Developer Acquisitions Desk
                    </span>
                    <h3 className="font-heading text-2xl sm:text-3xl font-extrabold text-[#F4F0E7]">
                      Have a Property to List?
                    </h3>
                    <p className="text-sm text-[#F4F0E7]/80 leading-relaxed">
                      Connect with NF ESTATE GROUP to discuss listing your property. Our acquisitions desk coordinates institutional title reviews and connects approved properties with qualified buyers and corporate tenants across Gujarat.
                    </p>
                  </div>

                  {/* Button: Submit Property Details */}
                  <button
                    onClick={() => setIsSellerModalOpen(true)}
                    className="w-full md:w-auto px-8 py-3.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-bold transition-all shadow-md hover:shadow-lg whitespace-nowrap shrink-0 focus:outline-none focus:ring-2 focus:ring-[#B87952]"
                  >
                    Submit Property Details
                  </button>
                </div>
              </div>
            </section>

            {/* 8. CONTACT CTA SECTION */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="bg-white rounded-2xl p-8 sm:p-12 border border-[#17211D]/10 shadow-sm text-center max-w-3xl mx-auto space-y-6">
                <div className="w-12 h-12 rounded-xl bg-[#C8D6B0]/30 text-[#17211D] flex items-center justify-center mx-auto">
                  <PhoneCall className="w-6 h-6 text-[#23312C]" />
                </div>

                <div className="space-y-2">
                  <h3 className="font-heading text-3xl font-extrabold text-[#17211D]">
                    Let's Find Your Next Property.
                  </h3>
                  <p className="text-sm text-[#17211D]/75 leading-relaxed">
                    Tell us what you are looking for, and our team can follow up on your property enquiry with tailored documentation and site visit arrangements.
                  </p>
                </div>

                {/* 3 Verified Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  
                  {/* Send an Enquiry */}
                  <button
                    onClick={() => {
                      setSelectedProperty(null);
                      setIsEnquiryOpen(true);
                    }}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send an Enquiry</span>
                  </button>

                  {/* Call Us */}
                  <button
                    onClick={() => setIsDirectCallOpen(true)}
                    className="w-full sm:w-auto px-6 py-3 rounded-lg border border-[#17211D] text-[#17211D] hover:bg-[#17211D] hover:text-[#F4F0E7] text-xs font-semibold transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <PhoneCall className="w-4 h-4 text-[#B87952]" />
                    <span>Call Us</span>
                  </button>

                  {/* Chat on WhatsApp */}
                  <a
                    href="https://wa.me/919825012345?text=Hello%20NF%20ESTATE%20GROUP,%20I%20am%20interested%20in%20verified%20properties%20in%20Gujarat."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-3 rounded-lg bg-[#25D366] hover:bg-[#20b858] text-white text-xs font-bold transition-colors shadow-sm flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Chat on WhatsApp</span>
                  </a>

                </div>
              </div>
            </section>

            {/* 9. FINAL HOMEPAGE CTA BANNER */}
            {currentView === 'home' && (
              <section className="w-full bg-[#17211D] text-[#F4F0E7] py-20 border-t border-[#23312C] relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-6">
                  
                  <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#C8D6B0]">
                    <NFMonogram size={24} inverted />
                    <span>NF ESTATE GROUP · GUJARAT</span>
                  </div>

                  <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#F4F0E7]">
                    Your Next Property Starts Here.
                  </h2>

                  <p className="text-sm sm:text-base text-[#F4F0E7]/80 max-w-2xl mx-auto leading-relaxed">
                    Explore residential, commercial and industrial property opportunities across Gujarat. Our team brings deep local market expertise and thorough regulatory verification.
                  </p>

                  {/* Buttons: Explore Properties & Submit an Enquiry */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        setCurrentView('properties');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                      <span>Explore Properties</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedProperty(null);
                        setIsEnquiryOpen(true);
                      }}
                      className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-[#23312C] border-2 border-[#B87952] text-[#F4F0E7] hover:bg-[#B87952] hover:text-white text-sm font-bold transition-all shadow-lg flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none"
                    >
                      <MessageSquare className="w-4 h-4 text-[#DE9F7B]" />
                      <span>Submit an Enquiry</span>
                    </button>
                  </div>

                </div>
              </section>
            )}

          </div>
        )}

      </main>

      {/* Footer */}
      <Footer
        onNavigate={(view) => {
          setCurrentView(view);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenLegal={(type) => setLegalModalType(type)}
        onOpenSellerModal={() => setIsSellerModalOpen(true)}
        onOpenEnquiryModal={() => {
          setSelectedProperty(null);
          setIsEnquiryOpen(true);
        }}
      />

      {/* MODALS */}
      
      {/* Property Details Modal */}
      <PropertyDetailsModal
        property={selectedProperty}
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        onEnquire={handleEnquireNow}
        onRequestSiteVisit={handleRequestSiteVisit}
        onContactTeam={(prop) => {
          setIsDetailsOpen(false);
          setIsDirectCallOpen(true);
        }}
        isSaved={selectedProperty ? savedPropertyIds.includes(selectedProperty.id) : false}
        onToggleSave={handleToggleSave}
      />

      {/* Enquiry Modal */}
      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
        selectedProperty={selectedProperty}
        onRequireLogin={() => {
          setAuthInitialTab('login');
          setIsAuthModalOpen(true);
        }}
        onSuccess={(enq) => {
          // Success handled in modal
        }}
      />

      {/* Site Visit Modal */}
      <SiteVisitModal
        property={selectedProperty}
        isOpen={isSiteVisitOpen}
        onClose={() => setIsSiteVisitOpen(false)}
        onRequireLogin={() => {
          setAuthInitialTab('login');
          setIsAuthModalOpen(true);
        }}
        onSuccess={(visit) => {
          // Success handled in modal
        }}
      />

      {/* Seller Submission Modal */}
      <SellerSubmissionModal
        isOpen={isSellerModalOpen}
        onClose={() => setIsSellerModalOpen(false)}
      />

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialTab={authInitialTab}
        onSuccessRedirect={handleAuthSuccess}
        onOpenPrivacyPolicy={() => setLegalModalType('privacy')}
      />

      {/* Legal Modal (Privacy Policy & Terms) */}
      <LegalModal
        isOpen={legalModalType !== null}
        onClose={() => setLegalModalType(null)}
        type={legalModalType || 'privacy'}
      />

      {/* Call Us Consultation Modal */}
      {isDirectCallOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-white rounded-2xl p-6 sm:p-8 shadow-2xl border border-slate-200 text-center">
            <div className="w-12 h-12 rounded-full bg-[#17211D] text-[#C8D6B0] flex items-center justify-center mx-auto mb-4">
              <PhoneCall className="w-6 h-6" />
            </div>

            <h3 className="font-heading text-xl font-bold text-[#17211D]">
              Direct Gujarat Advisory Desk
            </h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Connect directly with our senior property advisors for immediate title consultation and viewing assistance:
            </p>

            <div className="mt-5 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Ahmedabad HQ Desk:</span>
                <a href="tel:+919825012345" className="font-bold text-[#B87952] hover:underline">
                  +91 98250 12345
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Surat & South Gujarat:</span>
                <a href="tel:+919879054321" className="font-bold text-[#B87952] hover:underline">
                  +91 98790 54321
                </a>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Operating Hours:</span>
                <span className="font-semibold text-slate-700">Mon - Sat (9:30 AM - 7:30 PM IST)</span>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsDirectCallOpen(false)}
                className="w-1/2 py-2.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <a
                href="tel:+919825012345"
                className="w-1/2 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call Now</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
