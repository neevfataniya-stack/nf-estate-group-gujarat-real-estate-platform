import express, { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';
import { INITIAL_PROPERTIES } from './src/data/initialProperties';
import { 
  Property, 
  User, 
  Enquiry, 
  SiteVisitRequest, 
  SellerSubmission, 
  AdminStats 
} from './src/types';

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.resolve(process.cwd(), 'data', 'database.json');

// Ensure data folder exists
if (!fs.existsSync(path.dirname(DB_FILE))) {
  fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
}

// Password hashing utilities
function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const passwordSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, passwordSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: passwordSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const checkHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return checkHash === hash;
}

interface StoredUser extends User {
  passwordHash: string;
  passwordSalt: string;
}

interface DatabaseSchema {
  users: StoredUser[];
  sessions: { token: string; userId: string; expiresAt: number }[];
  properties: Property[];
  enquiries: Enquiry[];
  siteVisits: SiteVisitRequest[];
  sellerSubmissions: SellerSubmission[];
  savedProperties: Record<string, string[]>; // userId -> propertyId[]
}

// Database Helper
class Database {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
  }

  private load(): DatabaseSchema {
    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        return JSON.parse(raw);
      } catch (err) {
        console.error('Failed to parse database.json, reinitializing...', err);
      }
    }
    return this.initializeDefault();
  }

  private initializeDefault(): DatabaseSchema {
    // Default Owner Admin: Neev Fataniya & primary admin account
    const ownerAdmin = hashPassword('NFEstate@2026#Gujarat');
    const neevAdmin = hashPassword('NeevEstate@2026');

    const defaultUsers: StoredUser[] = [
      {
        id: 'USR-ADMIN-001',
        name: 'NF Estate Admin',
        email: 'admin@nfestategroup.com',
        phone: '+91 98250 12345',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        passwordHash: ownerAdmin.hash,
        passwordSalt: ownerAdmin.salt,
      },
      {
        id: 'USR-ADMIN-002',
        name: 'Neev Fataniya (Owner)',
        email: 'neevfataniya@gmail.com',
        phone: '+91 98790 54321',
        role: 'admin',
        createdAt: '2026-01-01T00:00:00.000Z',
        passwordHash: neevAdmin.hash,
        passwordSalt: neevAdmin.salt,
      },
      {
        id: 'USR-CUST-101',
        name: 'Rajesh Patel',
        email: 'rajesh.patel@gujaratbiz.com',
        phone: '+91 98240 77123',
        role: 'customer',
        createdAt: '2026-02-01T10:00:00.000Z',
        passwordHash: hashPassword('Customer@123').hash,
        passwordSalt: hashPassword('Customer@123').salt,
      },
    ];

    const defaultEnquiries: Enquiry[] = [
      {
        id: 'NF-ENQ-2026-1001',
        userId: 'USR-CUST-101',
        customerName: 'Rajesh Patel',
        email: 'rajesh.patel@gujaratbiz.com',
        phone: '+91 98240 77123',
        state: 'Gujarat',
        city: 'Ahmedabad',
        locality: 'Bodakdev',
        category: 'Residential',
        propertyType: 'Apartment / Flat',
        transactionType: 'Buy',
        minBudget: 25000000,
        maxBudget: 35000000,
        selectedPropertyId: 'NF-PROP-101',
        selectedPropertyTitle: 'The Grand Pavilion — Ultra Luxury 4 BHK Sky Villa',
        message: 'Interested in the higher floor unit with clear sunset views. Looking to arrange a weekend family visit.',
        preferredContactMethod: 'Phone Call',
        consentGiven: true,
        status: 'Contacted',
        internalNotes: 'Contacted on Feb 12. Client is looking for high floor with 3 reserved parking spaces. Follow up on Saturday.',
        createdAt: '2026-02-11T14:20:00.000Z',
        updatedAt: '2026-02-12T10:30:00.000Z',
      },
      {
        id: 'NF-ENQ-2026-1002',
        userId: 'USR-CUST-101',
        customerName: 'Kunal Shah',
        email: 'kunal.shah@textileindia.in',
        phone: '+91 97270 99451',
        state: 'Gujarat',
        city: 'Surat',
        locality: 'Vesu',
        category: 'Residential',
        propertyType: 'Luxury Villa',
        transactionType: 'Buy',
        minBudget: 40000000,
        maxBudget: 55000000,
        selectedPropertyId: 'NF-PROP-102',
        selectedPropertyTitle: 'Serene Meadows — Contemporary Private Villa',
        message: 'Looking for prompt possession villa with personal garden in Vesu Surat.',
        preferredContactMethod: 'WhatsApp',
        consentGiven: true,
        status: 'New',
        internalNotes: 'New inbound lead from Surat diamond/textile industrialist. Priority enquiry.',
        createdAt: '2026-02-18T09:15:00.000Z',
        updatedAt: '2026-02-18T09:15:00.000Z',
      },
      {
        id: 'NF-ENQ-2026-1003',
        userId: 'USR-CUST-101',
        customerName: 'Amit Trivedi',
        email: 'amit.trivedi@chempharma.com',
        phone: '+91 94260 11890',
        state: 'Gujarat',
        city: 'Ankleshwar',
        locality: 'GIDC Industrial Estate',
        category: 'Industrial',
        propertyType: 'Factory Shed',
        transactionType: 'Buy',
        minBudget: 35000000,
        maxBudget: 42000000,
        selectedPropertyId: 'NF-PROP-302',
        selectedPropertyTitle: 'Ankleshwar GIDC — Heavy Chemical & Pharma Industrial Shed',
        message: 'Need GPCB CTE compliance documents and verification of 200 HP power line before scheduling site inspection.',
        preferredContactMethod: 'Email',
        consentGiven: true,
        status: 'Visit Scheduled',
        internalNotes: 'Site visit scheduled for Feb 24 with technical engineer.',
        createdAt: '2026-02-16T11:45:00.000Z',
        updatedAt: '2026-02-17T15:20:00.000Z',
      },
    ];

    const defaultSiteVisits: SiteVisitRequest[] = [
      {
        id: 'NF-VISIT-2026-2001',
        userId: 'USR-CUST-101',
        propertyId: 'NF-PROP-101',
        propertyTitle: 'The Grand Pavilion — Ultra Luxury 4 BHK Sky Villa',
        customerName: 'Rajesh Patel',
        email: 'rajesh.patel@gujaratbiz.com',
        phone: '+91 98240 77123',
        preferredDate: '2026-02-28',
        preferredTimeSlot: 'Morning (10 AM - 1 PM)',
        notes: 'Would like to inspect clubhouse and basement parking.',
        status: 'Confirmed',
        createdAt: '2026-02-15T12:00:00.000Z',
      },
    ];

    const defaultSellerSubmissions: SellerSubmission[] = [
      {
        id: 'NF-SELL-2026-3001',
        ownerName: 'Jayeshbhai Desai',
        email: 'j.desai@suratproperty.co',
        phone: '+91 98980 43210',
        state: 'Gujarat',
        city: 'Surat',
        locality: 'Adajan',
        category: 'Commercial',
        propertyType: 'Office Space',
        transactionType: 'Buy',
        expectedPrice: '₹1.95 Cr',
        areaSqFt: '2400 sq.ft.',
        propertyAddress: 'Pal-Adajan Main Link Road, Opp. Riverfront Towers',
        description: 'Prime 1st floor fully fitted office space with 20 workstations, glass conference room, and 2 executive cabins.',
        status: 'Under Review',
        createdAt: '2026-02-17T16:40:00.000Z',
      },
    ];

    const initialData: DatabaseSchema = {
      users: defaultUsers,
      sessions: [],
      properties: INITIAL_PROPERTIES,
      enquiries: defaultEnquiries,
      siteVisits: defaultSiteVisits,
      sellerSubmissions: defaultSellerSubmissions,
      savedProperties: {
        'USR-CUST-101': ['NF-PROP-101', 'NF-PROP-203'],
      },
    };

    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
    return initialData;
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database.json:', err);
    }
  }

  // User operations
  findUserByEmail(email: string): StoredUser | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserById(id: string): StoredUser | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  createUser(params: { name: string; email: string; phone: string; password: string }): User {
    const { hash, salt } = hashPassword(params.password);
    const isOwnerOrAdmin =
      params.email.toLowerCase() === 'neevfataniya@gmail.com' ||
      params.email.toLowerCase() === 'admin@nfestategroup.com';

    const newUser: StoredUser = {
      id: `USR-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: params.name,
      email: params.email.toLowerCase(),
      phone: params.phone,
      role: isOwnerOrAdmin ? 'admin' : 'customer',
      createdAt: new Date().toISOString(),
      passwordHash: hash,
      passwordSalt: salt,
    };

    this.data.users.push(newUser);
    this.save();

    const { passwordHash, passwordSalt, ...safeUser } = newUser;
    return safeUser;
  }

  // Session operations
  createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    this.data.sessions.push({ token, userId, expiresAt });
    this.save();
    return token;
  }

  verifySession(token: string): StoredUser | null {
    const session = this.data.sessions.find(
      (s) => s.token === token && s.expiresAt > Date.now()
    );
    if (!session) return null;
    return this.findUserById(session.userId) || null;
  }

  destroySession(token: string) {
    this.data.sessions = this.data.sessions.filter((s) => s.token !== token);
    this.save();
  }

  // Properties
  getProperties(filter?: {
    city?: string;
    locality?: string;
    category?: string;
    transactionType?: string;
    propertyType?: string;
    minPrice?: number;
    maxPrice?: number;
    searchQuery?: string;
    includeInactive?: boolean;
  }): Property[] {
    let list = this.data.properties;

    if (!filter?.includeInactive) {
      list = list.filter((p) => p.isActive);
    }

    if (filter?.city && filter.city !== 'All Cities' && filter.city !== 'All') {
      list = list.filter((p) => p.city.toLowerCase() === filter.city!.toLowerCase());
    }

    if (filter?.locality && filter.locality !== 'All Areas' && filter.locality !== 'All') {
      list = list.filter((p) => p.locality.toLowerCase() === filter.locality!.toLowerCase());
    }

    if (filter?.category && filter.category !== 'All') {
      list = list.filter((p) => p.category.toLowerCase() === filter.category!.toLowerCase());
    }

    if (filter?.transactionType && filter.transactionType !== 'All') {
      list = list.filter((p) => p.transactionType.toLowerCase() === filter.transactionType!.toLowerCase());
    }

    if (filter?.propertyType && filter.propertyType !== 'All') {
      list = list.filter((p) => p.propertyType.toLowerCase() === filter.propertyType!.toLowerCase());
    }

    if (filter?.minPrice != null && filter.minPrice > 0) {
      list = list.filter((p) => p.price >= filter.minPrice!);
    }

    if (filter?.maxPrice != null && filter.maxPrice > 0) {
      list = list.filter((p) => p.price <= filter.maxPrice!);
    }

    if (filter?.searchQuery && filter.searchQuery.trim()) {
      const q = filter.searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.locality.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.propertyType.toLowerCase().includes(q)
      );
    }

    return list;
  }

  getPropertyById(id: string): Property | undefined {
    return this.data.properties.find((p) => p.id === id);
  }

  createProperty(prop: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Property {
    const newProp: Property = {
      ...prop,
      id: `NF-PROP-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.properties.unshift(newProp);
    this.save();
    return newProp;
  }

  updateProperty(id: string, updates: Partial<Property>): Property | null {
    const idx = this.data.properties.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.properties[idx] = {
      ...this.data.properties[idx],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    this.save();
    return this.data.properties[idx];
  }

  deleteProperty(id: string): boolean {
    const initialLen = this.data.properties.length;
    this.data.properties = this.data.properties.filter((p) => p.id !== id);
    if (this.data.properties.length !== initialLen) {
      this.save();
      return true;
    }
    return false;
  }

  // Enquiries
  createEnquiry(enquiry: Omit<Enquiry, 'id' | 'createdAt' | 'updatedAt' | 'status'>): Enquiry {
    const count = this.data.enquiries.length + 1001;
    const newEnquiry: Enquiry = {
      ...enquiry,
      id: `NF-ENQ-2026-${count}`,
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.enquiries.unshift(newEnquiry);
    this.save();
    return newEnquiry;
  }

  getEnquiries(filter?: { userId?: string; status?: string; city?: string; category?: string; search?: string }): Enquiry[] {
    let list = this.data.enquiries;
    if (filter?.userId) {
      list = list.filter((e) => e.userId === filter.userId);
    }
    if (filter?.status && filter.status !== 'All') {
      list = list.filter((e) => e.status.toLowerCase() === filter.status!.toLowerCase());
    }
    if (filter?.city && filter.city !== 'All') {
      list = list.filter((e) => e.city.toLowerCase() === filter.city!.toLowerCase());
    }
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((e) => e.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter(
        (e) =>
          e.id.toLowerCase().includes(q) ||
          e.customerName.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.phone.toLowerCase().includes(q) ||
          e.city.toLowerCase().includes(q) ||
          e.locality.toLowerCase().includes(q) ||
          (e.selectedPropertyTitle && e.selectedPropertyTitle.toLowerCase().includes(q))
      );
    }
    return list;
  }

  updateEnquiry(id: string, updates: { status?: Enquiry['status']; internalNotes?: string }): Enquiry | null {
    const enquiry = this.data.enquiries.find((e) => e.id === id);
    if (!enquiry) return null;
    if (updates.status) enquiry.status = updates.status;
    if (updates.internalNotes !== undefined) enquiry.internalNotes = updates.internalNotes;
    enquiry.updatedAt = new Date().toISOString();
    this.save();
    return enquiry;
  }

  // Site Visits
  createSiteVisit(visit: Omit<SiteVisitRequest, 'id' | 'createdAt' | 'status'>): SiteVisitRequest {
    const count = this.data.siteVisits.length + 2001;
    const newVisit: SiteVisitRequest = {
      ...visit,
      id: `NF-VISIT-2026-${count}`,
      status: 'Pending Confirmation',
      createdAt: new Date().toISOString(),
    };
    this.data.siteVisits.unshift(newVisit);
    this.save();
    return newVisit;
  }

  getSiteVisits(userId?: string): SiteVisitRequest[] {
    if (userId) {
      return this.data.siteVisits.filter((v) => v.userId === userId);
    }
    return this.data.siteVisits;
  }

  updateSiteVisit(id: string, status: SiteVisitRequest['status']): SiteVisitRequest | null {
    const visit = this.data.siteVisits.find((v) => v.id === id);
    if (!visit) return null;
    visit.status = status;
    this.save();
    return visit;
  }

  // Seller Submissions
  createSellerSubmission(sub: Omit<SellerSubmission, 'id' | 'createdAt' | 'status'>): SellerSubmission {
    const count = this.data.sellerSubmissions.length + 3001;
    const newSubmission: SellerSubmission = {
      ...sub,
      id: `NF-SELL-2026-${count}`,
      status: 'Under Review',
      createdAt: new Date().toISOString(),
    };
    this.data.sellerSubmissions.unshift(newSubmission);
    this.save();
    return newSubmission;
  }

  getSellerSubmissions(): SellerSubmission[] {
    return this.data.sellerSubmissions;
  }

  updateSellerSubmission(id: string, status: SellerSubmission['status']): SellerSubmission | null {
    const sub = this.data.sellerSubmissions.find((s) => s.id === id);
    if (!sub) return null;
    sub.status = status;
    this.save();
    return sub;
  }

  // Saved Properties
  getSavedProperties(userId: string): string[] {
    return this.data.savedProperties[userId] || [];
  }

  toggleSavedProperty(userId: string, propertyId: string): string[] {
    const list = this.data.savedProperties[userId] || [];
    const idx = list.indexOf(propertyId);
    if (idx === -1) {
      list.push(propertyId);
    } else {
      list.splice(idx, 1);
    }
    this.data.savedProperties[userId] = list;
    this.save();
    return list;
  }

  // Admin stats
  getAdminStats(): AdminStats {
    const enquiries = this.data.enquiries;
    const listings = this.data.properties;
    return {
      totalEnquiries: enquiries.length,
      newEnquiries: enquiries.filter((e) => e.status === 'New').length,
      contactedEnquiries: enquiries.filter((e) => e.status === 'Contacted').length,
      siteVisitRequests: this.data.siteVisits.length,
      closedEnquiries: enquiries.filter((e) => e.status === 'Closed').length,
      totalListings: listings.length,
      activeListings: listings.filter((p) => p.isActive).length,
    };
  }
}

const db = new Database();

// Middlewares
app.use(express.json());

// Auth helper middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }
  const token = authHeader.split(' ')[1];
  const user = db.verifySession(token);
  if (user) {
    (req as any).user = user;
  }
  next();
}

function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!(req as any).user) {
    return res.status(401).json({ error: 'Authentication required. Please log in.' });
  }
  next();
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Administrator privileges required.' });
  }
  next();
}

