# NC Tax Deed Property Tracker - Complete Migration Plan

## Overview

This guide will help you migrate your NC Tax Deed Property Tracker from the Manus development environment to independent production hosting.

**Good News:** You do NOT need to rebuild everything! 95% of your application is portable and ready to deploy.

**Time Estimate:** 3-6 hours total

**Difficulty Level:** Intermediate (you can do this!)

---

## What Stays The Same (95% of your app)

✅ All 18 scrapers - Zero changes needed
✅ Database schema - Exact same tables
✅ All 752 properties and team data
✅ Frontend React app - All pages, components
✅ tRPC API - All endpoints
✅ Business logic - Filtering, team features
✅ Map integration, Statistics, CSV exports

## What Needs to Change (5% of your app)

⚠️ Authentication system (replace Manus OAuth)
⚠️ Environment variables (set manually)
⚠️ Deployment configuration

---

## Authentication Options

### Option A: Simple Email Whitelist (RECOMMENDED)
- Difficulty: Easy (30 minutes)
- Cost: Free
- Best for: Internal team tools
- Users enter email, system checks whitelist, no passwords

### Option B: Email/Password
- Difficulty: Medium (2-3 hours)
- Cost: Free
- Traditional username/password with JWT

### Option C: Third-Party Auth (Clerk/Auth0)
- Difficulty: Easy (1 hour)
- Cost: $0-25/month
- Professional drop-in solution

### Option D: Google OAuth
- Difficulty: Medium (2-3 hours)
- Cost: Free
- "Sign in with Google" button

**Recommendation:** Start with Option A (Email Whitelist) for internal use.

---

## Hosting Provider Comparison

| Provider | Cost/Month | Difficulty | Database | Best For |
|----------|------------|------------|----------|----------|
| Railway | $20-25 | Easiest | ✅ Included | Beginners |
| Render | $32 | Easy | ✅ Included | Balanced |
| DigitalOcean | $39 | Medium | ✅ Included | More control |
| AWS | $30 | Hard | ❌ Separate | Advanced |
| Hetzner VPS | $6-12 | Hardest | ❌ Self-install | Budget experts |

**Recommendation:** Railway Pro ($20/month) - easiest setup, includes database.

---

## Migration Phases

### Phase 1: Preparation (30 minutes)
1. Export database (already done: `database_export.sql`)
2. Download code from Manus
3. Create GitHub repository
4. Push code to GitHub

### Phase 2: Set Up Hosting (15 minutes)
1. Create Railway account
2. Connect GitHub repository
3. Railway auto-deploys!

### Phase 3: Set Up Database (15 minutes)
1. Add PostgreSQL in Railway dashboard
2. Import your data: `psql DATABASE_URL < database_export.sql`
3. Verify import

### Phase 4: Replace Authentication (30 min - 3 hours)
1. Choose auth method
2. Implement auth code (see detailed instructions below)
3. Test login/logout

### Phase 5: Configure Environment (15 minutes)
1. Set DATABASE_URL in Railway
2. Generate and set JWT_SECRET
3. Set NODE_ENV=production

### Phase 6: Deploy & Test (1-2 hours)
1. Push auth changes to GitHub
2. Railway auto-deploys
3. Test all features thoroughly

### Phase 7: Set Up Automated Scraping (30 minutes)
1. Add node-cron scheduler
2. Configure 3x daily scraping (8 AM, 1 PM, 6 PM)
3. Verify in logs

---

## Detailed: Email Whitelist Authentication

### Step 1: Create Whitelist Config

Create `server/config/whitelist.ts`:

```typescript
export const AUTHORIZED_EMAILS = [
  'roger@example.com',  // Replace with real emails
  'trey@example.com',
];

export function isAuthorized(email: string): boolean {
  return AUTHORIZED_EMAILS.includes(email.toLowerCase().trim());
}
```

### Step 2: Create Auth Router

Create `server/routers/simpleAuth.ts`:

```typescript
import { z } from 'zod';
import { publicProcedure, router } from '../_core/trpc';
import { isAuthorized } from '../config/whitelist';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'change-this';

export const simpleAuthRouter = router({
  login: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input, ctx }) => {
      const email = input.email.toLowerCase().trim();
      
      if (!isAuthorized(email)) {
        throw new Error('Email not authorized');
      }
      
      const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '30d' });
      
      ctx.res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });
      
      return { success: true };
    }),
  
  me: publicProcedure.query(({ ctx }) => {
    const token = ctx.req.cookies.auth_token;
    if (!token) return null;
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      return { email: decoded.email };
    } catch {
      return null;
    }
  }),
  
  logout: publicProcedure.mutation(({ ctx }) => {
    ctx.res.clearCookie('auth_token');
    return { success: true };
  }),
});
```

