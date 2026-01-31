# WALLIFY - SKILL DOCUMENT

## PURPOSE OF THIS DOCUMENT

This document translates the philosophy defined in SOUL.md into concrete technical practices. Every developer, designer, and AI assistant working on Wallify must internalize these standards. This is not a suggestion guide. This is the standard.

---

## DEVELOPMENT ENVIRONMENT SETUP

### REQUIRED TOOLS

Every developer must have:

- **Node.js:** Version 20 or higher (use nvm for version management)
- **Package Manager:** npm (comes with Node, no need for yarn or pnpm unless specifically required)
- **Code Editor:** VSCode with extensions:
  - ESLint (code quality)
  - Prettier (code formatting)
  - Tailwind CSS IntelliSense (class suggestions)
  - Error Lens (inline error display)
  - GitLens (git history visualization)
- **Browser:** Chrome or Firefox with React DevTools extension
- **Git:** Version control (commit early, commit often, write descriptive messages)

### PROJECT INITIALIZATION CHECKLIST

Before writing any code:

1. Read SOUL.md completely (understand the why)
2. Read this SKILL.md completely (understand the how)
3. Clone the repository and run the development server
4. Verify all features work locally
5. Understand the file structure (where things go)
6. Know where to find documentation for libraries used

---

## FILE STRUCTURE STANDARDS

The codebase must be organized logically. Every developer should be able to find any file in under 10 seconds.

### OVERALL PROJECT STRUCTURE

Wallify consists of three main applications:

```text
wallify/
├── dashboard/              # Admin dashboard (Vite + React)
├── site-builder/          # Static site generator (Astro)
├── scraper-service/       # Background job for social scraping (Node.js)
└── shared/                # Shared types, utilities
```

### DASHBOARD APPLICATION STRUCTURE

```text
dashboard/
├── src/
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives (Button, Input, Card)
│   │   ├── layout/                # Layout wrappers (Header, Sidebar, Footer)
│   │   ├── dashboard/             # Dashboard-specific components
│   │   ├── testimonials/          # Testimonial management components
│   │   ├── connections/           # Social account connection components
│   │   └── site-settings/         # Site customization components
│   ├── pages/
│   │   ├── auth/                  # Login, Signup pages
│   │   ├── dashboard/             # Dashboard home
│   │   ├── testimonials/          # Testimonial management
│   │   ├── connections/           # Connect social accounts
│   │   ├── site-settings/         # Customize testimonial site
│   │   ├── analytics/             # Analytics pages
│   │   └── settings/              # Account settings
│   ├── lib/
│   │   ├── supabase.ts            # Supabase client
│   │   ├── openai.ts              # OpenAI client for AI features
│   │   ├── api.ts                 # API client for backend services
│   │   ├── utils.ts               # Pure utility functions
│   │   └── constants.ts           # App-wide constants
│   ├── hooks/
│   │   ├── useAuth.ts             # Authentication hook
│   │   ├── useTestimonials.ts     # Testimonials data hook
│   │   ├── useConnections.ts      # Social connections hook
│   │   ├── useSiteSettings.ts     # Site configuration hook
│   │   └── useAnalytics.ts        # Analytics data hook
│   ├── store/
│   │   └── authStore.ts           # Global auth state (Zustand)
│   ├── types/
│   │   ├── index.ts               # Shared TypeScript types
│   │   └── supabase.ts            # Generated Supabase types
│   ├── styles/
│   │   └── globals.css            # Global styles and Tailwind imports
│   ├── App.tsx                    # Root component with routing
│   └── main.tsx                   # Entry point
├── public/
│   ├── favicon.ico
│   └── assets/                    # Static images, fonts
├── .env.local                     # Environment variables (not committed)
├── .env.example                   # Example env file (committed)
├── tailwind.config.js             # Tailwind configuration
├── tsconfig.json                  # TypeScript configuration
├── vite.config.ts                 # Vite configuration
└── package.json                   # Dependencies and scripts
```

### SITE BUILDER (ASTRO) STRUCTURE

```text
site-builder/
├── src/
│   ├── components/
│   │   ├── TestimonialCard.astro     # Individual testimonial card
│   │   ├── TestimonialGrid.astro     # Grid layout
│   │   ├── TestimonialCarousel.astro # Carousel layout
│   │   ├── Header.astro              # Page header
│   │   ├── Footer.astro              # Page footer
│   │   └── ShareButtons.astro        # Social sharing
│   ├── layouts/
│   │   └── BaseLayout.astro          # Base page layout
│   ├── pages/
│   │   └── [...slug].astro           # Dynamic route (generates all customer sites)
│   ├── styles/
│   │   └── global.css                # Base styles
│   └── lib/
│       ├── testimonials.ts           # Fetch testimonials from DB
│       ├── themes.ts                 # Theme configurations
│       └── utils.ts                  # Utility functions
├── public/
│   └── assets/                       # Images, fonts
├── astro.config.mjs                  # Astro configuration
└── package.json
```

### SCRAPER SERVICE STRUCTURE

```text
scraper-service/
├── src/
│   ├── scrapers/
│   │   ├── twitter.ts                # Twitter scraper
│   │   ├── linkedin.ts               # LinkedIn scraper
│   │   ├── g2.ts                     # G2 scraper
│   │   ├── producthunt.ts            # ProductHunt scraper
│   │   └── base.ts                   # Base scraper class
│   ├── jobs/
│   │   ├── scrape-testimonials.ts    # Main scraping job
│   │   ├── analyze-sentiment.ts      # AI sentiment analysis
│   │   ├── rebuild-site.ts           # Trigger static site rebuild
│   │   └── send-notifications.ts     # Notify users of new testimonials
│   ├── lib/
│   │   ├── supabase.ts               # Database client
│   │   ├── openai.ts                 # AI processing
│   │   ├── queue.ts                  # Bull queue setup
│   │   └── browser.ts                # Puppeteer/Playwright setup
│   ├── utils/
│   │   ├── sentiment.ts              # Sentiment analysis utilities
│   │   ├── filters.ts                # Spam/bot filtering
│   │   └── validators.ts             # Data validation
│   ├── server.ts                     # Express API server
│   └── worker.ts                     # Background job processor
├── .env.local
├── tsconfig.json
└── package.json
```

### SHARED TYPES PACKAGE