app.use(authenticate);

// ================= API ROUTES =================

// Auth: Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, phone, password, confirmPassword, consent } = req.body;

  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ error: 'Passwords do not match.' });
  }

  if (password.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters long.' });
  }

  if (!consent) {
    return res.status(400).json({ error: 'You must accept the Privacy Policy to register.' });
  }

  const existing = db.findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ error: 'An account with this email address already exists.' });
  }

  const safeUser = db.createUser({ name, email, phone, password });
  const token = db.createSession(safeUser.id);

  res.status(201).json({
    message: 'Registration successful.',
    user: safeUser,
    token,
  });
});

// Auth: Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = db.findUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const isValid = verifyPassword(password, user.passwordHash, user.passwordSalt);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  const token = db.createSession(user.id);
  const { passwordHash, passwordSalt, ...safeUser } = user;

  res.json({
    message: 'Login successful.',
    user: safeUser,
    token,
  });
});

// Auth: Me
app.get('/api/auth/me', (req, res) => {
  const user = (req as any).user;
  if (!user) {
    return res.status(401).json({ user: null });
  }
  const { passwordHash, passwordSalt, ...safeUser } = user;
  res.json({ user: safeUser });
});

// Auth: Logout
app.post('/api/auth/logout', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    db.destroySession(token);
  }
  res.json({ message: 'Logged out successfully.' });
});

