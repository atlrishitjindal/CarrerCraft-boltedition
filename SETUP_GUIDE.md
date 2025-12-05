# CareerCraft AI - Setup Guide

## Quick Start Checklist

### 1. Supabase Setup

1. Create a Supabase project at https://supabase.com
2. The database schema has been automatically created
3. Create a storage bucket named `resumes`:
   - Go to Storage in Supabase dashboard
   - Click "New bucket"
   - Name: `resumes`
   - Public: Yes
4. Copy your credentials:
   - Project URL: Settings → API → Project URL
   - Anon key: Settings → API → Project API keys → anon public
   - Service role key: Settings → API → Project API keys → service_role

### 2. OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (you'll only see it once)
4. Add to your .env file

### 3. Stripe Setup

1. Create account at https://stripe.com
2. Get your test API keys:
   - Dashboard → Developers → API keys
   - Copy "Secret key"
3. Create products and prices:
   - Dashboard → Products → Add Product
   - Create: Basic ($9.99/mo), Pro ($29.99/mo), Enterprise ($99.99/mo)
   - Copy each Price ID
4. Set up webhook:
   - Dashboard → Developers → Webhooks
   - Add endpoint: `http://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `customer.subscription.deleted`
   - Copy webhook secret

### 4. Email Setup (Gmail Example)

1. Enable 2FA on your Gmail account
2. Generate App Password:
   - Google Account → Security → 2-Step Verification
   - App passwords → Generate
   - Copy the password
3. Use in EMAIL_PASSWORD in .env

### 5. Environment Variables

Copy `.env.example` to `.env` and fill in all values:

```bash
# Supabase
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Server
PORT=3001
NODE_ENV=development

# JWT (generate random 32+ character strings)
JWT_SECRET=your_super_secret_jwt_key_here_min_32_chars
JWT_REFRESH_SECRET=your_super_secret_refresh_key_here_min_32_chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-...

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_BASIC_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=CareerCraft AI <noreply@careercraft.ai>

# Frontend
FRONTEND_URL=http://localhost:5173
VITE_API_URL=http://localhost:3001/api
```

### 6. Install & Run

```bash
# Install dependencies
npm install

# Run backend server (terminal 1)
npm run server

# Run frontend (terminal 2)
npm run dev
```

Visit http://localhost:5173

### 7. Test the Application

1. Sign up for an account
2. Upload a test resume (PDF or DOCX)
3. Click "Analyze Resume" to see AI features in action
4. Browse job matches
5. Test application flow

## Common Issues

### Issue: Supabase RLS blocking requests
**Solution**: Ensure you're using the service role key in the backend, not the anon key

### Issue: AI features not working
**Solution**: Check that OPENAI_API_KEY is set correctly and you have API credits

### Issue: File uploads failing
**Solution**: Ensure the `resumes` storage bucket exists and is public in Supabase

### Issue: Authentication not working
**Solution**: Verify JWT_SECRET is set and the same across all sessions

### Issue: Emails not sending
**Solution**: For Gmail, ensure 2FA is enabled and you're using an App Password

## Production Deployment

### Frontend (Vercel/Netlify)
1. Push to GitHub
2. Connect to Vercel/Netlify
3. Set environment variables in dashboard
4. Deploy

### Backend (Railway/Render)
1. Create new service
2. Connect GitHub repo
3. Set start command: `npm run server`
4. Add all environment variables
5. Deploy

### Important for Production
- Change NODE_ENV to `production`
- Use production Stripe keys
- Set FRONTEND_URL to your deployed domain
- Enable HTTPS
- Set up proper CORS origins
- Use strong JWT secrets
- Monitor OpenAI API usage and costs

## Features Overview

### For Job Seekers
- Upload resume for AI analysis
- Get ATS score and improvement tips
- Receive skill recommendations
- Find matching jobs automatically
- Auto-apply with AI cover letters
- Prepare for interviews with AI Q&A

### For Employers
- Post job openings
- View matched candidates
- See compatibility scores
- Access candidate profiles
- Manage applications

### For Admins
- Manage all users
- Oversee job postings
- Monitor subscriptions
- View platform analytics

## Next Steps

After basic setup:
1. Customize the landing page with your branding
2. Add more dashboard features
3. Implement additional AI capabilities
4. Set up analytics (Google Analytics, etc.)
5. Add payment success/cancel pages
6. Implement email notifications
7. Add user settings page
8. Create employer and admin dashboards

## Support

Need help? Check:
- README.md for detailed documentation
- Code comments for implementation details
- Supabase docs: https://supabase.com/docs
- OpenAI docs: https://platform.openai.com/docs
- Stripe docs: https://stripe.com/docs