```text
shared/
├── types/
│   ├── testimonial.ts                # Testimonial type definitions
│   ├── connection.ts                 # Social connection types
│   ├── site-config.ts                # Site configuration types
│   └── index.ts                      # Barrel exports
└── package.json
```

### FILE NAMING CONVENTIONS

- **Components:** PascalCase with descriptive names (`TestimonialCard.tsx`, not `Card.tsx`)
- **Utilities:** camelCase with verb-based names (`formatDate.ts`, `calculateScore.ts`)
- **Hooks:** camelCase starting with "use" (`useTestimonials.ts`, `useWindowSize.ts`)
- **Pages:** PascalCase ending with "Page" (`DashboardPage.tsx`, `SettingsPage.tsx`)
- **Types:** PascalCase for interfaces and types (`Testimonial`, `WidgetConfig`)

### WHERE THINGS GO

**Reusable UI components** → `src/components/ui/`
Example: Button, Input, Card, Modal base components

**Feature-specific components** → `src/components/{feature}/`
Example: TestimonialCard goes in `src/components/testimonials/`

**Page components** → `src/pages/{feature}/`
Example: TestimonialsPage goes in `src/pages/dashboard/`

**Business logic** → `src/hooks/`
Example: Data fetching, form handling, complex state management

**Pure functions** → `src/lib/utils.ts`
Example: Date formatting, string manipulation, calculations

**API integrations** → `src/lib/{service}.ts`
Example: Supabase client, OpenAI client, Stripe helpers

**Global state** → `src/store/`
Example: Auth state, theme state, any state needed across many components

---

## TYPESCRIPT STANDARDS

TypeScript is not optional. Every file must be `.ts` or `.tsx`. No `any` types unless absolutely necessary (and commented explaining why).

### TYPE DEFINITIONS

Every component must define its props interface:

```typescript
interface TestimonialCardProps {
  testimonial: Testimonial
  onApprove: (id: string) => void
  onReject: (id: string) => void
  showActions?: boolean
}
```

**Rules:**

- Required props first, optional props last
- Use descriptive names (`testimonial`, not `data`)
- Boolean props should start with "is", "has", "show" (`isLoading`, `hasError`, `showActions`)
- Callback props should start with "on" (`onClick`, `onSubmit`, `onApprove`)

### DOMAIN TYPES

Define types for all business entities:

```typescript
interface Testimonial {
  id: string
  projectId: string
  contentText: string | null
  mediaUrl: string | null
  mediaType: 'video' | 'image' | 'none' | null
  source: 'direct' | 'twitter' | 'linkedin' | 'g2' | 'video' | 'email'
  authorName: string
  authorTitle: string | null
  authorCompany: string | null
  authorAvatar: string | null
  sentimentScore: number | null
  qualityScore: number | null
  tags: string[]
  status: 'pending' | 'approved' | 'archived' | 'rejected'
  verificationStatus: string
  createdAt: string
}
```

**Rules:**

- Use specific types (`'pending' | 'approved'`) instead of generic (`string`)
- Use `null` for values that might not exist (not `undefined`)
- Use `string[]` for arrays of primitives
- Use ISO string format for dates (`string`, not `Date` object, for API compatibility)

### TYPE INFERENCE

Let TypeScript infer types when obvious:

```typescript
// Good - inference works
const count = testimonials.length
const userName = user.name || 'Guest'

// Bad - unnecessary annotation
const count: number = testimonials.length
```

But always annotate function returns for clarity:

```typescript
// Good - explicit return type
function calculateQualityScore(text: string): number {
  // implementation
}

// Bad - implicit return type
function calculateQualityScore(text: string) {
  // implementation
}
```

---

## REACT COMPONENT STANDARDS

Every React component must follow these patterns for consistency and maintainability.

### COMPONENT STRUCTURE

Every component file follows this exact order:

```typescript
// 1. Imports - grouped by category
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { Testimonial } from '@/types'

// 2. Type definitions
interface MyComponentProps {
  // props interface
}

// 3. Component definition
export const MyComponent = ({ prop1, prop2 }: MyComponentProps) => {
  // Component logic
  
  return (
    // JSX
  )
}

// 4. Helper functions (if small and component-specific)
function helperFunction() {
  // implementation
}

// 5. Export (already done above, but if needed for multiple exports)
```

### HOOKS USAGE

**Rules for hooks:**

- Always call hooks at the top level (never inside conditions or loops)
- Custom hooks must start with "use" (`useTestimonials`, not `getTestimonials`)
- Keep hooks focused (one hook per concern)

**State management:**

```typescript
// Good - clear, specific names
const [isLoading, setIsLoading] = useState(false)
const [testimonials, setTestimonials] = useState<Testimonial[]>([])
const [error, setError] = useState<string | null>(null)

// Bad - generic names
const [loading, setLoading] = useState(false)
const [data, setData] = useState([])
const [err, setErr] = useState(null)
```

**Effect dependencies:**

```typescript
// Good - explicit dependencies
useEffect(() => {
  fetchTestimonials(projectId)
}, [projectId])

// Bad - missing dependencies (ESLint will warn)
useEffect(() => {
  fetchTestimonials(projectId)
}, [])
```

### CONDITIONAL RENDERING

**Loading states:**

```typescript
if (isLoading) {
  return (
    <div className="flex items-center justify-center p-8">
      <Spinner />
    </div>
  )
}
```

**Error states:**

```typescript
if (error) {
  return (
    <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg">
      <p className="font-medium">Error loading testimonials</p>
      <p className="text-sm">{error}</p>
      <button onClick={retry} className="mt-2 text-sm underline">
        Try again
      </button>
    </div>
  )
}
```

**Empty states:**

```typescript
if (testimonials.length === 0) {
  return (
    <div className="text-center p-12">
      <EmptyIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium mb-2">No testimonials yet</h3>
      <p className="text-gray-600 mb-4">Get started by adding your first testimonial</p>
      <Button onClick={openAddModal}>Add Testimonial</Button>
    </div>
  )
}
```

### COMPONENT SIZE

**Single Responsibility Principle:**

- One component does one thing well
- If a component exceeds 200 lines, consider splitting it
- Extract complex logic into custom hooks
- Extract repeated JSX into smaller components

**Example of refactoring:**
Instead of one massive 500-line `TestimonialsPage`, split into:

- `TestimonialsPage` (layout, coordination)
- `TestimonialsHeader` (title, search, filters)
- `TestimonialGrid` (grid layout logic)
- `TestimonialCard` (individual card display)
- `TestimonialActions` (approve, reject, delete buttons)

