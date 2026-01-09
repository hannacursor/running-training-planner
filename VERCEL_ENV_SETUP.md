# Setting Up Environment Variables in Vercel

## Step 1: Go to Your Vercel Project

1. Go to [vercel.com](https://vercel.com) and sign in
2. Find your **running-training-planner** project
3. Click on it to open the project dashboard

## Step 2: Add Environment Variables

1. Click on **"Settings"** tab (top navigation)
2. Click on **"Environment Variables"** in the left sidebar
3. Click **"Add New"** button

### Add First Variable:
- **Key**: `VITE_SUPABASE_URL`
- **Value**: `https://bmhfdehbwivzspcvhowf.supabase.co`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

### Add Second Variable:
- **Key**: `VITE_SUPABASE_ANON_KEY`
- **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJtaGZkZWhid2l2enNwY3Zob3dmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc3NDQzODgsImV4cCI6MjA4MzMyMDM4OH0.9_ndXb37Y_f6iEEm9884qKkUHuZgznB9Qt5T4w1b7U4`
- **Environment**: Select all (Production, Preview, Development)
- Click **"Save"**

## Step 3: Redeploy

After adding the environment variables:

1. Go to the **"Deployments"** tab
2. Find your latest deployment
3. Click the **"..."** (three dots) menu
4. Click **"Redeploy"**
5. Make sure **"Use existing Build Cache"** is checked (optional, faster)
6. Click **"Redeploy"**

## Step 4: Verify

After redeployment completes:
1. Visit your production URL
2. Log in
3. Your workouts from Supabase should now appear!

The environment variables are now set for all future deployments.

