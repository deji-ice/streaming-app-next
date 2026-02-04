# Phase 2: Authentication Setup Guide

## Prerequisites

1. **Supabase Project**
   - Create account at [supabase.com](https://supabase.com)
   - Create a new project
   - Note your project URL and API keys

2. **OAuth Providers (Optional)**
   - Google OAuth: [Google Cloud Console](https://console.cloud.google.com)
   - GitHub OAuth: [GitHub Developer Settings](https://github.com/settings/developers)

## Step 1: Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
# Supabase - Get from Project Settings > API
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# NextAuth - Generate secret with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here

# Optional: Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Optional: GitHub OAuth
GITHUB_ID=your-github-app-id
GITHUB_SECRET=your-github-app-secret
```

## Step 2: Database Setup

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the entire contents of `supabase-schema.sql`
4. Paste and run in SQL Editor
5. Verify tables created in **Table Editor**

Expected tables:

- `profiles` - User profile information
- `watchlist` - User's saved movies/series
- `watch_history` - Continue watching data
- `favorites` - User's favorite content
- `user_ratings` - User reviews and ratings

## Step 3: Configure OAuth Providers (Optional)

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** > **Create Credentials** > **OAuth 2.0 Client ID**
5. Add authorized redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-project.supabase.co/auth/v1/callback`
6. Copy Client ID and Secret to `.env.local`

### GitHub OAuth

1. Go to [GitHub Settings > Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Application name: `StreamScapeX`
   - Homepage URL: `http://localhost:3000`
   - Authorization callback URL: `https://your-project.supabase.co/auth/v1/callback`
4. Copy Client ID and Secret to `.env.local`

### Configure in Supabase

1. Go to **Authentication** > **Providers**
2. Enable **Google** and **GitHub**
3. Paste your OAuth credentials
4. Save changes

## Step 4: Test Authentication

1. Start development server:

   ```bash
   pnpm dev
   ```

2. Click the user icon in navbar
3. Test sign up with email
4. Check email for confirmation link
5. Test sign in
6. Test OAuth providers (if configured)

## Features Implemented

### ✅ Glassmorphism Auth Modal

- Beautiful backdrop blur effect
- Smooth animations
- Sign up / Sign in toggle
- Email/password authentication
- OAuth providers (Google, GitHub)

### ✅ Security Features

- Row Level Security (RLS) enabled
- Users can only access their own data
- Server-side token handling
- Secure cookie-based sessions

### ✅ Database Schema

- User profiles with auto-creation
- Watchlist for saved content
- Watch history for "Continue Watching"
- Favorites for quick access
- User ratings and reviews

## Next Steps (Phase 3)

After authentication is working:

- [ ] Implement "Add to Watchlist" functionality
- [ ] Create "Continue Watching" section
- [ ] Add user profile page
- [ ] Implement favorites system
- [ ] Add rating/review features
- [ ] Create user dashboard

## Troubleshooting

### "Invalid API Key"

- Check your Supabase URL and keys in `.env.local`
- Ensure no extra spaces or quotes
- Restart dev server after changing env vars

### OAuth not working

- Verify redirect URLs match exactly
- Check OAuth credentials are correct
- Ensure providers are enabled in Supabase dashboard

### Database errors

- Verify SQL schema ran successfully
- Check RLS policies are enabled
- Look at Supabase logs in dashboard

## Support

For issues or questions:

- Check Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- NextAuth docs: [next-auth.js.org](https://next-auth.js.org)
