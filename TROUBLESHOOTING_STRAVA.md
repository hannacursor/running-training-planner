# Troubleshooting Strava 404 Error

## Issue: 404 Error when connecting to Strava

If you're seeing a 404 error when trying to connect Strava, here are the steps to fix it:

## Step 1: Verify Environment Variables in Vercel

Make sure these are set in Vercel → Settings → Environment Variables:

1. **VITE_STRAVA_CLIENT_ID** = `194868`
2. **STRAVA_CLIENT_SECRET** = `e53e7b275615c8effcd69d88ae18097f927d2b5a` (⚠️ NO `VITE_` prefix)
3. **VITE_STRAVA_REDIRECT_URI** = Your Vercel URL (e.g., `https://your-app.vercel.app`)

**Important**: `STRAVA_CLIENT_SECRET` (without `VITE_`) is used by the serverless functions and must be set separately.

## Step 2: Redeploy After Adding Environment Variables

1. Go to Vercel → Deployments
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
4. Make sure to select "Use existing Build Cache" = **No** to ensure new env vars are picked up

## Step 3: Verify API Routes Are Deployed

1. After redeploying, check the Vercel deployment logs
2. Look for any errors related to `/api/strava/token` or `/api/strava/refresh`
3. The functions should be automatically detected in the `/api` directory

## Step 4: Test the API Endpoint Directly

Try accessing the endpoint directly (this will fail with 400, but confirms it exists):
```bash
curl -X POST https://your-app.vercel.app/api/strava/token \
  -H "Content-Type: application/json" \
  -d '{"code":"test"}'
```

If you get a 400 error (not 404), the endpoint exists and the issue is with the request.
If you get a 404, the endpoint isn't being deployed.

## Step 5: Check Vercel Function Logs

1. Go to Vercel → Your Project → Functions tab
2. Look for `/api/strava/token` and `/api/strava/refresh`
3. Check for any build or runtime errors

## Step 6: Verify File Structure

Make sure these files exist in your repository:
- `/api/strava/token.ts`
- `/api/strava/refresh.ts`

Both should export a default async function handler.

## Common Issues

### Issue: Functions not detected
**Solution**: Make sure the files are in `/api/strava/` directory (not `/src/api/`)

### Issue: Environment variables not accessible
**Solution**: 
- Server-side env vars (used in API routes) should NOT have `VITE_` prefix
- Client-side env vars (used in React) should have `VITE_` prefix
- Redeploy after adding/changing env vars

### Issue: TypeScript compilation errors
**Solution**: Make sure `@vercel/node` is in `dependencies` (not `devDependencies`)

## Still Not Working?

1. Check the browser console for the exact error message
2. Check Vercel deployment logs for build errors
3. Verify the Strava app callback domain matches your Vercel domain exactly
4. Make sure you've authorized the app in Strava (you should be redirected back with a `?code=...` parameter)

