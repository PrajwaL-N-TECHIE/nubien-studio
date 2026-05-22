import express from 'express';
import cors from 'cors';
import multer from 'multer';
import serverless from 'serverless-http';
import { sql } from '@vercel/postgres';

const app = express();

app.use(cors());
app.use(express.json());

// Use memory storage for Vercel (since file system is ephemeral)
const upload = multer({ storage: multer.memoryStorage() });

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
}
initDB();

// --------------------------------------------------------------------------
// ROUTES
// --------------------------------------------------------------------------

// Register Internship
app.post('/api/register-internship', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, phone, track, college, degree, reason, referral_code } = req.body;
    const receiptFile = req.file;

    if (!name || !email || !phone || !track || !college || !degree || !reason || !receiptFile) {
      return res.status(400).json({ error: 'All fields including receipt are required' });
    }

    // Convert file buffer to base64 string
    const base64Receipt = `data:${receiptFile.mimetype};base64,${receiptFile.buffer.toString('base64')}`;
    
    // Generate unique registration ID (e.g. BLDCY-UIUX-4921)
    const trackPrefix = track.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `BLDCY-${trackPrefix}-${randomNum}`;

    const result = await sql`
      INSERT INTO internships (name, email, phone, track, college, degree, reason, receipt, registration_id, referral_code)
      VALUES (${name}, ${email}, ${phone}, ${track}, ${college}, ${degree}, ${reason}, ${base64Receipt}, ${registrationId}, ${referral_code || null})
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

// Wrap the Express app with serverless-http
export default serverless(app);