---

## STYLING STANDARDS

We use Tailwind CSS exclusively. No custom CSS classes except for animations and very specific cases.

### TAILWIND USAGE RULES

**Color classes:**

- Primary actions: `bg-amber-500 hover:bg-amber-600 text-white`
- Secondary actions: `bg-stone-200 hover:bg-stone-300 text-stone-900`
- Destructive actions: `bg-red-500 hover:bg-red-600 text-white`
- Success states: `bg-green-500 text-white`
- Text colors: `text-stone-900` (headings), `text-stone-600` (body), `text-stone-400` (muted)

**Spacing:**

- Use the 8px scale: `p-2` (8px), `p-4` (16px), `p-6` (24px), `p-8` (32px)
- Consistent spacing: `space-y-4` for vertical stacks, `gap-4` for grids

**Responsive design:**

- Mobile-first approach: write mobile styles first, then add breakpoints
- Breakpoints: `sm:` (640px), `md:` (768px), `lg:` (1024px), `xl:` (1280px)

**Example:**

```typescript
<div className="p-4 md:p-6 lg:p-8 bg-white rounded-lg shadow-sm">
  <h2 className="text-2xl md:text-3xl font-bold text-stone-900 mb-4">
    Testimonials
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* cards */}
  </div>
</div>
```

### CUSTOM CLASSES

Only create custom classes for:

- Animations (defined in globals.css)
- Complex gradients (if used multiple times)
- Browser-specific fixes (with comments explaining why)

**Example of acceptable custom class:**

```css
@keyframes float {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.animate-float {
  animation: float 3s ease-in-out infinite;
}
```

### ACCESSIBILITY IN STYLES

- All interactive elements must have visible focus states: `focus:outline-none focus:ring-2 focus:ring-amber-500`
- Color is never the only indicator (use icons or text too)
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Touch targets: minimum 44x44px for mobile

---

## STATE MANAGEMENT STANDARDS

We use multiple state management solutions based on scope.

### LOCAL STATE (useState)

For component-specific state that doesn't need to be shared.

**Good use cases:**

- Form input values
- UI toggle states (dropdown open/closed)
- Local loading states

**Example:**

```typescript
const [searchQuery, setSearchQuery] = useState('')
const [isDropdownOpen, setIsDropdownOpen] = useState(false)
```

### SERVER STATE (React Query)

For any data that comes from the database or API.

**Good use cases:**

- Fetching testimonials
- Updating testimonial status
- Creating widgets

**Example:**

```typescript
const { data: testimonials, isLoading, error } = useQuery({
  queryKey: ['testimonials', projectId],
  queryFn: async () => {
    const { data, error } = await supabase
      .from('testimonials')
      .select('*')
      .eq('project_id', projectId)
    
    if (error) throw error
    return data
  }
})
```

**Mutation example:**

```typescript
const updateStatusMutation = useMutation({
  mutationFn: async ({ id, status }: { id: string; status: string }) => {
    const { error } = await supabase
      .from('testimonials')
      .update({ status })
      .eq('id', id)
    
    if (error) throw error
  },
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['testimonials'] })
    toast.success('Testimonial updated')
  },
  onError: (error) => {
    toast.error(`Failed to update: ${error.message}`)
  }
})
```

### GLOBAL STATE (Zustand)

For app-wide state that many components need.

**Good use cases:**

- User authentication state
- Current organization/project
- Theme preferences

**Example:**

```typescript
interface AuthState {
  user: User | null
  profile: Profile | null
  isAuthenticated: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  profile: null,
  isAuthenticated: false,
  
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    
    if (error) throw error
    
    set({ 
      user: data.user, 
      isAuthenticated: true 
    })
  },
  
  signOut: async () => {
    await supabase.auth.signOut()
    set({ 
      user: null, 
      profile: null, 
      isAuthenticated: false 
    })
  }
}))
```

---

## ERROR HANDLING STANDARDS

Every error must be handled gracefully. No unhandled promise rejections. No cryptic error messages.

### API CALL ERROR HANDLING

**Pattern to follow:**

```typescript
try {
  setIsLoading(true)
  setError(null)
  
  const result = await apiCall()
  
  // Success handling
  setData(result)
  
} catch (err) {
  // Error handling
  const message = err instanceof Error ? err.message : 'Something went wrong'
  setError(message)
  
  // Optional: Log to error tracking service
  console.error('API call failed:', err)
  
} finally {
  setIsLoading(false)
}
```

### USER-FACING ERROR MESSAGES

**Rules:**

- Never show raw error messages to users (`PGRST116`, `500 Internal Server Error`)
- Always provide context and next steps
- Use friendly language (not technical jargon)

**Examples:**

Bad: "Error: PGRST116"
Good: "We couldn't load your testimonials. Please try refreshing the page."

Bad: "Unauthorized"
Good: "Your session has expired. Please sign in again."

Bad: "Network request failed"
Good: "Connection problem. Check your internet and try again."

### FORM VALIDATION ERRORS

**Pattern:**

```typescript
interface FormErrors {
  email?: string
  password?: string
  general?: string
}

const [errors, setErrors] = useState<FormErrors>({})

const validateForm = (): boolean => {
  const newErrors: FormErrors = {}
  
  if (!email) {
    newErrors.email = 'Email is required'
  } else if (!isValidEmail(email)) {
    newErrors.email = 'Please enter a valid email'
  }
  
  if (!password) {
    newErrors.password = 'Password is required'
  } else if (password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}
```

**Display errors:**

```typescript
<input
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  className={`input ${errors.email ? 'border-red-500' : ''}`}
/>
{errors.email && (
  <p className="text-red-600 text-sm mt-1">{errors.email}</p>
)}
```

---

## PERFORMANCE OPTIMIZATION STANDARDS

Performance is not optional. Every component must be fast.

### LAZY LOADING

**Code splitting for routes:**

```typescript
import { lazy, Suspense } from 'react'

const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage'))
const AnalyticsPage = lazy(() => import('./pages/AnalyticsPage'))

<Suspense fallback={<LoadingSpinner />}>
  <Route path="/testimonials" element={<TestimonialsPage />} />
  <Route path="/analytics" element={<AnalyticsPage />} />
</Suspense>
```

**Image lazy loading:**

```typescript
<img
  src={testimonial.authorAvatar}
  alt={testimonial.authorName}
  loading="lazy"
  className="w-12 h-12 rounded-full"
/>
```

