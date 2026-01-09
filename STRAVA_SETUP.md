# Strava API Integration Setup

## Overview

This integration allows your running training plan to automatically sync with your Strava activities. When you complete a run and log it to Strava, the plan will automatically:
- Update the "Actual" mileage to match your Strava activity
- Mark the workout as completed

## Step 1: Create Strava App

1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Click **"Create App"** or **"My API Application"**
3. Fill in:
   - **Application Name**: Running Training Planner
   - **Category**: Training
   - **Club**: (leave blank)
   - **Website**: Your Vercel URL (e.g., `https://your-app.vercel.app`)
   - **Authorization Callback Domain**: 
     - For local dev: `localhost`
     - For production: Your Vercel domain (e.g., `your-app.vercel.app`)
4. Click **"Create"**
5. **Save these values:**
   - **Client ID** (you'll see this immediately)
   - **Client Secret** (click "Show" to reveal it)

## Step 2: Add Strava Credentials to Environment

### For Local Development (.env.local):
Add these lines to your `.env.local` file:
```env
VITE_STRAVA_CLIENT_ID=your-client-id
VITE_STRAVA_CLIENT_SECRET=your-client-secret
VITE_STRAVA_REDIRECT_URI=http://localhost:5173
```

**Note:** The redirect URI should be your base URL (without `/auth/strava/callback`) - the app will handle the callback route automatically.

### For Vercel Production:
1. Go to Vercel → Your Project → Settings → Environment Variables
2. Add these variables:
   - `VITE_STRAVA_CLIENT_ID` = your-client-id
   - `STRAVA_CLIENT_SECRET` = your-client-secret (Note: different name for server-side)
   - `VITE_STRAVA_REDIRECT_URI` = https://your-app.vercel.app

**Important:** 
- `VITE_STRAVA_CLIENT_SECRET` is used in the frontend (for display purposes only)
- `STRAVA_CLIENT_SECRET` (without VITE_ prefix) is used in the serverless function and should be kept secret

## Step 3: Update Strava App Settings

In your Strava app settings, add these **Authorization Callback Domains**:
- `localhost` (for development)
- `your-vercel-domain.vercel.app` (for production)

## Step 4: Deploy to Vercel

The API routes (`/api/strava/token.ts` and `/api/strava/refresh.ts`) are Vercel serverless functions that will automatically be deployed when you push to Vercel. No additional dependencies are required.

## How It Works

1. **Connect Strava**: User clicks "Connect Strava" button in the app
2. **OAuth Flow**: App redirects to Strava OAuth authorization page
3. **Authorization**: User authorizes the app to access their activities
4. **Callback**: Strava redirects back with an authorization code
5. **Token Exchange**: Serverless function exchanges code for access token (requires client secret)
6. **Token Storage**: Access token stored in browser localStorage
7. **Sync Activities**: User clicks "Sync Activities Now" to fetch activities from Strava
8. **Matching**: App matches Strava activities to planned workouts by date
9. **Auto-Update**: Updates workout's actual mileage and marks as completed

## API Scopes Needed

The app requests these Strava permissions:
- `activity:read` - To read your activities
- `activity:read_all` - To read all activities (including private ones)

## Usage

1. **Connect**: Click "Connect Strava" and authorize the app
2. **Sync**: Click "Sync Activities Now" to fetch and match your recent runs
3. **Automatic Updates**: Your workouts will be updated with actual mileage and marked as completed

## Token Management

- Access tokens expire after 6 hours
- Refresh tokens are used automatically to get new access tokens
- Tokens are stored securely in browser localStorage
- You can disconnect Strava at any time using the "Disconnect" button

## Troubleshooting

- **"No valid Strava token"**: Make sure you've connected Strava first
- **"Failed to sync"**: Check that your Strava app is properly configured and tokens are valid
- **Activities not matching**: Ensure your Strava activities are logged on the same date as your planned workouts

