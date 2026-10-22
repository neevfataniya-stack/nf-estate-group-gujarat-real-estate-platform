export type PropertyCategory = 'Residential' | 'Commercial' | 'Industrial';

export type TransactionType = 'Buy' | 'Rent';

export type ResidentialType = 
  | 'Apartment / Flat'
  | 'Luxury Villa'
  | 'Penthouse'
  | 'Duplex House'
  | 'Residential Plot'
  | 'Weekend Farmhouse';

export type CommercialType = 
  | 'Office Space'
  | 'Retail Shop'
  | 'Showroom'
  | 'Commercial Building'
  | 'Co-working Space'
  | 'Commercial Plot';

export type IndustrialType = 
  | 'Industrial Land'
  | 'Factory Shed'
  | 'Warehouse & Logistics'
  | 'Industrial Shed'
  | 'Manufacturing Unit'
  | 'Workshop'
  | 'Industrial Park';

export type PropertyType = ResidentialType | CommercialType | IndustrialType;

export type EnquiryStatus = 'New' | 'Contacted' | 'Visit Scheduled' | 'Closed' | 'Not Interested';

export interface Property {
  id: string;
  title: string;
  category: PropertyCategory;
  propertyType: string;
  transactionType: TransactionType;
  price: number; // in INR
  priceDisplay: string; // e.g. "₹1.45 Cr" or "₹85,000 / mo"
  state: 'Gujarat';
  city: string;
  locality: string;
  address: string;
  sizeSqFt: number;
  bedrooms?: number;
  bathrooms?: number;
  description: string;
  amenities: string[];
  imageUrl: string;
  isVerified: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'customer' | 'admin';
  createdAt: string;
}

export interface Enquiry {
  id: string; // e.g. NF-ENQ-2026-1001
  userId: string;
  customerName: string;
  email: string;
  phone: string;
  state: 'Gujarat';
  city: string;
  locality: string;
  category: PropertyCategory;
  propertyType: string;
  transactionType: TransactionType;
  minBudget: number;
  maxBudget: number;
  selectedPropertyId?: string;
  selectedPropertyTitle?: string;
  message: string;
  preferredContactMethod: 'Phone Call' | 'WhatsApp' | 'Email';
  consentGiven: boolean;
  status: EnquiryStatus;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SiteVisitRequest {
  id: string; // e.g. NF-VISIT-2026-2001
  userId: string;
  propertyId: string;
  propertyTitle: string;
  customerName: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTimeSlot: 'Morning (10 AM - 1 PM)' | 'Afternoon (1 PM - 4 PM)' | 'Evening (4 PM - 7 PM)';
  notes?: string;
  status: 'Pending Confirmation' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdAt: string;
}

export interface SellerSubmission {
  id: string; // e.g. NF-SELL-2026-3001
  ownerName: string;
  email: string;
  phone: string;
  state: 'Gujarat';
  city: string;
  locality: string;
  category: PropertyCategory;
  propertyType: string;
  transactionType: TransactionType;
  expectedPrice: string;
  areaSqFt: string;
  propertyAddress: string;
  description: string;
  status: 'Under Review' | 'Verified' | 'Listed' | 'Rejected';
  createdAt: string;
}

export interface SearchFilterState {
  state: 'Gujarat';
  city: string;
  locality: string;
  category: string; // 'All' | PropertyCategory
  transactionType: string; // 'All' | TransactionType
  propertyType: string; // 'All' | string
  minBudget: number | null;
  maxBudget: number | null;
  searchQuery: string;
}

export interface AdminStats {
  totalEnquiries: number;
  newEnquiries: number;
  contactedEnquiries: number;
  siteVisitRequests: number;
  closedEnquiries: number;
  totalListings: number;
  activeListings: number;
}
