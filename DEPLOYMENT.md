# Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

1. **Install Vercel CLI** (optional, or use web interface):
   ```bash
   npm install -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```
   Or visit [vercel.com](https://vercel.com) and:
   - Sign up/login with GitHub
   - Click "New Project"
   - Import your repository
   - Vercel will auto-detect Vite and deploy

3. **Your app will be live** at a URL like: `your-app-name.vercel.app`

### Option 2: Netlify

1. Visit [netlify.com](https://netlify.com)
2. Sign up/login with GitHub
3. Click "Add new site" → "Import an existing project"
4. Connect your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Click "Deploy site"

### Option 3: GitHub Pages

1. Install gh-pages:
   ```bash
   npm install --save-dev gh-pages
   ```

2. Add to `package.json`:
   ```json
   "homepage": "https://yourusername.github.io/running-training-planner",
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. Deploy:
   ```bash
   npm run deploy
   ```

### Option 4: Cloudflare Pages

1. Visit [pages.cloudflare.com](https://pages.cloudflare.com)
2. Connect your GitHub repository
3. Build settings:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Build output directory: `dist`

## Data Persistence Risk

⚠️ **IMPORTANT**: Your app currently uses **localStorage**, which means:

### Data Storage Location
- Data is stored **only in the user's browser** on their device
- Data is **NOT stored on a server**
- Data is **NOT synced across devices**

### Risks of Data Loss
Your data can be deleted if:
1. ✅ User clears browser cache/cookies
2. ✅ User uses incognito/private browsing mode
3. ✅ User switches to a different browser
4. ✅ User switches to a different device
5. ✅ Browser storage quota is exceeded
6. ✅ User uninstalls the browser
7. ✅ Browser data is corrupted
8. ✅ User's device is reset/reformatted

### Recommendations

**For better data persistence, consider:**

1. **Add a backend database** (Firebase, Supabase, MongoDB Atlas)
2. **Add user authentication** (so data is tied to user accounts)
3. **Add data export feature** (let users download their data as JSON)
4. **Add data import feature** (let users restore from backup)

### Quick Improvement: Add Export/Import

I can add export/import functionality so users can:
- Download their workout data as a JSON file
- Upload/restore their data from a backup file

This would provide a backup solution without needing a backend.

Would you like me to add export/import functionality?

