# NF ESTATE GROUP — Backend & Supabase Configuration Guide

> **Tagline:** Your Future. Our Foundation.  
> **Service Area:** Gujarat, India  

---

## 1. Current Active Architecture: Built-in Full-Stack Express Server

NF ESTATE GROUP is currently operating on an integrated **Full-Stack Node.js / Express** architecture running on port 3000. It provides:

- **Real Database Persistence**: ACID-safe persistent storage located at `/data/database.json`.
- **Cryptographic Security**: Passwords salted and hashed with PBKDF2/SHA-512.
- **Session Tokens**: 256-bit cryptographically secure session management with Bearer authentication.
- **Role-Based Server Authorization**: Public users can only see verified active Gujarat properties; authenticated customers can submit and view only their own enquiries; the business owner / admin has full privileges over enquiries, site visits, seller submissions, and property listings.
- **Gujarat-Only Location Engine**: Strict validation ensuring only Gujarat cities and localities are accepted.

### Default Owner Credentials

- **Email:** `neevfataniya@gmail.com` (Owner) or `admin@nfestategroup.com`
- **Initial Password:** `NFEstate@2026#Gujarat` (or register directly with `neevfataniya@gmail.com` to receive automatic Owner Admin privileges)

---

## 2. Optional: External Supabase Deployment

If you want to connect this platform to an external managed **Supabase** project:

### Step 1: Create Supabase Project
1. Log in to [Supabase](https://supabase.com) and create a new project.
2. Select your region (e.g. `ap-south-1` Mumbai, India for lowest latency in Gujarat).

### Step 2: Execute Migration Script
1. Navigate to the **SQL Editor** in your Supabase dashboard.
2. Open `/supabase-schema.sql` from this repository.
3. Paste the contents and click **Run**.
4. This sets up:
   - `profiles` table with customer and admin roles.
   - `properties` table with Gujarat constraints.
   - `enquiries` table with customer data isolation and unique IDs (`NF-ENQ-2026-XXXX`).
   - `site_visits` and `seller_submissions` tables.
   - Row Level Security (RLS) policies enforcing zero data leaks.

### Step 3: Configure Environment Variables
In your `.env` file, specify:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

The application's unified API client will automatically direct queries to Supabase when these variables are detected!