### MEMOIZATION

**Use React.memo for expensive components:**

```typescript
export const TestimonialCard = React.memo(({ testimonial }: Props) => {
  // component logic
}, (prevProps, nextProps) => {
  // Custom comparison: only re-render if testimonial ID changed
  return prevProps.testimonial.id === nextProps.testimonial.id
})
```

**Use useMemo for expensive calculations:**

```typescript
const sortedTestimonials = useMemo(() => {
  return testimonials
    .sort((a, b) => b.qualityScore - a.qualityScore)
    .slice(0, 10)
}, [testimonials])
```

**Use useCallback for functions passed as props:**

```typescript
const handleApprove = useCallback((id: string) => {
  updateStatusMutation.mutate({ id, status: 'approved' })
}, [updateStatusMutation])
```

### BUNDLE SIZE OPTIMIZATION

**Import only what you need:**

```typescript
// Good
import { formatDistance } from 'date-fns'

// Bad (imports entire library)
import * as dateFns from 'date-fns'
```

**Use dynamic imports for heavy libraries:**

```typescript
const handleVideoTranscode = async (file: File) => {
  // Only load FFmpeg when actually needed
  const { createFFmpeg } = await import('@ffmpeg/ffmpeg')
  const ffmpeg = createFFmpeg({ log: true })
  // ... transcoding logic
}
```

---

## DATABASE INTERACTION STANDARDS

All database interactions go through Supabase. Follow these patterns religiously.

### QUERY PATTERNS

**Fetching data:**

```typescript
const { data, error } = await supabase
  .from('testimonials')
  .select('*')
  .eq('project_id', projectId)
  .eq('status', 'approved')
  .order('created_at', { ascending: false })
  .limit(20)

if (error) throw new Error(error.message)
return data
```

**Inserting data:**

```typescript
const { data, error } = await supabase
  .from('testimonials')
  .insert({
    project_id: projectId,
    content_text: text,
    author_name: name,
    status: 'pending'
  })
  .select()
  .single()

if (error) throw new Error(error.message)
return data
```

**Updating data:**

```typescript
const { error } = await supabase
  .from('testimonials')
  .update({ status: 'approved' })
  .eq('id', testimonialId)

if (error) throw new Error(error.message)
```

**Deleting data:**

```typescript
const { error } = await supabase
  .from('testimonials')
  .delete()
  .eq('id', testimonialId)

if (error) throw new Error(error.message)
```

### ROW LEVEL SECURITY

Never bypass RLS. All queries automatically respect RLS policies. Users can only access their own organization's data.

**Testing RLS:**
When developing, test with multiple user accounts to ensure data isolation works correctly.

### REAL-TIME SUBSCRIPTIONS

For live updates (optional, use sparingly):

```typescript
useEffect(() => {
  const channel = supabase
    .channel('testimonials-changes')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'testimonials',
        filter: `project_id=eq.${projectId}`
      },
      (payload) => {
        // Handle new testimonial
        queryClient.invalidateQueries(['testimonials'])
      }
    )
    .subscribe()

  return () => {
    supabase.removeChannel(channel)
  }
}, [projectId])
```

---

## AI INTEGRATION STANDARDS

OpenAI is used for AI-powered features. Follow these patterns to ensure reliability and cost efficiency.

### OPENAI CLIENT SETUP

```typescript
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
```

### DIRECTOR MODE QUESTION GENERATION

```typescript
export async function generateDirectorQuestions(
  industry: string,
  productType: string,
  customerRole: string
): Promise<string[]> {
  const prompt = `You are helping collect a video testimonial. Generate 3 thoughtful questions to ask a ${customerRole} in the ${industry} industry about their experience with a ${productType}.

The questions should:
- Be specific and concrete (not generic)
- Probe for measurable results or specific examples
- Encourage storytelling
- Be easy to answer in 30-60 seconds

Format: Return a JSON array of question strings.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 500
  })

  const content = response.choices[0].message.content
  return JSON.parse(content || '[]')
}
```

### TESTIMONIAL QUALITY SCORING

```typescript
export async function analyzeTestimonialQuality(
  text: string
): Promise<{ score: number; reasoning: string }> {
  const prompt = `Analyze this testimonial and score its quality from 0.0 to 1.0.

High-quality testimonials:
- Mention specific results or metrics
- Include the person's role/title
- Describe a specific problem solved
- Show emotion or enthusiasm
- Are detailed (not generic)

Low-quality testimonials:
- Generic praise ("it's great!")
- No specifics or context
- Too short or too long
- Seem fake or overly promotional

Testimonial:
"${text}"

Return JSON: { "score": 0.0-1.0, "reasoning": "brief explanation" }`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3,
    max_tokens: 200
  })

  const content = response.choices[0].message.content
  return JSON.parse(content || '{ "score": 0.5, "reasoning": "Could not analyze" }')
}
```

### TAG EXTRACTION

```typescript
export async function extractTags(text: string): Promise<string[]> {
  const prompt = `Extract relevant tags from this testimonial. Tags should be:
- Single words or short phrases
- Lowercase
- Related to features, benefits, or use cases mentioned
- Maximum 5 tags

Testimonial:
"${text}"

Return JSON array of tag strings.`

  const response = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 100
  })

  const content = response.choices[0].message.content
  return JSON.parse(content || '[]')
}
```

### VIDEO TRANSCRIPTION

```typescript
export async function transcribeVideo(audioFile: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', audioFile)
  formData.append('model', 'whisper-1')

  const response = await openai.audio.transcriptions.create({
    file: audioFile,
    model: 'whisper-1',
    language: 'en'
  })

  return response.text
}
```

### COST OPTIMIZATION

**Rules:**

- Cache AI responses when possible (store in database)
- Use lower temperature (0.3-0.5) for consistent outputs
- Limit max_tokens to prevent runaway costs
- Batch process when possible (multiple testimonials at once)
- Monitor usage monthly (set up OpenAI usage alerts)

---

## STATIC SITE GENERATION STANDARDS

The generated testimonial pages (like `love.yourcompany.com`) are the core product. They must be perfect.

### ASTRO ARCHITECTURE

**Why Astro:**

- Ships zero JavaScript by default (fastest possible)
- Only hydrates interactive components (minimal client-side code)
- Built-in optimizations (image optimization, CSS minification)
- Perfect for content-heavy static sites
- SEO-friendly (real HTML, not client-side rendered)

### SITE GENERATION FLOW

**The build pipeline:**

1. User approves testimonials in dashboard
2. Dashboard triggers webhook to scraper service
3. Scraper service queues "rebuild-site" job
4. Job worker fetches testimonials from database
5. Job worker calls Astro build with customer config
6. Astro generates static HTML/CSS/JS
7. Files are uploaded to Cloudflare Pages
8. Custom domain points to new deployment
9. User's page is live (entire process < 2 minutes)

### DYNAMIC ROUTE PATTERN

**Single Astro route generates all customer sites:**

```astro
---
// src/pages/[slug].astro
import BaseLayout from '../layouts/BaseLayout.astro'
import TestimonialGrid from '../components/TestimonialGrid.astro'
import { getTestimonials, getSiteConfig } from '../lib/testimonials'

