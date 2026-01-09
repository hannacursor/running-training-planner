# Vercel Environment Variables Setup

## Step 1: Go to Vercel Project Settings

1. Go to [vercel.com](https://vercel.com) and sign in
2. Navigate to your project: **running-training-planner**
3. Click on **Settings** → **Environment Variables**

## Step 2: Add Environment Variables

Add the following environment variables:

### Supabase (Already configured, verify these exist):
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://bmhfdehbwivzspcvhowf.supabase.co`
- **Environment**: Production, Preview, Development

- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaGZkZWhid2l2enNwY3Zob3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDQzODgsImV4cCI6MjA4MzMyMDM4OH0.9_ndXb37Y_f6iEEm9884qKkUHuZgznB9Qt5T4w1b7U4`
- **Environment**: Production, Preview, Development

### Strava Configuration:

1. **VITE_STRAVA_CLIENT_ID**
   - **Value**: `194868`
   - **Environment**: Production, Preview, Development

2. **STRAVA_CLIENT_SECRET** (⚠️ Important: NO `VITE_` prefix for server-side)
   - **Value**: `e53e7b275615c8effcd69d88ae18097f927d2b5a`
   - **Environment**: Production, Preview, Development
   - **Note**: This is used by the serverless functions (`/api/strava/token.ts` and `/api/strava/refresh.ts`)

3. **VITE_STRAVA_REDIRECT_URI**
   - **Value**: Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - **Environment**: Production, Preview, Development
   - **Note**: Replace `your-app` with your actual Vercel project name

## Step 3: Update Strava App Settings

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Find your app (Client ID: 194868)
3. Add your Vercel domain to **Authorization Callback Domain**:
   - Example: `your-app.vercel.app` (without `https://`)
   - Or your custom domain if you have one

## Step 4: Redeploy

After adding environment variables:
1. Go to **Deployments** tab in Vercel
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Or push a new commit to trigger automatic deployment

## Step 5: Test

1. Visit your Vercel deployment URL
2. Log in with admin credentials (hannawintz)
3. Click "Connect Strava"
4. Authorize the app
5. You should see "✓ Connected to Strava"
6. Click "Sync Activities Now" to test

## Troubleshooting

- **"Failed to exchange token"**: Check that `STRAVA_CLIENT_SECRET` (without VITE_) is set correctly
- **"No valid Strava token"**: Make sure you've connected Strava first
- **Redirect errors**: Verify the callback domain in Strava matches your Vercel domain exactly
