# Supabase RLS Setup with Authentication

Since you now have authentication in your app, you should set up RLS (Row Level Security) in Supabase to match your permission system.

## Current Setup

Your app has:
- **Admin user** (`hannawintz`) - can edit everything
- **Viewer user** (`guest`) - view only

## Option 1: Simple Public Access (Current - Works for Now)

Since your app handles permissions on the frontend, you can keep the simple RLS policies we set up earlier. The frontend will prevent guests from editing, but the database will allow all operations.

**This is fine for now**, but for better security, use Option 2.

## Option 2: User-Based RLS (More Secure - Recommended)

To properly secure the database, you'll need to:

### Step 1: Add User Tracking to Database

Add a column to track who created each workout:

1. Go to **Table Editor** → `workouts` table
2. Click **"Add Column"**
3. Add:
   - **Column name**: `created_by` (text, nullable for now)
   - This will track which user created the workout

### Step 2: Update RLS Policies

Go to **Authentication** → **Policies** → `workouts` table

**Delete existing policies** and create these:

#### Policy 1: Allow Read for All
- **Name**: `Allow public read`
- **Operation**: `SELECT`
- **Definition**: `true`

#### Policy 2: Allow Insert for Admin Only
- **Name**: `Allow admin insert`
- **Operation**: `INSERT`
- **Definition**: 
  ```sql
  (created_by = 'hannawintz')
  ```

#### Policy 3: Allow Update for Admin Only
- **Name**: `Allow admin update`
- **Operation**: `UPDATE`
- **Definition**: 
  ```sql
  (created_by = 'hannawintz')
  ```

#### Policy 4: Allow Delete for Admin Only
- **Name**: `Allow admin delete`
- **Operation**: `DELETE`
- **Definition**: 
  ```sql
  (created_by = 'hannawintz')
  ```

### Step 3: Update Your Code

You'll need to update `src/utils/supabase.ts` to include `created_by` when saving workouts.

## Recommendation

**For now, keep Option 1** (simple public access) since:
1. Your frontend already enforces permissions
2. You only have 2 users
3. It's simpler to maintain

**Upgrade to Option 2 later** if you:
- Add more users
- Want database-level security
- Need audit trails

## Current RLS Setup (Simple Version)

Just make sure you have these 4 policies enabled:

```sql
-- Enable RLS
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Allow all operations (frontend handles permissions)
CREATE POLICY "Allow public read" ON workouts FOR SELECT USING (true);
CREATE POLICY "Allow public insert" ON workouts FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public update" ON workouts FOR UPDATE USING (true);
CREATE POLICY "Allow public delete" ON workouts FOR DELETE USING (true);
```

This works because your React app already prevents guests from editing!