### Step 3: Update Main Router

Edit `server/routers.ts`:

```typescript
import { simpleAuthRouter } from './routers/simpleAuth';

export const appRouter = router({
  auth: simpleAuthRouter,  // Replace Manus auth
  // ... rest of routers
});
```

### Step 4: Create Login Page

Create `client/src/pages/Login.tsx`:

```typescript
import { useState } from 'react';
import { useNavigate } from 'wouter';
import { trpc } from '@/lib/trpc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Login() {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const loginMutation = trpc.auth.login.useMutation({
    onSuccess: () => navigate('/'),
    onError: (error) => alert(error.message),
  });

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form onSubmit={(e) => {
        e.preventDefault();
        loginMutation.mutate({ email });
      }}>
        <Input
          type="email"
          placeholder="your.email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit">Login</Button>
      </form>
    </div>
  );
}
```

### Step 5: Install Dependencies

```bash
npm install jsonwebtoken cookie-parser
npm install --save-dev @types/jsonwebtoken @types/cookie-parser
```

### Step 6: Generate JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Add to Railway environment variables:
```
JWT_SECRET=your-generated-secret-here
```

---

## Detailed: Automated Scraping Setup

### Install node-cron

```bash
npm install node-cron
npm install --save-dev @types/node-cron
```

### Create Scheduler

Create `server/scheduler.ts`:

```typescript
import cron from 'node-cron';
import { ScraperService } from './scraperService';

const scraperService = new ScraperService();

export function startScheduler() {
  // 8 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('[Scheduler] Running 8 AM scrape...');
    await scraperService.scrapeAll();
  });
  
  // 1 PM
  cron.schedule('0 13 * * *', async () => {
    console.log('[Scheduler] Running 1 PM scrape...');
    await scraperService.scrapeAll();
  });
  
  // 6 PM
  cron.schedule('0 18 * * *', async () => {
    console.log('[Scheduler] Running 6 PM scrape...');
    await scraperService.scrapeAll();
  });
  
  console.log('[Scheduler] Automated scraping: 8 AM, 1 PM, 6 PM daily');
}
```

### Start Scheduler in Server

Edit `server/_core/index.ts`:

```typescript
import { startScheduler } from '../scheduler';

// After server setup
if (process.env.NODE_ENV === 'production') {
  startScheduler();
}
```

---

## Environment Variables Needed

```bash
# Database (Railway provides this automatically)
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-generated-secret-here

# Application
NODE_ENV=production
PORT=3000
```

---

## Testing Checklist

After deployment, test:

- [ ] Login with authorized email works
- [ ] Login with unauthorized email fails
- [ ] Properties page loads (752 properties)
- [ ] Filters work (county, status, bid range)
- [ ] Sorting works on all columns
- [ ] Property details dialog opens
- [ ] Team features work (check-out, notes, ARV)
- [ ] Favorites work
- [ ] Map loads with pins
- [ ] Statistics page loads
- [ ] CSV exports work
- [ ] Manual scraper runs work from Admin Panel
- [ ] Automated scraping runs at scheduled times

---

## Troubleshooting

### "Cannot connect to database"
- Check DATABASE_URL is set correctly
- Verify database is running in Railway dashboard

### "JWT_SECRET not defined"
- Generate secret and add to Railway environment variables
- Restart application

### "Scrapers timing out"
- Upgrade to Railway Pro (more memory)
- Check source websites aren't blocking you

### "Properties duplicating"
- Check parcelId is captured correctly
- Verify deduplication logic in scraperService.ts

---

## Cost Summary

**Monthly Costs:**
- Railway Pro: $20-25/month (hosting + database)
- Total: $20-25/month

**One-Time Costs:**
- Custom domain (optional): $12/year

---

## Support Resources

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Your project docs: README.md, userGuide.md

---

## You Can Do This!

This migration is straightforward. Thousands of developers do this every day. Take it one step at a time:

1. Read this plan thoroughly
2. Choose auth method (Email Whitelist recommended)
3. Choose hosting (Railway recommended)
4. Set aside 3-6 hours
5. Follow phases sequentially
6. Test thoroughly
7. Celebrate! 🎉

**Your scrapers, data, and features are ready to go. You just need to swap auth and deploy!**

Good luck! 🚀