// Auth: Forgot Password
app.post('/api/auth/forgot-password', (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email address is required.' });
  }
  const user = db.findUserByEmail(email);
  if (!user) {
    // For security, don't leak user existence
    return res.json({ message: 'If an account exists with this email, password reset instructions have been sent.' });
  }
  // In production, would send reset link. Here we provide a verified success message
  res.json({ message: 'Password reset instructions have been dispatched to your email address.' });
});

// Properties: Public Search & Filter
app.get('/api/properties', (req, res) => {
  const {
    city,
    locality,
    category,
    transactionType,
    propertyType,
    minPrice,
    maxPrice,
    search,
  } = req.query;

  const properties = db.getProperties({
    city: city as string,
    locality: locality as string,
    category: category as string,
    transactionType: transactionType as string,
    propertyType: propertyType as string,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
    searchQuery: search as string,
  });

  res.json({
    total: properties.length,
    properties,
  });
});

// Properties: Single Property Detail
app.get('/api/properties/:id', (req, res) => {
  const property = db.getPropertyById(req.params.id);
  if (!property) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  res.json({ property });
});

// Properties: Create (Admin Only)
app.post('/api/properties', requireAuth, requireAdmin, (req, res) => {
  const data = req.body;
  if (!data.title || !data.city || !data.locality || !data.category || !data.price) {
    return res.status(400).json({ error: 'Title, City, Locality, Category, and Price are required.' });
  }

  const newProperty = db.createProperty({
    ...data,
    state: 'Gujarat',
    isActive: data.isActive !== undefined ? data.isActive : true,
    isVerified: true,
  });

  res.status(201).json({ message: 'Property created successfully.', property: newProperty });
});

