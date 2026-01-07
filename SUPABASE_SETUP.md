# Supabase Backend Setup Guide

## Step 1: Create Supabase Account & Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up for a free account (use GitHub to sign in)
3. Click **"New Project"**
4. Fill in:
   - **Name**: `running-training-planner` (or any name)
   - **Database Password**: Create a strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free
5. Click **"Create new project"** (takes ~2 minutes)

## Step 2: Create Database Table

1. In your Supabase project, go to **"Table Editor"** (left sidebar)
2. Click **"New Table"**
3. Name it: `workouts`
4. Click **"Add Column"** for each field:

   | Column Name | Type | Default Value | Nullable |
   |------------|------|---------------|----------|
   | id | text | (none) | ❌ Primary Key |
   | date | text | (none) | ❌ |
   | planned_mileage | numeric | (none) | ❌ |
   | actual_mileage | numeric | (none) | ✅ |
   | workout_type | text | (none) | ❌ |
   | completed | boolean | false | ❌ |
   | details | text | (none) | ✅ |
   | created_at | timestamp | now() | ❌ |

5. Click **"Save"**

## Step 3: Enable Row Level Security (RLS)

1. Go to **"Authentication"** → **"Policies"**
2. Click on the `workouts` table
3. Click **"New Policy"**
4. Choose **"Enable read access for all users"**
5. Click **"Save"**
6. Click **"New Policy"** again
7. Choose **"Enable insert access for all users"**
8. Click **"Save"**
9. Click **"New Policy"** again
10. Choose **"Enable update access for all users"**
11. Click **"Save"**
12. Click **"New Policy"** again
13. Choose **"Enable delete access for all users"**
14. Click **"Save"**

## Step 4: Get Your API Keys

1. Go to **"Settings"** (gear icon) → **"API"**
2. Copy these values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon/public key** (long string starting with `eyJ...`)

## Step 5: Add Keys to Your App

Create a file called `.env.local` in your project root:

```env
VITE_SUPABASE_URL=your-project-url-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: Add `.env.local` to `.gitignore` to keep your keys secret!

## Step 6: Install Dependencies

```bash
npm install @supabase/supabase-js
```

## That's It!

Once you've completed these steps, the code changes will automatically use Supabase instead of localStorage. Your data will be:
- ✅ Stored in the cloud
- ✅ Accessible from any device
- ✅ Backed up automatically
- ✅ Never lost if you clear browser cache

