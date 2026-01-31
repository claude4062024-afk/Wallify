# WALLIFY - COMPLETE BUILD PROMPT FOR GITHUB COPILOT (CORRECTED)

**CRITICAL UNDERSTANDING:**
Wallify is "Mintlify but for testimonials" - a service that generates beautiful, hosted testimonial pages (like `love.yourcompany.com`) that automatically pull and display testimonials from social media platforms.

**NOT** an embeddable widget. **IS** a static site generator with auto-collection.

---

## PRODUCT ARCHITECTURE OVERVIEW

### The Three Core Components

1. **Dashboard** (Vite + React + TypeScript)
   - Where users manage their testimonials
   - Connect social accounts
   - Customize their testimonial page design
   - Approve/reject auto-collected testimonials

2. **Site Builder** (Astro)
   - Generates static HTML pages for each customer
   - Each customer gets `yourcompany.wallify.com` or custom domain
   - Lightning-fast, SEO-optimized testimonial pages
   - Auto-rebuilds when testimonials change

3. **Scraper Service** (Node.js + Puppeteer/Playwright)
   - Background jobs that run daily
   - Scrapes Twitter, LinkedIn, G2, ProductHunt
   - AI analyzes sentiment and quality
   - Notifies users of new testimonials

### User Journey

1. User signs up → Creates project
2. Connects Twitter account (OAuth)
3. Wallify automatically finds mentions/reviews
4. New testimonials appear in dashboard
5. User approves the good ones
6. Static site auto-rebuilds
7. `love.yourcompany.com` shows beautiful testimonial wall
8. User shares link with prospects

---

## DESIGN SYSTEM (STRICT ENFORCEMENT)

### Color Palette

```css
--amber-400: #FBBF24
--amber-500: #F59E0B
--amber-600: #D97706
--orange-500: #F97316
--stone-50: #FAFAF9
--stone-200: #E7E5E4
--stone-600: #57534E
--stone-900: #1C1917
--stone-950: #0C0A09
```

### Typography

- **Headings:** Satoshi (bold, 700 weight)
- **Body:** Manrope (regular 400, medium 500)
- Load from: Fontshare (Satoshi), Google Fonts (Manrope)

### UI Principles

- Clean, minimal, professional
- Generous whitespace
- Smooth transitions (200-300ms)
- Rounded corners (8-12px)
- Mobile-first responsive

---
 SECTION 1: PROJECT INITIALIZATION

## 1.1 - Create Monorepo Structure

Create the following structure:

wallify/
├── dashboard/          # Admin dashboard
├── site-builder/      # Astro static site generator
├── scraper-service/   # Background scraping service
└── shared/            # Shared types and utilities

## 1.2 - Dashboard Setup (Vite + React + TypeScript)

Initialize dashboard:

```bash
cd dashboard
npm create vite@latest . -- --template react-ts
npm install
```

Install all required dependencies:

```bash
# Routing & State
npm install react-router-dom zustand

# Backend & Data
npm install @supabase/supabase-js @tanstack/react-query

# UI Components
npm install lucide-react class-variance-authority clsx tailwind-merge
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-tabs @radix-ui/react-switch @radix-ui/react-tooltip

# Forms
npm install react-hook-form zod @hookform/resolvers

# AI
npm install openai

# Utilities
npm install date-fns

# Dev
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node
npx tailwindcss init -p
```

Configure Tailwind with amber/stone color scheme and Satoshi/Manrope fonts exactly as specified in design system section.

### 1.3 - Site Builder Setup (Astro)

Initialize Astro:

```bash
cd site-builder
npm create astro@latest . -- --template minimal --typescript strict
npm install
```

Install required Astro integrations:

```bash
npm install @astrojs/tailwind
npm install sharp  # For image optimization
```

## 1.4 - Scraper Service Setup (Node.js)

Initialize scraper service:

```bash
cd scraper-service
npm init -y
npm install typescript @types/node tsx --save-dev
npx tsc --init
```

Install scraping dependencies:

