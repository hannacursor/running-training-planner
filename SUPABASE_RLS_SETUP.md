# Supabase RLS (Row Level Security) Setup

## Method 1: Using the Dashboard (Easiest)

### Step 1: Navigate to Policies
1. In your Supabase dashboard, click **"Authentication"** in the left sidebar
2. Click **"Policies"** (under Authentication)
3. You'll see a list of tables - click on **"workouts"**

### Step 2: Enable RLS
1. At the top, make sure **"Enable Row Level Security"** is toggled **ON** (green)
2. If it's off, click the toggle to enable it

### Step 3: Create Policies
You need to create 4 policies (one for each operation):

#### Policy 1: Allow Read (SELECT)
1. Click **"New Policy"**
2. Select **"For full customization"** (or "Create a policy from scratch")
3. Fill in:
   - **Policy name**: `Allow public read access`
   - **Allowed operation**: `SELECT`
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **"Review"** then **"Save policy"**

#### Policy 2: Allow Insert
1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Fill in:
   - **Policy name**: `Allow public insert access`
   - **Allowed operation**: `INSERT`
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **"Review"** then **"Save policy"**

#### Policy 3: Allow Update
1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Fill in:
   - **Policy name**: `Allow public update access`
   - **Allowed operation**: `UPDATE`
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **"Review"** then **"Save policy"**

#### Policy 4: Allow Delete
1. Click **"New Policy"** again
2. Select **"For full customization"**
3. Fill in:
   - **Policy name**: `Allow public delete access`
   - **Allowed operation**: `DELETE`
   - **Policy definition**: 
     ```sql
     true
     ```
4. Click **"Review"** then **"Save policy"**

## Method 2: Using SQL Editor (Faster)

1. Go to **"SQL Editor"** in the left sidebar
2. Click **"New query"**
3. Paste this SQL:

```sql
-- Enable RLS on workouts table
ALTER TABLE workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access" ON workouts
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access" ON workouts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access" ON workouts
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access" ON workouts
  FOR DELETE USING (true);
```

4. Click **"Run"** (or press Cmd/Ctrl + Enter)

## Verify It Works

After setting up RLS, your app should be able to:
- ✅ Read workouts from the database
- ✅ Create new workouts
- ✅ Update existing workouts
- ✅ Delete workouts

## Security Note

These policies allow **anyone** to read/write to your database. For a production app, you'd want to:
- Add user authentication
- Restrict access to only the authenticated user's data
- Use more specific policy conditions

For now, this is fine for a personal training planner!

