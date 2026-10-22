import React, { useState, useEffect, useRef } from 'react';
import { 
  GUJARAT_CITIES, 
  getLocalitiesForCity, 
  BUDGET_OPTIONS, 
  formatINR 
} from '../data/gujaratLocations';
import { SearchFilterState } from '../types';
import { 
  Search, 
  RotateCcw, 
  MapPin, 
  IndianRupee, 
  CheckCircle2, 
  ChevronDown, 
  X,
  Check
} from 'lucide-react';

interface GujaratSearchPanelProps {
  initialFilters?: Partial<SearchFilterState>;
  onSearch: (filters: SearchFilterState) => void;
  onClear: () => void;
  compact?: boolean;
}

export const GujaratSearchPanel: React.FC<GujaratSearchPanelProps> = ({
  initialFilters,
  onSearch,
  onClear,
  compact = false,
}) => {
  const [city, setCity] = useState<string>(initialFilters?.city || 'All Cities');
  const [locality, setLocality] = useState<string>(initialFilters?.locality || 'All Areas');
  const [category, setCategory] = useState<string>(initialFilters?.category || 'All');
  const [transactionType, setTransactionType] = useState<string>(initialFilters?.transactionType || 'All');
  const [propertyType, setPropertyType] = useState<string>(initialFilters?.propertyType || 'All');
  const [minBudget, setMinBudget] = useState<number | null>(initialFilters?.minBudget ?? null);
  const [maxBudget, setMaxBudget] = useState<number | null>(initialFilters?.maxBudget ?? null);
  const [customMinInput, setCustomMinInput] = useState<string>('');
  const [customMaxInput, setCustomMaxInput] = useState<string>('');
  const [useCustomBudget, setUseCustomBudget] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>(initialFilters?.searchQuery || '');

  // Typeahead state for City
  const [cityInput, setCityInput] = useState<string>(initialFilters?.city === 'All' ? 'All Cities' : initialFilters?.city || 'All Cities');
  const [isCityOpen, setIsCityOpen] = useState<boolean>(false);
  const [highlightedCityIndex, setHighlightedCityIndex] = useState<number>(-1);
  const cityRef = useRef<HTMLDivElement>(null);

  // Typeahead state for Locality
  const [localityInput, setLocalityInput] = useState<string>(initialFilters?.locality === 'All' ? 'All Areas' : initialFilters?.locality || 'All Areas');
  const [isLocalityOpen, setIsLocalityOpen] = useState<boolean>(false);
  const [highlightedLocalityIndex, setHighlightedLocalityIndex] = useState<number>(-1);
  const localityRef = useRef<HTMLDivElement>(null);

  // Filtered Cities for Typeahead
  const filteredCities = React.useMemo(() => {
    const q = cityInput.trim().toLowerCase();
    const allOption = { name: 'All Cities', localities: [] };
    if (!q || q === 'all' || q === 'all cities') {
      return [allOption, ...GUJARAT_CITIES];
    }
    const matches = GUJARAT_CITIES.filter((c) =>
      c.name.toLowerCase().includes(q)
    );
    if ('all cities'.includes(q)) {
      return [allOption, ...matches];
    }
    return matches;
  }, [cityInput]);

  // Filtered Localities for Typeahead
  interface LocalityOption {
    name: string;
    cityName: string;
    isAll?: boolean;
  }

  const filteredLocalities = React.useMemo<LocalityOption[]>(() => {
    const q = localityInput.trim().toLowerCase();
    const isSpecificCity = city !== 'All Cities' && city !== 'All';

    if (isSpecificCity) {
      const locs = getLocalitiesForCity(city);
      const allLocOption: LocalityOption = {
        name: `All Areas in ${city}`,
        cityName: city,
        isAll: true,
      };

      if (!q || q === 'all' || q === 'all areas' || q === `all areas in ${city}`.toLowerCase()) {
        return [allLocOption, ...locs.map((l) => ({ name: l, cityName: city }))];
      }

      const matches = locs
        .filter((l) => l.toLowerCase().includes(q))
        .map((l) => ({ name: l, cityName: city }));

      if ('all areas'.includes(q)) {
        return [allLocOption, ...matches];
      }
      return matches;
    }

    // When "All Cities" is selected: user can type to search across all Gujarat localities
    const allOption: LocalityOption = {
      name: 'All Areas (Across Gujarat)',
      cityName: 'All Cities',
      isAll: true,
    };

    if (!q || q === 'all' || q === 'all areas') {
      // Show top Gujarat localities as quick suggestions
      const popular = [
        { name: 'Bodakdev', cityName: 'Ahmedabad' },
        { name: 'SG Highway', cityName: 'Ahmedabad' },
        { name: 'Vesu', cityName: 'Surat' },
        { name: 'GIFT City', cityName: 'Gandhinagar' },
        { name: 'Gotri', cityName: 'Vadodara' },
        { name: 'Alkapuri', cityName: 'Vadodara' },
        { name: '150 Feet Ring Road', cityName: 'Rajkot' },
        { name: 'GIDC Industrial Estate', cityName: 'Ankleshwar' },
      ];
      return [allOption, ...popular];
    }

    // Search all localities across Gujarat
    const crossCityMatches: LocalityOption[] = [];
    GUJARAT_CITIES.forEach((c) => {
      c.localities.forEach((l) => {
        if (l.toLowerCase().includes(q) || `${l} ${c.name}`.toLowerCase().includes(q)) {
          crossCityMatches.push({ name: l, cityName: c.name });
        }
      });
    });

    if ('all areas'.includes(q)) {
      return [allOption, ...crossCityMatches];
    }
    return crossCityMatches;
  }, [city, localityInput]);

  // Click outside listener for typeaheads
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (localityRef.current && !localityRef.current.contains(e.target as Node)) {
        setIsLocalityOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectCity = (selectedCityName: string) => {
    setCity(selectedCityName);
    setCityInput(selectedCityName);
    setIsCityOpen(false);
    setHighlightedCityIndex(-1);

    // Reset locality
    setLocality('All Areas');
    setLocalityInput(selectedCityName === 'All Cities' ? 'All Areas' : `All Areas in ${selectedCityName}`);
  };

  const selectLocality = (item: LocalityOption) => {
    if (item.isAll) {
      setLocality('All Areas');
      setLocalityInput(city !== 'All Cities' && city !== 'All' ? `All Areas in ${city}` : 'All Areas');
    } else {
      setLocality(item.name);
      setLocalityInput(item.name);
      // If user picked a locality from another city in cross-city search, auto-switch the city!
      if (item.cityName !== 'All Cities' && item.cityName !== city) {
        setCity(item.cityName);
        setCityInput(item.cityName);
      }
    }
    setIsLocalityOpen(false);
    setHighlightedLocalityIndex(-1);
  };

  const propertyTypesByCategory: Record<string, string[]> = {
    Residential: [
      'Apartment / Flat',
      'Luxury Villa',
      'Penthouse',
      'Duplex House',
      'Residential Plot',
      'Weekend Farmhouse',
    ],
    Commercial: [
      'Office Space',
      'Retail Shop',
      'Showroom',
      'Commercial Building',
      'Co-working Space',
      'Commercial Plot',
    ],
    Industrial: [
      'Industrial Land',
      'Factory Shed',
      'Warehouse & Logistics',
      'Industrial Shed',
      'Manufacturing Unit',
      'Workshop',
      'Industrial Park',
    ],
  };

  const currentPropertyTypes = category !== 'All' && propertyTypesByCategory[category]
    ? propertyTypesByCategory[category]
    : [
        ...propertyTypesByCategory.Residential,
        ...propertyTypesByCategory.Commercial,
        ...propertyTypesByCategory.Industrial,
      ];

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const finalMin = useCustomBudget && customMinInput ? Number(customMinInput) : minBudget;
    const finalMax = useCustomBudget && customMaxInput ? Number(customMaxInput) : maxBudget;

    onSearch({
      state: 'Gujarat',
      city: city === 'All Cities' ? 'All' : city,
      locality: locality === 'All Areas' || locality.startsWith('All Areas') ? 'All' : locality,
      category,
      transactionType,
      propertyType,
      minBudget: finalMin,
      maxBudget: finalMax,
      searchQuery,
    });
  };

  const handleReset = () => {
    setCity('All Cities');
    setCityInput('All Cities');
    setLocality('All Areas');
    setLocalityInput('All Areas');
    setCategory('All');
    setTransactionType('All');
    setPropertyType('All');
    setMinBudget(null);
    setMaxBudget(null);
    setCustomMinInput('');
    setCustomMaxInput('');
    setUseCustomBudget(false);
    setSearchQuery('');
    onClear();
  };

  return (
    <div id="property-search-section" className="w-full bg-[#17211D] text-[#F4F0E7] rounded-2xl p-6 sm:p-8 shadow-2xl border border-[#23312C]">
      
      {/* State badge & Section title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#23312C]">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C8D6B0] mb-1">
            <span className="w-2 h-2 rounded-full bg-[#B87952]"></span>
            <span>Gujarat Geographic Engine</span>
            <span>·</span>
            <span>Fast Autocomplete Enabled</span>
          </div>
          <h2 className="font-heading text-xl sm:text-2xl font-bold tracking-tight text-[#F4F0E7]">
            Find Verified Gujarat Properties
          </h2>
        </div>

        {/* State fixed selector (Gujarat Only) */}
        <div className="flex items-center gap-2 self-start sm:self-auto bg-[#23312C] px-3.5 py-1.5 rounded-lg border border-[#33463f] text-xs">
          <MapPin className="w-4 h-4 text-[#C8D6B0]" />
          <span className="text-[#F4F0E7]/60">State:</span>
          <span className="font-bold text-[#C8D6B0] uppercase tracking-wide">Gujarat (Exclusive)</span>
          <CheckCircle2 className="w-3.5 h-3.5 text-[#C8D6B0]" />
        </div>
      </div>

      <form onSubmit={handleSearchSubmit} className="mt-6 space-y-5">
        
        {/* Row 1: Keyword, City Autocomplete, Locality Autocomplete */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Keyword Search */}
          <div>
            <label className="block text-xs font-medium text-[#C8D6B0] mb-1.5">
              Search Keywords
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="e.g. Bodakdev Villa, GIDC Shed, GIFT City..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-3 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] placeholder-[#F4F0E7]/40 focus:outline-none focus:border-[#B87952] transition-colors"
              />
            </div>
          </div>

          {/* City Autocomplete / Typeahead */}
          <div ref={cityRef} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#C8D6B0]">
                Select Gujarat City
              </label>
              {city !== 'All Cities' && (
                <button
                  type="button"
                  onClick={() => selectCity('All Cities')}
                  className="text-[10px] text-[#C8D6B0] hover:text-[#DE9F7B] transition-colors underline"
                >
                  Reset to All Cities
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                role="combobox"
                aria-expanded={isCityOpen}
                aria-autocomplete="list"
                value={cityInput}
                onFocus={() => {
                  setIsCityOpen(true);
                  if (cityInput === 'All Cities') setCityInput('');
                }}
                onChange={(e) => {
                  setCityInput(e.target.value);
                  setIsCityOpen(true);
                  setHighlightedCityIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (!isCityOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    setIsCityOpen(true);
                    return;
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedCityIndex((prev) =>
                      prev < filteredCities.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedCityIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredCities.length - 1
                    );
                  } else if (e.key === 'Enter') {
                    if (isCityOpen && highlightedCityIndex >= 0 && highlightedCityIndex < filteredCities.length) {
                      e.preventDefault();
                      selectCity(filteredCities[highlightedCityIndex].name);
                    }
                  } else if (e.key === 'Escape') {
                    setIsCityOpen(false);
                  }
                }}
                placeholder="Type Gujarat city (e.g. Surat, Ahmedabad)..."
                className="w-full pl-3 pr-9 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] placeholder-[#F4F0E7]/40 focus:outline-none focus:border-[#B87952] transition-colors"
              />

              <div className="absolute right-2.5 top-3 flex items-center gap-1">
                {cityInput && cityInput !== 'All Cities' && (
                  <button
                    type="button"
                    onClick={() => selectCity('All Cities')}
                    className="p-0.5 text-[#F4F0E7]/50 hover:text-[#F4F0E7] transition-colors"
                    title="Clear city"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#C8D6B0] transition-transform duration-200 cursor-pointer ${
                    isCityOpen ? 'rotate-180' : ''
                  }`}
                  onClick={() => setIsCityOpen(!isCityOpen)}
                />
              </div>
            </div>

            {/* City Dropdown Menu */}
            {isCityOpen && (
              <div 
                className="absolute left-0 right-0 mt-1.5 bg-[#1e2a25] border border-[#33463f] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1 text-xs"
                role="listbox"
              >
                {filteredCities.length === 0 ? (
                  <div className="px-3.5 py-3 text-slate-400 text-center">
                    No matching Gujarat city. (Gujarat only)
                  </div>
                ) : (
                  filteredCities.map((c, idx) => {
                    const isSelected = city.toLowerCase() === c.name.toLowerCase();
                    const isHighlighted = highlightedCityIndex === idx;

                    return (
                      <button
                        key={c.name}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => selectCity(c.name)}
                        className={`w-full px-3.5 py-2.5 text-left flex items-center justify-between transition-colors ${
                          isHighlighted
                            ? 'bg-[#2b3d36] text-[#C8D6B0]'
                            : isSelected
                            ? 'bg-[#25352e] text-[#DE9F7B] font-semibold'
                            : 'text-[#F4F0E7] hover:bg-[#25352e] hover:text-[#C8D6B0]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <MapPin className="w-3.5 h-3.5 text-[#B87952] shrink-0" />
                          <span className="truncate">{c.name}</span>
                          {c.name !== 'All Cities' && (
                            <span className="text-[10px] text-slate-400">
                              ({c.localities.length} areas)
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#DE9F7B] shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Locality Autocomplete / Typeahead */}
          <div ref={localityRef} className="relative">
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-medium text-[#C8D6B0]">
                Locality / Area {city !== 'All Cities' ? `in ${city}` : '(All Gujarat)'}
              </label>
              {locality !== 'All Areas' && (
                <button
                  type="button"
                  onClick={() => selectLocality({ name: 'All Areas', cityName: city, isAll: true })}
                  className="text-[10px] text-[#C8D6B0] hover:text-[#DE9F7B] transition-colors underline"
                >
                  All Areas
                </button>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                role="combobox"
                aria-expanded={isLocalityOpen}
                aria-autocomplete="list"
                value={localityInput}
                onFocus={() => {
                  setIsLocalityOpen(true);
                  if (localityInput.startsWith('All Areas')) setLocalityInput('');
                }}
                onChange={(e) => {
                  setLocalityInput(e.target.value);
                  setIsLocalityOpen(true);
                  setHighlightedLocalityIndex(-1);
                }}
                onKeyDown={(e) => {
                  if (!isLocalityOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
                    setIsLocalityOpen(true);
                    return;
                  }
                  if (e.key === 'ArrowDown') {
                    e.preventDefault();
                    setHighlightedLocalityIndex((prev) =>
                      prev < filteredLocalities.length - 1 ? prev + 1 : 0
                    );
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault();
                    setHighlightedLocalityIndex((prev) =>
                      prev > 0 ? prev - 1 : filteredLocalities.length - 1
                    );
                  } else if (e.key === 'Enter') {
                    if (isLocalityOpen && highlightedLocalityIndex >= 0 && highlightedLocalityIndex < filteredLocalities.length) {
                      e.preventDefault();
                      selectLocality(filteredLocalities[highlightedLocalityIndex]);
                    }
                  } else if (e.key === 'Escape') {
                    setIsLocalityOpen(false);
                  }
                }}
                placeholder={
                  city !== 'All Cities'
                    ? `Type locality in ${city} (e.g. Vesu, Bodakdev)...`
                    : 'Type locality anywhere in Gujarat...'
                }
                className="w-full pl-3 pr-9 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] placeholder-[#F4F0E7]/40 focus:outline-none focus:border-[#B87952] transition-colors"
              />

              <div className="absolute right-2.5 top-3 flex items-center gap-1">
                {localityInput && !localityInput.startsWith('All Areas') && (
                  <button
                    type="button"
                    onClick={() => selectLocality({ name: 'All Areas', cityName: city, isAll: true })}
                    className="p-0.5 text-[#F4F0E7]/50 hover:text-[#F4F0E7] transition-colors"
                    title="Clear locality"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <ChevronDown
                  className={`w-4 h-4 text-[#C8D6B0] transition-transform duration-200 cursor-pointer ${
                    isLocalityOpen ? 'rotate-180' : ''
                  }`}
                  onClick={() => setIsLocalityOpen(!isLocalityOpen)}
                />
              </div>
            </div>

            {/* Locality Dropdown Menu */}
            {isLocalityOpen && (
              <div 
                className="absolute left-0 right-0 mt-1.5 bg-[#1e2a25] border border-[#33463f] rounded-xl shadow-2xl max-h-60 overflow-y-auto z-50 py-1 text-xs"
                role="listbox"
              >
                {filteredLocalities.length === 0 ? (
                  <div className="px-3.5 py-3 text-slate-400 text-center">
                    No matching locality found in {city === 'All Cities' ? 'Gujarat' : city}.
                  </div>
                ) : (
                  filteredLocalities.map((item, idx) => {
                    const isSelected =
                      (item.isAll && (locality === 'All Areas' || locality.startsWith('All Areas'))) ||
                      locality.toLowerCase() === item.name.toLowerCase();
                    const isHighlighted = highlightedLocalityIndex === idx;

                    return (
                      <button
                        key={`${item.cityName}-${item.name}`}
                        type="button"
                        role="option"
                        aria-selected={isSelected}
                        onClick={() => selectLocality(item)}
                        className={`w-full px-3.5 py-2 text-left flex items-center justify-between transition-colors ${
                          isHighlighted
                            ? 'bg-[#2b3d36] text-[#C8D6B0]'
                            : isSelected
                            ? 'bg-[#25352e] text-[#DE9F7B] font-semibold'
                            : 'text-[#F4F0E7] hover:bg-[#25352e] hover:text-[#C8D6B0]'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#B87952] shrink-0" />
                          <span className="truncate">{item.name}</span>
                          {!item.isAll && city === 'All Cities' && (
                            <span className="text-[10px] text-[#C8D6B0]/70 shrink-0">
                              · {item.cityName}
                            </span>
                          )}
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-[#DE9F7B] shrink-0" />}
                      </button>
                    );
                  })
                )}
              </div>
            )}
          </div>

        </div>

        {/* Row 2: Category, Transaction, Property Type */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-[#C8D6B0] mb-1.5">
              Property Category
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPropertyType('All');
              }}
              className="w-full px-3 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952] transition-colors"
            >
              <option value="All">All Categories (Residential / Commercial / Industrial)</option>
              <option value="Residential">Residential Real Estate</option>
              <option value="Commercial">Commercial Real Estate</option>
              <option value="Industrial">Industrial Real Estate</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div>
            <label className="block text-xs font-medium text-[#C8D6B0] mb-1.5">
              Transaction Type
            </label>
            <select
              value={transactionType}
              onChange={(e) => setTransactionType(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952] transition-colors"
            >
              <option value="All">Buy or Rent</option>
              <option value="Buy">Buy (Outright Sale)</option>
              <option value="Rent">Rent (Lease)</option>
            </select>
          </div>

          {/* Property Type */}
          <div>
            <label className="block text-xs font-medium text-[#C8D6B0] mb-1.5">
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3 py-2.5 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952] transition-colors"
            >
              <option value="All">All Types</option>
              {Array.from(new Set(currentPropertyTypes)).map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 3: Budget Range in INR */}
        <div className="bg-[#1c2924] p-4 rounded-xl border border-[#2a3c35]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#C8D6B0]">
              <IndianRupee className="w-3.5 h-3.5 text-[#B87952]" />
              <span>Budget Range (INR)</span>
            </div>
            <button
              type="button"
              onClick={() => setUseCustomBudget(!useCustomBudget)}
              className="text-xs text-[#DE9F7B] hover:text-[#B87952] underline transition-colors"
            >
              {useCustomBudget ? 'Switch to Preset Budgets' : 'Enter Custom Rupee Amount'}
            </button>
          </div>

          {useCustomBudget ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#F4F0E7]/70 mb-1">Min Budget (in ₹ Rupees)</label>
                <input
                  type="number"
                  placeholder="e.g. 2500000 (₹25 Lakh)"
                  value={customMinInput}
                  onChange={(e) => setCustomMinInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#F4F0E7]/70 mb-1">Max Budget (in ₹ Rupees)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000000 (₹5 Crore)"
                  value={customMaxInput}
                  onChange={(e) => setCustomMaxInput(e.target.value)}
                  className="w-full px-3 py-2 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952]"
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-[#F4F0E7]/70 mb-1">Min Budget</label>
                <select
                  value={minBudget !== null ? minBudget : ''}
                  onChange={(e) => setMinBudget(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952]"
                >
                  <option value="">No Minimum</option>
                  {BUDGET_OPTIONS.filter((b) => b.value !== null).map((opt) => (
                    <option key={opt.label} value={opt.value!}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-[#F4F0E7]/70 mb-1">Max Budget</label>
                <select
                  value={maxBudget !== null ? maxBudget : ''}
                  onChange={(e) => setMaxBudget(e.target.value ? Number(e.target.value) : null)}
                  className="w-full px-3 py-2 bg-[#23312C] border border-[#33463f] rounded-lg text-sm text-[#F4F0E7] focus:outline-none focus:border-[#B87952]"
                >
                  <option value="">No Maximum</option>
                  {BUDGET_OPTIONS.filter((b) => b.value !== null).map((opt) => (
                    <option key={opt.label} value={opt.value!}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Row 4: Professional Action CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-3">
          {/* Secondary CTA: Clear Filters */}
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 rounded-lg border border-[#33463f] bg-[#23312C] hover:bg-[#2b3d36] text-[#F4F0E7] text-sm font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap focus:outline-none"
          >
            <RotateCcw className="w-4 h-4 text-[#C8D6B0]" />
            Clear Filters
          </button>

          {/* Primary CTA: Search Properties */}
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-2.5 rounded-lg bg-[#B87952] hover:bg-[#9E6340] text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 shadow-lg whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#B87952] focus:ring-offset-2 focus:ring-offset-[#17211D]"
          >
            <Search className="w-4 h-4" />
            Search Properties
          </button>
        </div>

      </form>
    </div>
  );
};
