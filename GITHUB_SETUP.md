# Push to GitHub - Step by Step Guide

## Step 1: Create a GitHub Repository

1. Go to [github.com](https://github.com) and sign in (or create an account)
2. Click the **"+"** icon in the top right → **"New repository"**
3. Fill in:
   - **Repository name**: `running-training-planner` (or any name you like)
   - **Description**: "A web app for planning and tracking running workouts"
   - **Visibility**: Choose Public or Private
   - **DO NOT** check "Initialize with README" (we already have files)
4. Click **"Create repository"**

## Step 2: Connect and Push Your Code

After creating the repository, GitHub will show you commands. Use these:

```bash
cd "/Users/hanna/Desktop/Cursor Project"

# Add the remote repository (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/running-training-planner.git

# Rename the default branch to main (if needed)
git branch -M main

# Push your code to GitHub
git push -u origin main
```

## Alternative: Using GitHub Desktop

If you prefer a visual interface:

1. Download [GitHub Desktop](https://desktop.github.com/)
2. Install and sign in
3. Click **"File"** → **"Add Local Repository"**
4. Navigate to `/Users/hanna/Desktop/Cursor Project`
5. Click **"Publish repository"** to create it on GitHub and push

## What's Already Done

✅ Git repository initialized  
✅ All files added and committed  
✅ .gitignore file created (excludes node_modules, dist, etc.)

## Next Steps After Pushing

Once your code is on GitHub, you can:
1. Deploy to Vercel/Netlify by connecting your GitHub repo
2. Share your code with others
3. Keep it backed up in the cloud