export async function getStaticPaths() {
  // Fetch all active customer slugs from database
  const customers = await fetchActiveCustomers()
  
  return customers.map(customer => ({
    params: { slug: customer.slug },
    props: { customerId: customer.id }
  }))
}

const { slug } = Astro.params
const { customerId } = Astro.props

// Fetch this customer's testimonials and site config
const testimonials = await getTestimonials(customerId)
const config = await getSiteConfig(customerId)
---

<BaseLayout config={config}>
  <h1>{config.companyName} Customer Stories</h1>
  <TestimonialGrid testimonials={testimonials} config={config} />
</BaseLayout>
```

### PERFORMANCE REQUIREMENTS

**Hard limits for generated sites:**

- HTML size: < 100KB per page
- First Contentful Paint: < 400ms
- Largest Contentful Paint: < 1.0s
- Cumulative Layout Shift: 0
- Total page weight: < 1MB (including images)
- Lighthouse score: > 95

**How to achieve this:**

- Use Astro's built-in image optimization
- Lazy load below-the-fold images
- Inline critical CSS (no external stylesheet for above-fold)
- Preload fonts (WOFF2 format only)
- Minify HTML aggressively
- Use WebP/AVIF with JPG fallback

### THEME SYSTEM

**Each customer can customize:**

- Primary color (brand color)
- Font family (from curated list)
- Layout style (grid, masonry, carousel, list)
- Header/footer content
- Logo and favicon
- Custom CSS (advanced users)

**Theme configuration stored in database:**

```typescript
interface SiteConfig {
  slug: string
  companyName: string
  logo: string
  primaryColor: string
  fontFamily: 'inter' | 'roboto' | 'poppins' | 'playfair'
  layout: 'grid' | 'masonry' | 'carousel' | 'list'
  showHeader: boolean
  showFooter: boolean
  customCss?: string
  customDomain?: string
}
```

### CUSTOM DOMAIN SETUP

**User flow:**

1. User enters custom domain in dashboard (e.g., `love.acme.com`)
2. Dashboard shows DNS instructions: "Add CNAME record pointing to your-site.wallify.pages.dev"
3. User updates DNS
4. System verifies CNAME record
5. Cloudflare Pages automatically provisions SSL
6. Site is live at custom domain

**Implementation:**

- Use Cloudflare Pages Custom Domains API
- Auto-provision SSL certificates
- Support both CNAME (subdomain) and A record (apex domain)
- Verify DNS propagation before marking as "active"

### SEO OPTIMIZATION

**Every generated page includes:**

- Semantic HTML (proper heading hierarchy)
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data (JSON-LD) for rich snippets:

  ```json
  {
    "@context": "https://schema.org",
    "@type": "Review",
    "itemReviewed": {
      "@type": "Organization",
      "name": "Acme Corp"
    },
    "author": {
      "@type": "Person",
      "name": "John Doe"
    },
    "reviewRating": {
      "@type": "Rating",
      "ratingValue": "5"
    },
    "reviewBody": "Amazing product..."
  }

  ```

- Sitemap.xml (auto-generated)
- Robots.txt (allow all)

### INCREMENTAL BUILDS

**Optimization for frequent updates:**

- Only rebuild when testimonials change (not on every save)
- Cache unchanged assets (fonts, images)
- Use Astro's incremental static regeneration
- Deploy only changed pages (not entire site)

**Rebuild triggers:**

- User approves/rejects testimonial
- User changes site config (color, layout)
- New testimonials auto-detected (daily scrape)
- Manual rebuild button (for testing)

---

## SOCIAL MEDIA SCRAPING STANDARDS

Auto-collection is what makes Wallify magical. Users connect once, we monitor forever.

### SCRAPER SERVICE ARCHITECTURE

**Built with:**

- Node.js + TypeScript
- Puppeteer or Playwright (headless browsers)
- Bull Queue (Redis-backed job processing)
- Express (API server for webhooks)

**Why headless browsers:**
Twitter and LinkedIn don't have free APIs for this use case. We use browsers to access public data just like a human would.

### BASE SCRAPER CLASS

**Every platform scraper extends this:**

```typescript
abstract class BaseScraper {
  abstract platform: 'twitter' | 'linkedin' | 'g2' | 'producthunt'
  
  // Fetch testimonials for a specific company
  abstract scrape(connection: Connection): Promise<RawTestimonial[]>
  
  // Rate limiting (max 1 request per second)
  protected async rateLimit(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  
  // Error handling and retries
  protected async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3
  ): Promise<T> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn()
      } catch (error) {
        if (i === maxRetries - 1) throw error
        await this.rateLimit()
      }
    }
    throw new Error('Max retries exceeded')
  }
}
```

### TWITTER/X SCRAPER

**What we scrape:**

- Mentions of company Twitter handle
- Replies to company tweets (if positive)
- Branded hashtag usage
- Quote tweets with positive sentiment

**Implementation pattern:**

```typescript
class TwitterScraper extends BaseScraper {
  platform = 'twitter' as const
  
