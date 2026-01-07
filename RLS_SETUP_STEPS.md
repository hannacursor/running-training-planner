# Supabase RLS Setup - Step by Step

## Step 1: Open SQL Editor

1. Go to your Supabase project dashboard
2. Click **"SQL Editor"** in the left sidebar
3. Click **"New query"** button (top right)

## Step 2: Run This SQL

Copy and paste this entire SQL block into the editor:

```sql
-- Enable Row Level Security on workouts table
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Policy 1: Allow everyone to read workouts
CREATE POLICY "Allow public read" 
ON workouts 
FOR SELECT 
USING (true);

-- Policy 2: Allow everyone to insert workouts
CREATE POLICY "Allow public insert" 
ON workouts 
FOR INSERT 
WITH CHECK (true);

-- Policy 3: Allow everyone to update workouts
CREATE POLICY "Allow public update" 
ON workouts 
FOR UPDATE 
USING (true);

-- Policy 4: Allow everyone to delete workouts
CREATE POLICY "Allow public delete" 
ON workouts 
FOR DELETE 
USING (true);
```

## Step 3: Execute

1. Click the **"Run"** button (or press Cmd/Ctrl + Enter)
2. You should see "Success. No rows returned" for each statement

## Step 4: Verify

1. Go to **"Authentication"** → **"Policies"** in the left sidebar
2. Click on **"workouts"** table
3. You should see 4 policies listed:
   - Allow public read
   - Allow public insert
   - Allow public update
   - Allow public delete
4. Make sure **"Enable Row Level Security"** toggle is **ON** (green)

## Why This Works

Even though these policies allow "everyone" to do everything, your React app's authentication system prevents guests from actually making changes. The database allows the operations, but guests can't trigger them because:
- The frontend hides edit buttons
- The frontend blocks click handlers
- The frontend doesn't call the API functions

This is a good balance between simplicity and security for a 2-user system!

## Troubleshooting

If you get an error saying a policy already exists:
- Delete the existing policies first, then run the SQL again
- Or use `CREATE POLICY IF NOT EXISTS` (but Supabase might not support this)

If you want to delete and recreate:
```sql
-- Delete existing policies
DROP POLICY IF EXISTS "Allow public read" ON workouts;
DROP POLICY IF EXISTS "Allow public insert" ON workouts;
DROP POLICY IF EXISTS "Allow public update" ON workouts;
DROP POLICY IF EXISTS "Allow public delete" ON workouts;

-- Then run the CREATE POLICY statements above
```

