# Fix Primary Key Issue

The error means the `id` column in your `workouts` table is not set as a Primary Key. Here's how to fix it:

## Option 1: Using SQL Editor (Recommended)

1. Go to **SQL Editor** → **New query**
2. Run this SQL:

```sql
-- First, make sure id column exists and is text type
ALTER TABLE workouts 
ALTER COLUMN id SET DATA TYPE TEXT;

-- Set id as Primary Key
ALTER TABLE workouts 
ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);
```

If you get an error that the constraint already exists, try this instead:

```sql
-- Drop existing primary key if any
ALTER TABLE workouts DROP CONSTRAINT IF EXISTS workouts_pkey;

-- Add primary key constraint
ALTER TABLE workouts 
ADD CONSTRAINT workouts_pkey PRIMARY KEY (id);
```

## Option 2: Using Table Editor

1. Go to **Table Editor** → Click on `workouts` table
2. Find the `id` column
3. Click on the column name to edit it
4. Make sure:
   - **Type** is `text`
   - **Is Primary Key** is checked ✅
   - **Is Nullable** is unchecked ❌
5. Click **Save**

## Verify It Worked

After running the SQL or updating in the table editor:
1. The `id` column should show a key icon 🔑 next to it
2. Try adding a workout again - it should work now!

