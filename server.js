// Local development server for Strava OAuth token exchange
// Run with: node server.js

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.local') });

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Strava token exchange endpoint
app.post('/api/strava/token', async (req, res) => {
  const { code } = req.body;
  const clientId = process.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = process.env.VITE_STRAVA_CLIENT_SECRET;
  const redirectUri = process.env.VITE_STRAVA_REDIRECT_URI;

  if (!code || !clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Strava token exchange error:', error);
      return res.status(response.status).json({ error: 'Failed to exchange token' });
    }

    const data = await response.json();
    
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete?.id,
    });
  } catch (error) {
    console.error('Error in Strava token exchange:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Strava token refresh endpoint
app.post('/api/strava/refresh', async (req, res) => {
  const { refresh_token } = req.body;
  const clientId = process.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = process.env.VITE_STRAVA_CLIENT_SECRET;

  if (!refresh_token || !clientId || !clientSecret) {
    return res.status(400).json({ error: 'Missing required parameters' });
  }

  try {
    const response = await fetch('https://www.strava.com/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Strava token refresh error:', error);
      return res.status(response.status).json({ error: 'Failed to refresh token' });
    }

    const data = await response.json();
    
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete_id: data.athlete?.id,
    });
  } catch (error) {
    console.error('Error in Strava token refresh:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Local API server running on http://localhost:${PORT}`);
  console.log('Make sure to update vite.config.ts to proxy /api requests to this server');
});

