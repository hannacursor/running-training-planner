// Vercel Serverless Function for Strava OAuth token exchange
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { code } = req.body;
  const clientId = process.env.VITE_STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET; // Note: Use different env var name for server
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
    
    // Return token data to frontend
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
}