```bash
npm install puppeteer playwright
npm install bull ioredis  # Job queue
npm install express @types/express
npm install @supabase/supabase-js openai
npm install dotenv
```

---

SECTION 2: DATABASE SCHEMA (SUPABASE)

## 2.1 - Core Tables

Execute this SQL in Supabase SQL Editor:

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS vector;

-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  billing_tier TEXT DEFAULT 'starter',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Projects (each org can have multiple testimonial pages)
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,  -- Used for yourcompany.wallify.com
  custom_domain TEXT,
  site_config JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Connections (Twitter, LinkedIn, etc.)
CREATE TABLE connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,  -- 'twitter', 'linkedin', 'g2', 'producthunt'
  handle TEXT,  -- @username or company page URL
  access_token TEXT,  -- OAuth token (encrypted)
  refresh_token TEXT,
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Testimonials
CREATE TABLE testimonials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Source
  source TEXT NOT NULL,  -- 'twitter', 'linkedin', 'g2', etc.
  source_url TEXT,
  source_id TEXT,  -- Platform-specific ID (for deduplication)
  
  -- Content
  content_text TEXT NOT NULL,
  media_url TEXT,  -- Image or video URL
  
  -- Author
  author_name TEXT NOT NULL,
  author_handle TEXT,
  author_title TEXT,
  author_company TEXT,
  author_avatar TEXT,
  
  -- AI Analysis
  sentiment_score FLOAT,  -- 0.0 to 1.0 (how positive)
  quality_score FLOAT,  -- 0.0 to 1.0 (how good)
  tags TEXT[],  -- Auto-extracted tags
  embeddings vector(1536),  -- For semantic search
  
  -- Status
  status TEXT DEFAULT 'pending',  -- 'pending', 'approved', 'rejected', 'archived'
  
  -- Metadata
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Builds (track static site builds)
CREATE TABLE builds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending',  -- 'pending', 'building', 'deployed', 'failed'
  deployment_url TEXT,
  error_message TEXT,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID REFERENCES organizations(id),
  full_name TEXT,
  avatar_url TEXT,
  role TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_testimonials_project ON testimonials(project_id);
CREATE INDEX idx_testimonials_status ON testimonials(status);
CREATE INDEX idx_testimonials_source ON testimonials(source);
CREATE INDEX idx_connections_project ON connections(project_id);
CREATE INDEX idx_builds_project ON builds(project_id);