  async scrape(connection: Connection): Promise<RawTestimonial[]> {
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    
    // Login with company's Twitter credentials (OAuth token)
    await this.login(page, connection.accessToken)
    
    // Navigate to notifications/mentions
    await page.goto(`https://twitter.com/${connection.handle}/mentions`)
    
    // Wait for tweets to load
    await page.waitForSelector('[data-testid="tweet"]')
    
    // Extract tweet data
    const tweets = await page.evaluate(() => {
      const tweetElements = document.querySelectorAll('[data-testid="tweet"]')
      return Array.from(tweetElements).map(el => ({
        text: el.querySelector('[data-testid="tweetText"]')?.textContent,
        author: el.querySelector('[data-testid="User-Name"]')?.textContent,
        authorHandle: el.querySelector('[data-testid="User-Name"] a')?.getAttribute('href'),
        timestamp: el.querySelector('time')?.getAttribute('datetime'),
        avatar: el.querySelector('img[alt*="avatar"]')?.getAttribute('src')
      }))
    })
    
    await browser.close()
    
    // Filter and format
    return this.formatTestimonials(tweets)
  }
}
```

### LINKEDIN SCRAPER

**What we scrape:**

- Company page recommendations
- Posts mentioning the company
- Employee posts about the company (with permission)

**Challenges:**

- LinkedIn aggressively blocks bots
- Must use realistic browser fingerprints
- Need to respect rate limits strictly

**Implementation notes:**

- Use Playwright with real browser profiles
- Add random delays between actions (1-3 seconds)
- Rotate IP addresses (use residential proxies)
- Only scrape during business hours (look human)

### G2 / CAPTERRA / TRUSTPILOT SCRAPERS

**What we scrape:**

- Review text and ratings
- Reviewer name, title, company
- Verified badge status
- Review date

**Easier than social platforms:**

- These sites want reviews to be public
- Less aggressive bot detection
- Structured HTML (easier to parse)

**Implementation:**

- Use Axios + Cheerio (faster than browser)
- Parse HTML with CSS selectors
- Handle pagination (scrape all pages)
- Check for review updates (detect edits)

### PRODUCTHUNT SCRAPER

**What we scrape:**

- Product launch comments
- Upvotes and maker replies
- Hunter's comment
- Badges and awards

**API available:**

- ProductHunt has a GraphQL API (use this)
- Requires API key (user provides)
- Much more reliable than scraping

### SCRAPING JOB FLOW

**Daily scheduled job:**

1. Fetch all active connections from database
2. For each connection, queue a scrape job
3. Job worker picks up job
4. Scraper runs (rate-limited, retries on failure)
5. Raw testimonials saved to database with status "unprocessed"
6. Trigger AI processing job (sentiment, quality, tags)
7. Notify user of new testimonials
8. If enough new testimonials, trigger site rebuild

### ERROR HANDLING

**Common failures and solutions:**

- Login failed → Notify user to reconnect account
- Rate limited → Back off exponentially (1min, 5min, 15min)
- Page structure changed → Log error, alert engineering team
- Network timeout → Retry up to 3 times
- Account suspended → Notify user immediately

### ETHICAL SCRAPING RULES

**We follow these strictly:**

- Respect robots.txt (check before scraping)
- Rate limit: Max 1 request per second per domain
- Only scrape public data (no private profiles)
- User agent: Identify as "Wallify Bot" with contact email
- Obey "noindex" meta tags
- Provide opt-out mechanism (if someone wants their review removed)
- Cache results (don't re-scrape unnecessarily)

### DATA PRIVACY

**What we store:**

- Public post content (text, images)
- Public profile data (name, avatar, title)
- Post metadata (timestamp, likes, shares)

**What we DON'T store:**

- Private messages
- Non-public posts
- Email addresses (unless explicitly provided)
- Authentication credentials (only OAuth tokens, encrypted)

### ANTI-SPAM FILTERING

**Before saving testimonials, we filter:**

```typescript
async function isSpamAccount(author: Author): Promise<boolean> {
  // Check account age (created < 30 days ago)
  if (isAccountTooNew(author.createdAt)) return true
  
  // Check follower ratio (following 1000+, followers < 10)
  if (author.following > 1000 && author.followers < 10) return true
  
  // Check for bot keywords in bio
  if (containsBotKeywords(author.bio)) return true
  
  // Check for suspicious patterns
  if (hasOnlyNumbers(author.handle)) return true
  
  return false
}