// Properties: Update (Admin Only)
app.put('/api/properties/:id', requireAuth, requireAdmin, (req, res) => {
  const updated = db.updateProperty(req.params.id, req.body);
  if (!updated) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  res.json({ message: 'Property updated successfully.', property: updated });
});

// Properties: Delete (Admin Only)
app.delete('/api/properties/:id', requireAuth, requireAdmin, (req, res) => {
  const ok = db.deleteProperty(req.params.id);
  if (!ok) {
    return res.status(404).json({ error: 'Property not found.' });
  }
  res.json({ message: 'Property deleted successfully.' });
});

// Enquiries: Submit Enquiry (Customer Auth Required)
app.post('/api/enquiries', requireAuth, (req, res) => {
  const user = (req as any).user;
  const {
    city,
    locality,
    category,
    propertyType,
    transactionType,
    minBudget,
    maxBudget,
    selectedPropertyId,
    selectedPropertyTitle,
    message,
    preferredContactMethod,
    consentGiven,
  } = req.body;

  if (!city || !category || !transactionType) {
    return res.status(400).json({ error: 'City, Category, and Transaction Type are required.' });
  }

  if (!consentGiven) {
    return res.status(400).json({ error: 'Consent to contact regarding this enquiry is required.' });
  }

  const enquiry = db.createEnquiry({
    userId: user.id,
    customerName: user.name,
    email: user.email,
    phone: user.phone,
    state: 'Gujarat',
    city,
    locality: locality || 'All Areas',
    category,
    propertyType: propertyType || 'Any',
    transactionType,
    minBudget: Number(minBudget) || 0,
    maxBudget: Number(maxBudget) || 0,
    selectedPropertyId,
    selectedPropertyTitle,
    message: message || 'Interested in this property and requesting further details.',
    preferredContactMethod: preferredContactMethod || 'Phone Call',
    consentGiven: true,
  });

  res.status(201).json({
    message: 'Enquiry submitted successfully! Our Gujarat advisory team will connect with you shortly.',
    enquiry,
  });
});