-- RLS Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can only see their own org's data
CREATE POLICY "users_own_org" ON organizations
  FOR SELECT USING (id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "users_own_projects" ON projects
  FOR ALL USING (org_id IN (SELECT org_id FROM profiles WHERE id = auth.uid()));

CREATE POLICY "users_own_testimonials" ON testimonials
  FOR ALL USING (project_id IN (
    SELECT id FROM projects WHERE org_id IN (
      SELECT org_id FROM profiles WHERE id = auth.uid()
    )
  ));
```

---

SECTION 3: DASHBOARD - AUTHENTICATION

## 3.1 - Auth Store (Zustand)

Create `dashboard/src/store/authStore.ts`:

Store should manage:

- User authentication state
- Profile data (name, org, role)
- SignIn method (email/password via Supabase)
- SignUp method (creates user + organization + profile)
- SignOut method
- Initialize method (checks existing session)

On SignUp, automatically:

1. Create auth user in Supabase
2. Create organization with user's name
3. Create profile linking user to org
4. Return success

## 3.2 - Auth Hook

Create `dashboard/src/hooks/useAuth.ts`:

Wrap the auth store and expose:

- user, profile, loading states
- isAuthenticated boolean
- signIn, signUp, signOut functions

## 3.3 - Protected Route Component

Create `dashboard/src/components/layout/ProtectedRoute.tsx`:

- Show loading spinner while checking auth
- Redirect to /login if not authenticated
- Render children if authenticated

## 3.4 - Login & Signup Pages

Create modern, professional auth pages with:

- Email and password inputs
- Loading states
- Error handling (display friendly messages)
- Links between login/signup
- Amber CTA buttons
- Center-aligned card layout

---
SECTION 4: DASHBOARD - LAYOUT & NAVIGATION

## 4.1 - Dashboard Layout

Create `dashboard/src/components/layout/DashboardLayout.tsx`:

**Desktop Sidebar (fixed left, 256px width):**

- Wallify logo at top (amber accent)
- Navigation items:
  - Dashboard (LayoutDashboard icon)
  - Testimonials (MessageSquareText icon)
  - Connections (Link icon)
  - Site Settings (Palette icon)
  - Analytics (BarChart3 icon)
  - Settings (Settings icon)
- User profile at bottom (avatar, name, email)
- Sign out button

**Mobile Navigation:**

- Hamburger menu in header
- Slide-in sidebar on mobile
- Overlay backdrop

**Main Content Area:**

- Left padding for sidebar on desktop
- Responsive padding (4 mobile, 6 tablet, 8 desktop)

---

SECTION 5: DASHBOARD - TESTIMONIALS MANAGEMENT

## 5.1 - Testimonials Hook

Create `dashboard/src/hooks/useTestimonials.ts`:

Use React Query to:

- Fetch testimonials for current project
- Filter by status (pending, approved, rejected)
- Mutations for:
  - Update status (approve/reject)
  - Delete testimonial
  - Bulk approve
- Invalidate queries after mutations

## 5.2 - Testimonials Page

Create `dashboard/src/pages/testimonials/TestimonialsPage.tsx`:

**Header:**

- Title: "Testimonials"
- Description: "Manage testimonials collected from your connected accounts"
- Filter tabs: All | Pending | Approved | Rejected

**Grid Layout (responsive):**

- 1 column mobile, 2 tablet, 3 desktop
- Each card shows:
  - Source badge (Twitter/LinkedIn/G2 icon + name)
  - Author avatar (circular)
  - Author name and title
  - Testimonial text (line-clamp-4)
  - Quality score badge (0-100%)
  - Auto-generated tags
  - Platform link (opens original post)
  - Action buttons: Approve (green), Reject (red), Delete (gray)

**Empty States:**

- No testimonials yet: "Connect your accounts to start collecting"
- No pending: "All caught up! Check back tomorrow for new testimonials"

---

SECTION 6: DASHBOARD - SOCIAL CONNECTIONS

## 6.1 - Connections Hook

Create `dashboard/src/hooks/useConnections.ts`:

Manage social account connections:

- Fetch active connections
- Add new connection (OAuth flow)
- Remove connection
- Trigger manual scrape

## 6.2 - Connections Page

Create `dashboard/src/pages/connections/ConnectionsPage.tsx`:

**Header:**

- Title: "Connected Accounts"
- Description: "Connect your social accounts to automatically collect testimonials"

**Connection Cards:**
For each platform (Twitter, LinkedIn, G2, ProductHunt):

- Platform icon and name
- Status: Connected (green check) or Not Connected
- If connected:
  - Show connected handle
  - Last scraped timestamp
  - "Disconnect" button
  - "Scan Now" button (manual trigger)
- If not connected:
  - "Connect" button
  - Brief description of what will be collected

**OAuth Flow:**
When user clicks "Connect Twitter":

1. Dashboard redirects to Supabase OAuth endpoint
2. User authorizes on Twitter
3. Redirected back with access token
4. Store token in connections table
5. Trigger initial scrape job

---
 SECTION 7: DASHBOARD - SITE CUSTOMIZATION

## 7.1 - Site Settings Hook

Create `dashboard/src/hooks/useSiteSettings.ts`:

Manage site configuration:

- Fetch current site config
- Update config (theme, colors, layout)
- Preview changes (before saving)

## 7.2 - Site Settings Page

Create `dashboard/src/pages/site-settings/SiteSettingsPage.tsx`:

**Two-Column Layout:**
Left: Configuration forms
Right: Live preview (iframe showing generated site)

**Configuration Options:**

**Tab 1: Branding*

- Tagline input
- Company name input
- Logo upload
- Primary color picker (defaults to amber)
- Font family selector (Inter, Roboto, Poppins, Playfair)

**Tab 2: Layout*

- Layout style: Grid, Masonry, Carousel, List
- Cards per row (1-4)
- Show/hide elements: avatars, ratings, company names

**Tab 3: Domain*

- Current URL: `yourcompany.wallify.com`
- Custom domain input
- DNS instructions (CNAME setup)
- Verification status

**Tab 4: Advanced*

- Custom CSS textarea (for power users)
- SEO meta description
- Header/footer HTML

**Save Button:**

- Triggers site rebuild
- Shows "Building..." loader
- Success message when deployed

---

SECTION 8: ASTRO SITE BUILDER

## 8.1 - Base Layout

Create `site-builder/src/layouts/BaseLayout.astro`:

HTML structure with:

- SEO meta tags (dynamic title, description, OG tags)
- Google Fonts (configured font family)
- Tailwind CSS
- Structured data (JSON-LD for reviews)
- Analytics script (optional)

Props interface:

```typescript
interface Props {
  config: SiteConfig
  testimonials: Testimonial[]
}
```

## 8.2 - Testimonial Components

Create these Astro components:

**TestimonialCard.astro:**

- Author avatar (circular)
- Author name and title
- Company name (if available)
- Testimonial text
- Source badge (Twitter/LinkedIn icon)
- Link to original post
- Star rating (if available)
- Fully responsive

**TestimonialGrid.astro:**

- CSS Grid layout
- Responsive columns (1 mobile, 2 tablet, 3+ desktop)
- Lazy load images
- Smooth animations on scroll

**Header.astro:**

- Company logo
- Company name
- Tagline (from config)

**Footer.astro:**

- Powered by Wallify badge (removable on paid plans)
- Social links (optional)

## 8.3 - Dynamic Route

Create `site-builder/src/pages/[slug].astro`:

This single route generates ALL customer sites.

```astro
---
export async function getStaticPaths() {
  // Fetch all active projects from Supabase
  const { data: projects } = await supabase
    .from('projects')
    .select('id, slug')
    .eq('is_active', true)
  
  return projects.map(project => ({
    params: { slug: project.slug },
    props: { projectId: project.id }
  }))
}

const { slug } = Astro.params
const { projectId } = Astro.props

// Fetch testimonials and config
const testimonials = await getApprovedTestimonials(projectId)
const config = await getSiteConfig(projectId)
---

<BaseLayout config={config}>
  <Header config={config} />
  <main class="container mx-auto px-4 py-16">
    <h1 class="text-5xl font-bold text-center mb-4">
      {config.companyName} Customer Stories
    </h1>
    <p class="text-xl text-center text-gray-600 mb-12">
      See why companies trust {config.companyName}
    </p>
    <TestimonialGrid 
      testimonials={testimonials} 
      config={config} 
    />
  </main>
  <Footer config={config} />
</BaseLayout>
```

## 8.4 - Build Script

Create `site-builder/scripts/build-site.ts`:

Script that:

1. Takes project ID as argument
2. Fetches project config from database
3. Runs Astro build for that specific project
4. Uploads built files to Cloudflare Pages
5. Returns deployment URL
6. Updates builds table with status

---

 SECTION 9: SCRAPER SERVICE - CORE ARCHITECTURE

## 9.1 - Base Scraper Class

Create `scraper-service/src/scrapers/base.ts`:

Abstract class with:

- Rate limiting (1 req/sec)
- Retry logic (3 attempts)
- Error handling
- Logging

All platform scrapers extend this base class.

## 9.2 - Twitter Scraper

Create `scraper-service/src/scrapers/twitter.ts`:

Using Puppeteer:

1. Launch headless browser
2. Login with OAuth token
3. Navigate to mentions/notifications
4. Extract tweets (text, author, avatar, timestamp)
5. Filter for positive mentions only
6. Return raw testimonial data

Handle:

- Rate limiting (Twitter is strict)
- Login failures (OAuth token expired)
- Missing elements (page structure changes)

## 9.3 - LinkedIn Scraper

Create `scraper-service/src/scrapers/linkedin.ts`:

Similar to Twitter but:

- More aggressive bot detection (use stealth mode)
- Scrape company page recommendations
- Extract posts mentioning company
- Random delays between actions (look human)

## 9.4 - G2 / Review Site Scrapers

Create `scraper-service/src/scrapers/g2.ts`:

Simpler than social platforms:

- Use Axios + Cheerio (no browser needed)
- Parse HTML with CSS selectors
- Handle pagination (scrape all review pages)
- Extract: rating, review text, reviewer, date

## 9.5 - Job Queue Setup

Create `scraper-service/src/lib/queue.ts`:

Set up Bull Queue with Redis:

- Job types: scrape-testimonials, analyze-sentiment, rebuild-site
- Retry failed jobs (3 attempts with backoff)
- Rate limiting per platform
- Job status tracking in database

## 9.6 - Scrape Job Worker

Create `scraper-service/src/jobs/scrape-testimonials.ts`:

Daily cron job that:

1. Fetches all active connections
2. For each connection, queue a scrape job
3. Worker picks up job
4. Runs appropriate scraper (Twitter, LinkedIn, etc.)
5. Saves raw testimonials to database (status: "unprocessed")
6. Queues AI analysis job
7. On completion, notify user of new testimonials

---

SECTION 10: AI PROCESSING

## 10.1 - Sentiment Analysis

Create `scraper-service/src/lib/sentiment.ts`:

Use OpenAI to analyze each testimonial:

```typescript
async function analyzeSentiment(text: string): Promise<number> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{
      role: 'user',
      content: `Analyze sentiment of this testimonial. Return only a number 0.0-1.0 where 1.0 is very positive:
      
"${text}"`
    }],
    temperature: 0.3
  })
  
  return parseFloat(response.choices[0].message.content)
}
```

Only testimonials with sentiment > 0.7 are shown to user as candidates.

## 10.2 - Quality Scoring

Create `scraper-service/src/lib/quality.ts`:

AI scores testimonial quality:

```typescript
async function scoreQuality(text: string): Promise<{
  score: number
  reasoning: string
}> {
  const prompt = `Score this testimonial 0.0-1.0 based on:
- Specificity (mentions metrics, features)
- Detail (length, depth)
- Credibility (job title, company mentioned)
- Authenticity (natural language)

Testimonial: "${text}"

Return JSON: {"score": 0.0-1.0, "reasoning": "brief explanation"}`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

## 10.3 - Auto-Tagging

Create `scraper-service/src/lib/tags.ts`:

Extract relevant tags:

```typescript
async function extractTags(text: string): Promise<string[]> {
  const prompt = `Extract 3-5 relevant tags from this testimonial.
Tags should be lowercase, single words or short phrases.
Examples: "support", "pricing", "ease of use", "roi"

Testimonial: "${text}"

Return JSON array of strings.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }]
  })
  
  return JSON.parse(response.choices[0].message.content)
}
```

## 10.4 - AI Processing Job

Create `scraper-service/src/jobs/analyze-sentiment.ts`:

Job that runs after scraping:

1. Fetch unprocessed testimonials
2. For each testimonial:
   - Analyze sentiment
   - Score quality
   - Extract tags
   - Generate embeddings (for search)
3. Update testimonial record with AI data
4. If sentiment > 0.7 and quality > 0.6, set status to "pending"
5. Else, set status to "rejected" (don't show to user)

---

 SECTION 11: BUILD & DEPLOYMENT AUTOMATION

## 11.1 - Rebuild Site Job

Create `scraper-service/src/jobs/rebuild-site.ts`:

Triggered when:

- User approves/rejects testimonials
- User changes site config
- Manual rebuild button clicked

Job flow:

1. Create build record (status: "pending")
2. Fetch project config and approved testimonials
3. Run Astro build script with project data
4. Upload built files to Cloudflare Pages
5. Get deployment URL
6. Update build record (status: "deployed", url: deployment_url)
7. If custom domain configured, update DNS

## 11.2 - Cloudflare Pages Deployment

Create `scraper-service/src/lib/deploy.ts`:

Use Cloudflare Pages API:

1. Create project (if doesn't exist)
2. Upload built files as deployment
3. Wait for deployment to be live
4. Return deployment URL

Handle:

- Build failures (update build record with error)
- Deployment failures (retry up to 3 times)
- Custom domain configuration

---

SECTION 12: ANALYTICS & MONITORING

## 12.1 - Analytics Tracking

Add to generated sites:

Simple analytics script that tracks:

- Page views (increment counter)
- Testimonial card clicks (track which testimonials get attention)
- Share button clicks

Store in Supabase:

```sql
CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID REFERENCES projects(id),
  event_type TEXT,  -- 'page_view', 'testimonial_click', 'share'
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);
```

## 12.2 - Analytics Dashboard

Create `dashboard/src/pages/analytics/AnalyticsPage.tsx`:

Show:

- Total page views (last 7, 30, 90 days)
- Top performing testimonials (most clicks)
- Traffic sources (referrers)
- Share metrics
- Simple line chart showing views over time

---

SECTION 13: FINAL POLISH

## 13.1 - Loading States

Every async operation must show loading state:

- Skeleton loaders for testimonial cards
- Spinner for page loads
- Progress bar for site rebuilds

## 13.2 - Error Handling

All errors must have user-friendly messages:

- API errors: "Something went wrong. Please try again."
- Auth errors: "Invalid email or password"
- Connection errors: "Could not connect to Twitter. Please try reconnecting."

## 13.3 - Toast Notifications

Use toast library for feedback:

- Success: "Testimonial approved!"
- Error: "Failed to update. Please try again."
- Info: "Site is rebuilding... This may take a minute."

## 13.4 - Empty States

Every list view needs empty state:

- No testimonials: Show illustration + CTA
- No connections: Guide user to connect accounts
- No builds: "Your site hasn't been built yet"

## 13.5 - Mobile Optimization

Test and perfect mobile experience:

- Touch targets minimum 44x44px
- Forms easy to fill on mobile
- Navigation intuitive
- Generated sites load fast on 3G

---

SECTION 14: DEPLOYMENT

## 14.1 - Dashboard Deployment (Vercel)

1. Connect GitHub repo to Vercel
2. Configure environment variables:
   - VITE_SUPABASE_URL
   - VITE_SUPABASE_ANON_KEY
   - VITE_OPENAI_API_KEY
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

## 14.2 - Scraper Service Deployment

Deploy to Fly.io or Railway:

1. Create Dockerfile
2. Configure Redis (for Bull Queue)
3. Set environment variables
4. Deploy as long-running service
5. Set up cron for daily scraping job

## 14.3 - Site Builder

Site builder runs on-demand (triggered by scraper service), not continuously deployed.

---

EXECUTION INSTRUCTIONS FOR COPILOT

**Build in this exact order:**

1. **Dashboard Foundation** (Sections 1-4)
   - Setup project structure
   - Configure database
   - Build authentication
   - Create layout and navigation

2. **Core Features** (Sections 5-7)
   - Testimonials management page
   - Social connections page
   - Site customization page

3. **Static Site Generator** (Section 8)
   - Build Astro templates
   - Create dynamic routing
   - Implement theme system

4. **Background Jobs** (Sections 9-10)
   - Build scraper service
   - Implement platform scrapers
   - Add AI analysis

5. **Automation** (Section 11)
   - Site rebuild automation
   - Cloudflare Pages deployment

6. **Polish** (Sections 12-13)
   - Analytics
   - Error handling
   - Mobile optimization

7. **Deploy** (Section 14)
   - Production deployment

---

## QUALITY STANDARDS

Every component must be:

- ✅ TypeScript (no any types)
- ✅ Responsive (mobile → desktop)
- ✅ Fast (< 2s load time)
- ✅ Accessible (keyboard nav, ARIA labels)
- ✅ Error-handled (try/catch all async)
- ✅ Loading states (spinners, skeletons)

**This is production-grade software. Build it with excellence.**
