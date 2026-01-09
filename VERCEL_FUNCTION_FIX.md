# Fixing Vercel 404 for Serverless Functions

## The Problem
Vercel is returning 404 NOT_FOUND for `/api/strava/token` endpoint.

## Solution Steps

### Step 1: Check Vercel Project Settings

1. Go to Vercel Dashboard → Your Project → Settings
2. Check **Framework Preset** - should be "Vite" or "Other"
3. Verify **Root Directory** is set correctly (should be `/` or empty)

### Step 2: Verify Functions Are Detected

1. Go to Vercel Dashboard → Your Project → **Functions** tab
2. Look for `/api/strava/token` and `/api/strava/refresh` in the list
3. If they're NOT listed, Vercel isn't detecting them

### Step 3: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the build logs for any errors related to:
   - TypeScript compilation
   - `/api` directory
   - Serverless functions

### Step 4: Ensure API Directory Structure

The functions should be at:
```
/api/strava/token.ts
/api/strava/refresh.ts
```

NOT in:
- `/src/api/` ❌
- `/dist/api/` ❌

### Step 5: Verify Environment Variables

Make sure these are set in Vercel:
- `VITE_STRAVA_CLIENT_ID`
- `STRAVA_CLIENT_SECRET` (no VITE_ prefix)
- `VITE_STRAVA_REDIRECT_URI`

### Step 6: Try Manual Redeploy

1. Go to Deployments
2. Click **⋯** on latest deployment
3. Click **Redeploy**
4. Make sure **"Use existing Build Cache"** = **No**

### Step 7: Check Vercel CLI (Alternative)

If the web interface isn't working, try deploying via CLI:

```bash
npm install -g vercel
vercel --prod
```

This will show you if there are any issues with function detection.

## Common Issues

### Issue: Functions not in Functions tab
**Cause**: Vercel might not be detecting TypeScript files in `/api` for Vite projects
**Solution**: 
- Try renaming to `.js` files (Vercel will still run them)
- Or ensure `@vercel/node` is in dependencies

### Issue: Build succeeds but functions return 404
**Cause**: Functions might not be included in deployment
**Solution**: Check that `/api` directory is not in `.vercelignore` or `.gitignore` in a way that excludes it

### Issue: TypeScript compilation errors
**Cause**: Missing types or dependencies
**Solution**: Ensure `@vercel/node` is in `dependencies` (not `devDependencies`)

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check Vercel Support**: The error ID `pdx1::9zlgd-1767924748487-b65649e19269` can be shared with Vercel support
2. **Try converting to JavaScript**: Temporarily convert the `.ts` files to `.js` to see if that's the issue
3. **Check Vercel Community**: Search for similar issues with Vite + serverless functions