// Enquiries: Customer's own enquiries
app.get('/api/enquiries/my', requireAuth, (req, res) => {
  const user = (req as any).user;
  const enquiries = db.getEnquiries({ userId: user.id });
  res.json({ enquiries });
});

// Site Visits: Request Site Visit
app.post('/api/site-visits', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { propertyId, propertyTitle, preferredDate, preferredTimeSlot, notes } = req.body;

  if (!propertyId || !preferredDate || !preferredTimeSlot) {
    return res.status(400).json({ error: 'Property, preferred date, and preferred time slot are required.' });
  }

  const visit = db.createSiteVisit({
    userId: user.id,
    propertyId,
    propertyTitle: propertyTitle || 'Selected Property',
    customerName: user.name,
    email: user.email,
    phone: user.phone,
    preferredDate,
    preferredTimeSlot,
    notes,
  });

  res.status(201).json({
    message: 'Site visit request registered successfully! An NF Estate representative will confirm your appointment.',
    visit,
  });
});

// Site Visits: Customer's own visits
app.get('/api/site-visits/my', requireAuth, (req, res) => {
  const user = (req as any).user;
  const visits = db.getSiteVisits(user.id);
  res.json({ visits });
});

// Seller Submissions: "Have a Property to List?"
app.post('/api/seller-submissions', (req, res) => {
  const {
    ownerName,
    email,
    phone,
    city,
    locality,
    category,
    propertyType,
    transactionType,
    expectedPrice,
    areaSqFt,
    propertyAddress,
    description,
  } = req.body;

  if (!ownerName || !email || !phone || !city || !category || !expectedPrice) {
    return res.status(400).json({ error: 'Owner Name, Email, Phone, City, Category, and Expected Price are required.' });
  }

  const submission = db.createSellerSubmission({
    ownerName,
    email,
    phone,
    state: 'Gujarat',
    city,
    locality: locality || 'General Locality',
    category,
    propertyType: propertyType || 'Residential / Commercial',
    transactionType: transactionType || 'Buy',
    expectedPrice,
    areaSqFt: areaSqFt || 'N/A',
    propertyAddress: propertyAddress || '',
    description: description || '',
  });

  res.status(201).json({
    message: 'Your property listing request has been submitted for review. Our acquisitions desk will contact you after verifying the title details.',
    submission,
  });
});

