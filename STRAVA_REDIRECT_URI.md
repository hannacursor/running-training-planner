# Strava Redirect URI Configuration

## Production URL (Use This)
**Domain**: `running-training-planner-nine.vercel.app`

## Strava App Settings
1. Go to [strava.com/settings/api](https://www.strava.com/settings/api)
2. Find your app (Client ID: 194868)
3. Under **Authorization Callback Domain**, add:
   - `running-training-planner-nine.vercel.app` (production)

## Vercel Environment Variables
In Vercel → Settings → Environment Variables, set:
- **VITE_STRAVA_REDIRECT_URI** = `https://running-training-planner-nine.vercel.app`

## Optional: Preview Deployments
If you want to test on preview deployments, you can also add:
- `running-training-planner-git-main-hanna-4948s-projects.vercel.app`
- `running-training-planner-jphojmzpu-hanna-4948s-projects.vercel.app`

But the main one you need is the production URL.

## Important Notes
- **No `https://`** in the Strava callback domain field
- **Include `https://`** in the Vercel environment variable
- After updating, you may need to reconnect Strava for the changes to take effect

