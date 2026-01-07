# Supabase Workouts Table Structure

## Required Columns (in order):

1. **id** (text, Primary Key, NOT NULL)
   - This is the unique identifier for each workout

2. **date** (text, NOT NULL)
   - Stores the date as ISO string (e.g., "2026-01-05")

3. **planned_mileage** (numeric, NOT NULL)
   - The planned distance in miles

4. **actual_mileage** (numeric, NULLABLE)
   - The actual distance run (can be null)

5. **workout_type** (text, NOT NULL)
   - One of: "Easy Run", "Threshold", "Intervals", "Long Run", "Rest"

6. **completed** (boolean, NOT NULL, Default: false)
   - Whether the workout is marked as completed

7. **details** (text, NULLABLE)
   - Optional workout notes/details

8. **created_at** (timestamp, NOT NULL, Default: now())
   - Auto-generated timestamp

## Quick Fix:

If your table already exists but has wrong columns:

1. Go to **Table Editor** → Click on `workouts` table
2. Check each column matches above
3. If columns are missing or wrong:
   - Click **"Add Column"** for missing ones
   - Or click the column name to edit existing ones
4. Make sure `id` is set as **Primary Key**

## Alternative: SQL to Create Table

If you want to use SQL instead, go to **SQL Editor** and run:

```sql
CREATE TABLE IF NOT EXISTS workouts (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  planned_mileage NUMERIC NOT NULL,
  actual_mileage NUMERIC,
  workout_type TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  details TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
```