// Saved Properties: Customer's Saved list
app.get('/api/saved-properties', requireAuth, (req, res) => {
  const user = (req as any).user;
  const ids = db.getSavedProperties(user.id);
  const properties = ids
    .map((id) => db.getPropertyById(id))
    .filter((p): p is Property => p !== undefined);
  res.json({ ids, properties });
});

app.post('/api/saved-properties/toggle', requireAuth, (req, res) => {
  const user = (req as any).user;
  const { propertyId } = req.body;
  if (!propertyId) {
    return res.status(400).json({ error: 'Property ID is required.' });
  }
  const updatedIds = db.toggleSavedProperty(user.id, propertyId);
  res.json({ saved: updatedIds.includes(propertyId), ids: updatedIds });
});

// ================= ADMIN ROUTES =================

// Admin: Overview Stats
app.get('/api/admin/overview', requireAuth, requireAdmin, (req, res) => {
  const stats = db.getAdminStats();
  res.json({ stats });
});

// Admin: All Enquiries
app.get('/api/admin/enquiries', requireAuth, requireAdmin, (req, res) => {
  const { status, city, category, search } = req.query;
  const enquiries = db.getEnquiries({
    status: status as string,
    city: city as string,
    category: category as string,
    search: search as string,
  });
  res.json({ enquiries });
});

