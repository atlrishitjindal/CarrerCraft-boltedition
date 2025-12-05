# CareerCraft AI

A production-grade, AI-powered SaaS platform for career optimization, resume enhancement, and intelligent job matching. Built with React, TypeScript, Node.js, Express, and Supabase.

## Features

### AI-Powered Intelligence
- **Resume Analysis**: GPT-4 powered resume analysis with ATS scoring and improvement suggestions
- **Skills Gap Identification**: AI identifies missing skills based on target roles and market demand
- **Job Matching**: Intelligent matching algorithm pairs candidates with suitable opportunities
- **Cover Letter Generation**: Auto-generate personalized cover letters for each application
- **Interview Preparation**: AI-generated interview questions with expert answers

### User Features
- Secure authentication with JWT and role-based access
- Resume upload and management
- Real-time job matching
- Application tracking and management
- Email tracking for job responses
- Comprehensive analytics dashboard
- Stripe subscription billing

### Employer Features
- Post and manage job listings
- View matched candidates
- Applicant ranking by compatibility
- Candidate profile summaries

### Admin Features
- User management
- Job posting oversight
- Subscription management
- Platform analytics

## Tech Stack

### Frontend
- React 18 + Vite
- TypeScript
- TailwindCSS
- Radix UI + ShadCN UI
- Framer Motion
- React Router 6
- React Query
- Recharts
- Axios

### Backend
- Node.js + Express + TypeScript
- Supabase (Postgres + Auth + Storage)
- Row Level Security (RLS)
- OpenAI GPT-4 API
- Stripe Payments
- Nodemailer
- JWT Authentication
- Zod Validation

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account
- OpenAI API key (for AI features)
- Stripe account (for payments)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd careercraft-ai
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your credentials:
```env
# Supabase
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Server
PORT=3001
NODE_ENV=development

# JWT
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_BASIC_PRICE_ID=price_id
STRIPE_PRO_PRICE_ID=price_id
STRIPE_ENTERPRISE_PRICE_ID=price_id

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password

# Frontend
FRONTEND_URL=http://localhost:5173
```

### Database Setup

The database schema is automatically applied via Supabase migrations. The schema includes:
- Users table with role-based access
- Resumes with AI analysis data
- Jobs postings
- Job matches with compatibility scores
- Activity tracking
- Email logs
- Subscriptions

All tables have Row Level Security (RLS) enabled for data protection.

### Running the Application

#### Development Mode

1. Start the backend server:
```bash
npm run server
```

2. Start the frontend (in a new terminal):
```bash
npm run dev
```

3. Open http://localhost:5173 in your browser

#### Production Build

```bash
npm run build
npm run preview
```

## Project Structure

```
careercraft-ai/
├── server/                 # Backend Express server
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middleware/        # Auth, validation, error handling
│   ├── routes/           # API routes
│   ├── services/         # AI, email, PDF services
│   ├── types/            # TypeScript types
│   └── utils/            # Validators and utilities
├── src/                   # Frontend React app
│   ├── components/       # Reusable UI components
│   │   └── ui/          # ShadCN UI components
│   ├── contexts/        # React contexts (Auth)
│   ├── lib/             # Utilities and API client
│   ├── pages/           # Page components
│   │   └── Dashboard/   # Dashboard pages
│   └── App.tsx          # Main app component
└── supabase/            # Supabase migrations (auto-managed)
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new account
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/profile` - Get user profile

### Resumes
- `POST /api/resumes/upload` - Upload resume
- `GET /api/resumes` - Get all resumes
- `POST /api/resumes/:id/analyze` - AI analysis
- `POST /api/resumes/:id/improve` - AI improvement
- `POST /api/resumes/:id/skills-gap` - Skills gap analysis
- `DELETE /api/resumes/:id` - Delete resume

### Jobs
- `POST /api/jobs` - Create job (employer only)
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/:id` - Get job details
- `PUT /api/jobs/:id` - Update job
- `DELETE /api/jobs/:id` - Delete job
- `GET /api/jobs/:id/applicants` - View applicants

### Matches
- `POST /api/matches/match-jobs` - Find job matches
- `GET /api/matches` - Get all matches
- `POST /api/matches/:id/cover-letter` - Generate cover letter
- `POST /api/matches/:id/interview-questions` - Generate interview prep
- `POST /api/matches/:id/apply` - Apply to job
- `PATCH /api/matches/:id/status` - Update status

### Payments
- `POST /api/stripe/create-checkout-session` - Create subscription
- `POST /api/stripe/webhook` - Stripe webhooks

## Security Features

- JWT-based authentication with refresh tokens
- Row Level Security (RLS) on all database tables
- Role-based access control (user, employer, admin)
- Secure password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation with Zod
- CORS protection
- Helmet security headers

## AI Integration

The platform uses OpenAI's GPT-4 API for:
- Resume analysis and scoring
- Improvement suggestions
- Skills gap identification
- Job matching logic
- Cover letter generation
- Interview question preparation

All AI features gracefully handle API failures with fallback responses.

## Subscription Tiers

- **Free**: Basic features, limited job matches
- **Basic**: Enhanced AI features, unlimited matches
- **Pro**: Priority matching, advanced analytics
- **Enterprise**: Custom solutions, dedicated support

## Contributing

This is a production-grade template. To extend:
1. Add new pages in `src/pages/`
2. Create new API endpoints in `server/routes/`
3. Implement controllers in `server/controllers/`
4. Add database tables via Supabase migrations

## License

Private - All rights reserved

## Support

For support, contact support@careercraft.ai

---

Built with care by the CareerCraft AI team.
