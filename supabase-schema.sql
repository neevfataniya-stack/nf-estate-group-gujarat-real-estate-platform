-- =========================================================================
-- NF ESTATE GROUP — PostgreSQL & Supabase Database Migration Schema
-- Gujarat's Premier Real Estate Platform
-- Tagline: "Your Future. Our Foundation."
-- =========================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Linked with Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by self and admins" 
ON public.profiles FOR SELECT 
USING (auth.uid() = id OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id);

-- 2. PROPERTIES TABLE (Gujarat Real Estate Inventory)
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Residential', 'Commercial', 'Industrial')),
  property_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Buy', 'Rent')),
  price BIGINT NOT NULL,
  price_display TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Gujarat' CHECK (state = 'Gujarat'),
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  address TEXT NOT NULL,
  size_sq_ft INTEGER NOT NULL,
  bedrooms INTEGER,
  bathrooms INTEGER,
  description TEXT NOT NULL,
  amenities TEXT[] DEFAULT '{}',
  image_url TEXT NOT NULL,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on properties
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Anyone can read active properties
CREATE POLICY "Anyone can view active properties" 
ON public.properties FOR SELECT 
USING (is_active = true OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Only admins can create, update, or delete properties
CREATE POLICY "Admins can manage properties" 
ON public.properties FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 3. ENQUIRIES TABLE
CREATE TABLE IF NOT EXISTS public.enquiries (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Gujarat' CHECK (state = 'Gujarat'),
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Residential', 'Commercial', 'Industrial')),
  property_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Buy', 'Rent')),
  min_budget BIGINT NOT NULL DEFAULT 0,
  max_budget BIGINT NOT NULL DEFAULT 0,
  selected_property_id TEXT REFERENCES public.properties(id) ON DELETE SET NULL,
  selected_property_title TEXT,
  message TEXT NOT NULL,
  preferred_contact_method TEXT NOT NULL CHECK (preferred_contact_method IN ('Phone Call', 'WhatsApp', 'Email')),
  consent_given BOOLEAN NOT NULL DEFAULT true,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Visit Scheduled', 'Closed', 'Not Interested')),
  internal_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable RLS on enquiries
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Customers can view only their own enquiries
CREATE POLICY "Users can view own enquiries" 
ON public.enquiries FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Authenticated customers can insert enquiries
CREATE POLICY "Authenticated users can submit enquiries" 
ON public.enquiries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can update enquiries (status, internal notes)
CREATE POLICY "Admins can update enquiries" 
ON public.enquiries FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 4. SITE VISITS TABLE
CREATE TABLE IF NOT EXISTS public.site_visits (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  property_title TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL,
  preferred_time_slot TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Confirmation',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own site visits" 
ON public.site_visits FOR SELECT 
USING (auth.uid() = user_id OR EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "Users can request site visits" 
ON public.site_visits FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage site visits" 
ON public.site_visits FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 5. SELLER SUBMISSIONS TABLE ("Have a Property to List?")
CREATE TABLE IF NOT EXISTS public.seller_submissions (
  id TEXT PRIMARY KEY,
  owner_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'Gujarat' CHECK (state = 'Gujarat'),
  city TEXT NOT NULL,
  locality TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Residential', 'Commercial', 'Industrial')),
  property_type TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('Buy', 'Rent')),
  expected_price TEXT NOT NULL,
  area_sq_ft TEXT NOT NULL,
  property_address TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'Under Review' CHECK (status IN ('Under Review', 'Verified', 'Listed', 'Rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.seller_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage seller submissions" 
ON public.seller_submissions FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
));

-- 6. SAVED PROPERTIES (Wishlist)
CREATE TABLE IF NOT EXISTS public.saved_properties (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  property_id TEXT REFERENCES public.properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  PRIMARY KEY (user_id, property_id)
);

ALTER TABLE public.saved_properties ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage saved properties" 
ON public.saved_properties FOR ALL 
USING (auth.uid() = user_id);

-- INDEXES for lightning-fast queries across Gujarat locations & budgets
CREATE INDEX IF NOT EXISTS idx_properties_city_locality ON public.properties(city, locality);
CREATE INDEX IF NOT EXISTS idx_properties_category ON public.properties(category);
CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
CREATE INDEX IF NOT EXISTS idx_enquiries_status ON public.enquiries(status);
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries(user_id);