async function isSpamContent(text: string): Promise<boolean> {
  // Check for spam keywords
  const spamKeywords = ['click here', 'dm me', 'check bio', 'link in bio']
  if (spamKeywords.some(keyword => text.toLowerCase().includes(keyword))) {
    return true
  }
  
  // Check for excessive links
  const linkCount = (text.match(/https?:\/\//g) || []).length
  if (linkCount > 2) return true
  
  // Check for repeated characters (e.g., "amazinggggggg")
  if (/(.)\1{4,}/.test(text)) return true
  
  return false
}
```

---

---

## TESTING STANDARDS

We don't test for coverage metrics. We test to prevent bugs and ensure features work.

### UNIT TESTS

For pure functions and utilities:

```typescript
import { describe, it, expect } from 'vitest'
import { calculateQualityScore } from './utils'

describe('calculateQualityScore', () => {
  it('returns high score for detailed testimonials', () => {
    const text = "This product saved us $50,000 in the first quarter. As a CFO, I can say the ROI is incredible."
    const score = calculateQualityScore(text)
    expect(score).toBeGreaterThan(0.8)
  })
  
  it('returns low score for generic testimonials', () => {
    const text = "It's great!"
    const score = calculateQualityScore(text)
    expect(score).toBeLessThan(0.3)
  })
})
```

### INTEGRATION TESTS

For API interactions and database queries:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createTestimonial, getTestimonials } from './testimonials'

describe('Testimonials API', () => {
  beforeEach(async () => {
    // Clean up test data
    await cleanupTestData()
  })
  
  it('creates and retrieves testimonials', async () => {
    const created = await createTestimonial({
      projectId: 'test-project',
      authorName: 'Test User',
      contentText: 'Great product!',
      status: 'pending'
    })
    
    expect(created.id).toBeDefined()
    
    const testimonials = await getTestimonials('test-project')
    expect(testimonials).toHaveLength(1)
    expect(testimonials[0].authorName).toBe('Test User')
  })
})
```

### E2E TESTS

For critical user flows (optional for MVP, required for production):

```typescript
import { test, expect } from '@playwright/test'

test('user can create and approve testimonial', async ({ page }) => {
  // Login
  await page.goto('/login')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="password"]', 'password123')
  await page.click('button[type="submit"]')
  
  // Navigate to testimonials
  await page.click('text=Testimonials')
  
  // Add testimonial
  await page.click('text=Add Testimonial')
  await page.fill('[name="authorName"]', 'John Doe')
  await page.fill('[name="contentText"]', 'This is a great product!')
  await page.click('button:has-text("Submit")')
  
  // Verify it appears
  await expect(page.locator('text=John Doe')).toBeVisible()
  
  // Approve it
  await page.click('button:has-text("Approve")')
  await expect(page.locator('text=Approved')).toBeVisible()
})
```

### WHAT TO TEST

**Always test:**

- User authentication flows (signup, login, logout)
- Data creation, reading, updating, deleting (CRUD)
- Form validation (required fields, format validation)
- Error handling (network failures, invalid inputs)
- Critical business logic (quality scoring, tag extraction)

**Don't test:**

- UI styling (use visual regression testing tools if needed)
- Third-party libraries (assume they work)
- Simple getter/setter functions
- Component rendering (unless complex conditional logic)

---

## DEPLOYMENT STANDARDS

### ENVIRONMENT VARIABLES

**Never commit secrets.** All sensitive values go in environment variables.

**Required variables:**

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_OPENAI_API_KEY=sk-...
```

**Environment-specific variables:**

```bash
# Development (.env.local)
VITE_API_URL=http://localhost:3000

# Production (.env.production)
VITE_API_URL=https://api.wallify.com
```

### BUILD PROCESS

**Vite build command:**

```bash
npm run build
```

**Output:**

- Optimized bundle in `dist/`
- Minified JavaScript
- Compressed assets
- Source maps for error tracking

**Pre-deployment checklist:**

- [ ] All tests pass
- [ ] Build succeeds without warnings
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] API endpoints accessible
- [ ] Lighthouse score > 90

### VERCEL DEPLOYMENT

**Configuration (vercel.json):**

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key",
    "VITE_OPENAI_API_KEY": "@openai-api-key"
  }
}
```

**Deployment flow:**

1. Push to main branch
2. Vercel automatically builds
3. Runs preview deployment
4. Manual approval for production
5. Production deployment goes live

### MONITORING

**After deployment, monitor:**

- Error rate (target: < 0.1% of requests)
- Response times (95th percentile < 300ms)
- Uptime (target: 99.9%)
- User signups and conversions
- Widget embed performance

**Set up alerts for:**

- Deployment failures
- Error rate spikes
- Slow response times
- Database connection failures

---

## SECURITY STANDARDS

Security is not negotiable. Follow these rules without exception.

### INPUT VALIDATION

**Never trust user input.** Validate everything.

**Form validation:**

```typescript
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): boolean => {
  return password.length >= 6
}

const sanitizeHtml = (html: string): string => {
  // Use a library like DOMPurify
  return DOMPurify.sanitize(html)
}
```

**API validation:**

Every API endpoint must validate:

- Request body schema (use Zod or similar)
- User authentication (check JWT token)
- User authorization (check permissions)
- Rate limiting (prevent abuse)

### XSS PREVENTION

**Rules:**

- Never use `dangerouslySetInnerHTML` unless absolutely necessary
- If you must render HTML, sanitize with DOMPurify
- Escape all user-generated content before displaying
- Use Content Security Policy headers

**Example:**

```typescript
// Bad - vulnerable to XSS
<div>{testimonial.contentText}</div>

// Good - React escapes by default
<div>{testimonial.contentText}</div>

// If you need HTML rendering
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(testimonial.contentHtml) 
}} />
```

### AUTHENTICATION

**Supabase handles authentication.** Follow these patterns:

**Protected routes:**

```typescript
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated, loading } = useAuth()
  
  if (loading) return <LoadingSpinner />
  if (!isAuthenticated) return <Navigate to="/login" />
  
  return <>{children}</>
}
```

**Session management:**

- Sessions expire after 7 days (Supabase default)
- Refresh tokens automatically handled by Supabase
- On logout, clear all local state

### API KEYS

**Never expose API keys in client code.**

**Good - using environment variables:**

```typescript
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY
})
```

**Bad - hardcoded keys:**

```typescript
const openai = new OpenAI({
  apiKey: 'sk-proj-...' // NEVER DO THIS
})
```

**For production:**

- Store secrets in Vercel environment variables
- Rotate API keys regularly (quarterly)
- Monitor usage for anomalies

### RATE LIMITING

**Prevent abuse:**

- Login attempts: 5 per 15 minutes per IP
- API calls: 100 per minute per user
- Widget embeds: 1000 per hour per widget ID
- File uploads: 10 per hour per user

**Implementation:**
Use Cloudflare Workers rate limiting or implement in backend:

```typescript
const rateLimiter = new Map<string, { count: number; resetAt: number }>()

function checkRateLimit(userId: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimiter.get(userId)
  
  if (!record || now > record.resetAt) {
    rateLimiter.set(userId, { count: 1, resetAt: now + windowMs })
    return true
  }
  
  if (record.count >= limit) {
    return false
  }
  
  record.count++
  return true
}
```

---

## CODE REVIEW STANDARDS

Every pull request must be reviewed by at least one other developer (or carefully by the AI assistant if working solo).

### REVIEW CHECKLIST

**Functionality:**

- [ ] Feature works as described
- [ ] Edge cases handled
- [ ] Error states handled
- [ ] Loading states implemented

**Code Quality:**

- [ ] TypeScript types correct
- [ ] No `any` types (unless commented why)
- [ ] Functions are pure when possible
- [ ] No unnecessary complexity

**Performance:**

- [ ] No unnecessary re-renders
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size impact acceptable
- [ ] Database queries efficient

**Security:**

- [ ] User input validated
- [ ] No sensitive data exposed
- [ ] Authentication/authorization correct
- [ ] No SQL injection risks

**Testing:**

- [ ] Tests added for new features
- [ ] All tests pass
- [ ] No console errors or warnings

**Documentation:**

- [ ] Complex logic commented
- [ ] README updated if needed
- [ ] Type definitions exported if reusable

### COMMIT MESSAGE STANDARDS

**Format:**

```text
type: brief description (max 50 chars)

Longer explanation if needed (wrap at 72 chars).
Explain what changed and why, not how (the code shows how).
```

**Types:**

- `feat:` New feature
- `fix:` Bug fix
- `refactor:` Code restructuring (no behavior change)
- `perf:` Performance improvement
- `test:` Adding or updating tests
- `docs:` Documentation changes
- `chore:` Maintenance tasks (dependencies, config)

**Examples:**

Good:

```text
feat: add AI-powered quality scoring

Integrated OpenAI to automatically score testimonial quality
based on specificity, detail, and credibility indicators.
Quality scores are stored in the database and displayed in the UI.
```

Bad:

```text
Updated files
```

---

## DOCUMENTATION STANDARDS

Code should be self-documenting, but complex logic needs comments.

### WHEN TO COMMENT

**Comment:**

- Complex algorithms (explain the approach)
- Business logic (explain the business rule)
- Workarounds (explain why and link to issue)
- Non-obvious code (if it took you time to understand, comment it)

**Don't comment:**

- Obvious code (`// increment counter` above `counter++`)
- Variable names (good names are self-documenting)
- Every line (noisy, hard to maintain)

### COMMENT STYLE

**Good comments:**

```typescript
// Calculate quality score based on multiple factors:
// - Length (50-500 words is optimal)
// - Specificity (mentions metrics, job titles)
// - Sentiment (positive language)
// Returns 0.0-1.0 where 1.0 is highest quality
function calculateQualityScore(text: string): number {
  // implementation
}
```

**Bad comments:**

```typescript
// This function calculates the score
function calculateQualityScore(text: string): number {
  // Loop through text
  for (const word of text.split(' ')) {
    // Increment counter
    counter++
  }
}
```

### README DOCUMENTATION

Every feature module should have a README explaining:

- What it does (purpose)
- How to use it (API/interface)
- Important considerations (gotchas, limitations)

**Example:**

```markdown
# Testimonial Quality Scoring

Automatically scores testimonials from 0.0 to 1.0 based on quality indicators.

## Usage

    ```typescript
    import { calculateQualityScore } from './scoring'

    const score = await calculateQualityScore(testimonial.contentText)
    // Returns: 0.0-1.0
    ```

## Scoring Factors

- Length: 50-500 words is optimal
- Specificity: Mentions metrics, job titles, specific results
- Sentiment: Positive, enthusiastic language
- Structure: Well-formatted, coherent

## Limitations

- Currently English only
- May miss sarcasm or irony
- Requires at least 10 words to score accurately
```

---

## ACCESSIBILITY STANDARDS

Wallify must be usable by everyone, including users with disabilities.

### KEYBOARD NAVIGATION

**All interactive elements must be keyboard accessible:**

- Tab to navigate between elements
- Enter/Space to activate buttons
- Escape to close modals/dropdowns
- Arrow keys for menus and lists

**Implementation:**

```typescript
// Good - keyboard accessible
<button
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick()
    }
  }}
>
  Click me
</button>

// Better - use semantic HTML (automatically accessible)
<button onClick={handleClick}>
  Click me
</button>
```

### FOCUS MANAGEMENT

**Visible focus indicators:**

```typescript
// All interactive elements need focus styles
<button className="focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2">
  Button
</button>
```

**Focus trap in modals:**
When a modal opens, focus should:

1. Move to the modal
2. Be trapped within the modal (Tab cycles through modal elements only)
3. Return to the trigger element when closed

### SEMANTIC HTML

**Use the right elements:**

- `<button>` for actions (not `<div onClick>`)
- `<a>` for navigation (not `<span onClick>`)
- `<nav>` for navigation menus
- `<main>` for main content
- `<header>` for page header
- `<footer>` for page footer

### ARIA LABELS

**When to use:**

- Icons without text (`aria-label="Close"`)
- Buttons with only icons (`aria-label="Delete testimonial"`)
- Loading states (`aria-live="polite"`)
- Error messages (`role="alert"`)

**Example:**

```typescript
<button
  onClick={handleDelete}
  aria-label="Delete testimonial"
  className="p-2 text-red-600 hover:bg-red-50"
>
  <TrashIcon className="w-5 h-5" />
</button>
```

### COLOR CONTRAST

**Minimum ratios:**

- Normal text (< 18px): 4.5:1
- Large text (≥ 18px): 3:1
- Interactive elements: 3:1

**Test with tools:**

- Chrome DevTools Lighthouse
- WAVE browser extension
- Axe DevTools

### SCREEN READER SUPPORT

**Test with:**

- NVDA (Windows, free)
- JAWS (Windows, paid)
- VoiceOver (Mac, built-in)

**Best practices:**

- Provide alt text for all images
- Use descriptive link text (not "click here")
- Announce dynamic content changes
- Provide skip links for navigation

---

## FINAL CHECKLIST

Before considering any feature complete, verify:

### FUNCTIONALITY

- [ ] Feature works on Chrome, Firefox, Safari
- [ ] Feature works on desktop and mobile
- [ ] All edge cases handled
- [ ] Error states display helpful messages
- [ ] Loading states show during async operations

### PERFORMANCE

- [ ] Page loads in < 2 seconds
- [ ] No console errors or warnings
- [ ] Images optimized and lazy-loaded
- [ ] Bundle size impact acceptable (< 50KB added)
- [ ] No unnecessary re-renders

### ACCESSIBILITY

- [ ] Keyboard navigable
- [ ] Focus indicators visible
- [ ] Color contrast sufficient
- [ ] Screen reader friendly
- [ ] ARIA labels where needed

### SECURITY

- [ ] User input validated
- [ ] No XSS vulnerabilities
- [ ] No exposed secrets
- [ ] Rate limiting implemented
- [ ] Authentication/authorization correct

### CODE QUALITY

- [ ] TypeScript types correct
- [ ] Components under 200 lines
- [ ] Functions under 50 lines
- [ ] Clear variable names
- [ ] Complex logic commented

### TESTING

- [ ] Unit tests for logic
- [ ] Integration tests for API calls
- [ ] All tests pass
- [ ] No flaky tests

### DOCUMENTATION

- [ ] README updated if needed
- [ ] Complex logic commented
- [ ] Type definitions exported
- [ ] Examples provided if reusable

---

## CONTINUOUS IMPROVEMENT

This document is not static. As we learn better patterns, encounter new challenges, and discover better tools, we update this guide.

**How to propose changes:**

1. Identify a pattern that consistently causes problems
2. Research best practices
3. Propose a new standard with rationale
4. Update this document
5. Communicate to team

**Review schedule:**

- Monthly: Quick review for obvious gaps
- Quarterly: Deep review of all standards
- After major incidents: Update relevant sections

---

## CONCLUSION

These standards exist to make Wallify the best testimonial platform on Earth. Follow them not because they're rules, but because they produce excellent software.

When in doubt, ask: "Does this make the product faster, more reliable, or more delightful for users?"

If yes, do it.
If no, don't.

Every decision—technical, design, business—must pass this test