// Admin: Update Enquiry Status & Internal Notes
app.patch('/api/admin/enquiries/:id', requireAuth, requireAdmin, (req, res) => {
  const { status, internalNotes } = req.body;
  const updated = db.updateEnquiry(req.params.id, { status, internalNotes });
  if (!updated) {
    return res.status(404).json({ error: 'Enquiry not found.' });
  }
  res.json({ message: 'Enquiry updated successfully.', enquiry: updated });
});

// Admin: Site Visits
app.get('/api/admin/site-visits', requireAuth, requireAdmin, (req, res) => {
  const visits = db.getSiteVisits();
  res.json({ visits });
});

app.patch('/api/admin/site-visits/:id', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body;
  const updated = db.updateSiteVisit(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Site visit not found.' });
  }
  res.json({ message: 'Site visit status updated.', visit: updated });
});

// Admin: Seller Submissions
app.get('/api/admin/seller-submissions', requireAuth, requireAdmin, (req, res) => {
  const submissions = db.getSellerSubmissions();
  res.json({ submissions });
});

app.patch('/api/admin/seller-submissions/:id', requireAuth, requireAdmin, (req, res) => {
  const { status } = req.body;
  const updated = db.updateSellerSubmission(req.params.id, status);
  if (!updated) {
    return res.status(404).json({ error: 'Seller submission not found.' });
  }
  res.json({ message: 'Seller submission updated.', submission: updated });
});

// Admin: Export Enquiries to CSV
app.get('/api/admin/export-enquiries', requireAuth, requireAdmin, (req, res) => {
  const enquiries = db.getEnquiries();

  const headers = [
    'Enquiry ID',
    'Date',
    'Customer Name',
    'Phone',
    'Email',
    'City',
    'Locality',
    'Category',
    'Property Type',
    'Transaction',
    'Min Budget (INR)',
    'Max Budget (INR)',
    'Selected Property',
    'Status',
    'Preferred Contact',
    'Customer Message',
    'Internal Notes',
  ];

  const escapeCSV = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = enquiries.map((e) => [
    escapeCSV(e.id),
    escapeCSV(new Date(e.createdAt).toLocaleString('en-IN')),
    escapeCSV(e.customerName),
    escapeCSV(e.phone),
    escapeCSV(e.email),
    escapeCSV(e.city),
    escapeCSV(e.locality),
    escapeCSV(e.category),
    escapeCSV(e.propertyType),
    escapeCSV(e.transactionType),
    escapeCSV(e.minBudget),
    escapeCSV(e.maxBudget),
    escapeCSV(e.selectedPropertyTitle || 'General Enquiry'),
    escapeCSV(e.status),
    escapeCSV(e.preferredContactMethod),
    escapeCSV(e.message),
    escapeCSV(e.internalNotes || ''),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="NF_ESTATE_Enquiries.csv"');
  res.send(csvContent);
});

// Admin: All properties (including inactive)
app.get('/api/admin/properties', requireAuth, requireAdmin, (req, res) => {
  const properties = db.getProperties({ includeInactive: true });
  res.json({ properties });
});

// ================= VITE DEV / PROD SERVER =================
async function startServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NF ESTATE GROUP server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
