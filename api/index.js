import express from 'express';
import cors from 'cors';
import serverless from 'serverless-http';
import { sql } from '@vercel/postgres';

const app = express();

app.use(cors());
// Increase JSON payload limit to handle Base64 images
app.use(express.json({ limit: '10mb' }));

// Database Initialization (runs on cold start)
async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS internships (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(255) NOT NULL,
        track VARCHAR(255) NOT NULL,
        college VARCHAR(255) NOT NULL,
        degree VARCHAR(255) NOT NULL,
        reason TEXT NOT NULL,
        receipt TEXT NOT NULL,
        registration_id VARCHAR(255) UNIQUE NOT NULL,
        referral_code VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('Postgres Database verified.');
  } catch (err) {
    console.error('Error verifying database:', err);
  }
  
  // Create SDR campaigns table (runs on cold start, ignores if exists)
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS sdr_campaigns (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        campaign_type VARCHAR(50) NOT NULL,
        persona_title VARCHAR(255),
        pain_point TEXT,
        system_prompt TEXT,
        leads_data TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;
    console.log('SDR campaigns table verified.');
  } catch (err) {
    console.error('Error creating sdr_campaigns table:', err);
  }
}
initDB();

// --------------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------------

// Register Internship
app.post('/api/register-internship', async (req, res) => {
  try {
    const { name, email, phone, track, college, degree, reason, referral_code, receipt } = req.body;

    if (!name || !email || !phone || !track || !college || !degree || !reason || !receipt) {
      return res.status(400).json({ error: 'All fields including receipt are required' });
    }
    
    // Generate unique registration ID (e.g. BLDCY-UIUX-4921)
    const trackPrefix = track.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `BLDCY-${trackPrefix}-${randomNum}`;

    const result = await sql`
      INSERT INTO internships (name, email, phone, track, college, degree, reason, receipt, registration_id, referral_code)
      VALUES (${name}, ${email}, ${phone}, ${track}, ${college}, ${degree}, ${reason}, ${receipt}, ${registrationId}, ${referral_code || null})
      RETURNING id, registration_id
    `;

    res.status(201).json({ 
      success: true, 
      id: result.rows[0].id,
      registration_id: result.rows[0].registration_id 
    });
  } catch (error) {
    console.error('Error saving registration:', error);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// Get total registration stats per track (for early bird)
app.get('/api/internship/stats', async (req, res) => {
  try {
    const { rows } = await sql`SELECT track, COUNT(*) as count FROM internships GROUP BY track`;
    const stats = {};
    rows.forEach(r => { stats[r.track] = parseInt(r.count, 10); });
    res.json(stats);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Verify if a referral ID exists
app.get('/api/internship/verify-referral/:id', async (req, res) => {
  try {
    const { rows } = await sql`SELECT id FROM internships WHERE registration_id = ${req.params.id}`;
    res.json({ valid: rows.length > 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Dashboard Data (Single Registration)
app.get('/api/internship/:registrationId', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM internships WHERE registration_id = ${req.params.registrationId}`;
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin Route: Get All Internships
app.get('/api/admin/internships', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM internships ORDER BY created_at DESC`;
    res.json(rows);
  } catch (error) {
    console.error('Failed to fetch data:', error);
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});

// Admin Route: Delete a Single Record by ID
app.delete('/api/admin/internships/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await sql`DELETE FROM internships WHERE registration_id = ${id}`;
    res.json({ success: true, message: 'Record deleted successfully' });
  } catch (error) {
    console.error('Failed to delete record:', error);
    res.status(500).json({ error: 'Failed to delete record' });
  }
});

// Admin Route: Delete All Data (Purge Database)
app.delete('/api/admin/internships', async (req, res) => {
  try {
    // TRUNCATE is faster and resets the ID sequence in Postgres
    await sql`TRUNCATE TABLE internships RESTART IDENTITY`;
    res.json({ success: true, message: 'All records permanently deleted' });
  } catch (error) {
    console.error('Failed to clear database:', error);
    res.status(500).json({ error: 'Failed to clear database' });
  }
});

// --------------------------------------------------------------------------
// SDR CAMPAIGN STORAGE (Vercel Postgres)
// --------------------------------------------------------------------------

app.post('/api/sdr/campaigns', async (req, res) => {
  try {
    const { name, campaignType, personaTitle, painPoint, systemPrompt, leads } = req.body;
    if (!name || !leads) {
      return res.status(400).json({ error: 'Campaign name and leads are required' });
    }
    const result = await sql`
      INSERT INTO sdr_campaigns (name, campaign_type, persona_title, pain_point, system_prompt, leads_data)
      VALUES (${name}, ${campaignType || 'b2b'}, ${personaTitle || ''}, ${painPoint || ''}, ${systemPrompt || ''}, ${JSON.stringify(leads)})
      RETURNING id
    `;
    res.status(201).json({ success: true, id: result.rows[0].id });
  } catch (error) {
    console.error('Error saving campaign:', error);
    res.status(500).json({ error: 'Failed to save campaign' });
  }
});

app.get('/api/sdr/campaigns', async (req, res) => {
  try {
    const { rows } = await sql`
      SELECT id, name, campaign_type, persona_title, pain_point, created_at, leads_data
      FROM sdr_campaigns ORDER BY created_at DESC
    `;
    const campaigns = rows.map(row => ({
      ...row,
      leads: JSON.parse(row.leads_data || '[]'),
      leadCount: JSON.parse(row.leads_data || '[]').length
    }));
    res.json(campaigns);
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

app.get('/api/sdr/campaigns/:id', async (req, res) => {
  try {
    const { rows } = await sql`SELECT * FROM sdr_campaigns WHERE id = ${req.params.id}`;
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' });
    const campaign = rows[0];
    campaign.leads = JSON.parse(campaign.leads_data || '[]');
    res.json(campaign);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

app.delete('/api/sdr/campaigns/:id', async (req, res) => {
  try {
    await sql`DELETE FROM sdr_campaigns WHERE id = ${req.params.id}`;
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Wrap the Express app with serverless-http
export default serverless(app);
