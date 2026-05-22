import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup Multer for file uploads
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve uploaded files statically if needed later
app.use('/uploads', express.static(uploadDir));

// Initialize SQLite Database
let db;
async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS internships (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        track TEXT NOT NULL,
        college TEXT NOT NULL,
        degree TEXT NOT NULL,
        reason TEXT NOT NULL,
        receipt TEXT NOT NULL,
        registration_id TEXT UNIQUE NOT NULL,
        referral_code TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database initialized successfully.');
    
    // Attempt to add the column for existing databases (ignores error if it already exists)
    try {
      await db.exec("ALTER TABLE internships ADD COLUMN referral_code TEXT");
    } catch (e) {
      // Column already exists, ignore
    }
  } catch (err) {
    console.error('Error creating internships table:', err);
  }
}

// Routes
app.post('/api/register-internship', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, phone, track, college, degree, reason, referral_code } = req.body;
    const receiptFile = req.file;

    if (!name || !email || !phone || !track || !college || !degree || !reason || !receiptFile) {
      return res.status(400).json({ error: 'All fields including receipt are required' });
    }

    const receiptPath = receiptFile.filename;
    
    // Generate unique registration ID (e.g. BLDCY-UIUX-4921)
    const trackPrefix = track.substring(0, 4).toUpperCase();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const registrationId = `BLDCY-${trackPrefix}-${randomNum}`;

    const result = await db.run(
      `INSERT INTO internships (name, email, phone, track, college, degree, reason, receipt, registration_id, referral_code)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, track, college, degree, reason, receiptPath, registrationId, referral_code || null]
    );

    res.status(201).json({ 
      success: true, 
      id: result.lastID,
      registration_id: registrationId 
    });
  } catch (error) {
    console.error('Error saving registration:', error);
    res.status(500).json({ error: 'Failed to save registration' });
  }
});

// Get total registration stats (for early bird)
app.get('/api/internship/stats', async (req, res) => {
  try {
    const row = await db.get('SELECT COUNT(*) as count FROM internships');
    res.json({ total_registrations: row.count });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Verify if a referral ID exists
app.get('/api/internship/verify-referral/:id', async (req, res) => {
  try {
    const row = await db.get('SELECT id FROM internships WHERE registration_id = ?', [req.params.id]);
    res.json({ valid: !!row });
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Get Dashboard Data
app.get('/api/internship/:registrationId', async (req, res) => {
  try {
    const row = await db.get(
      'SELECT * FROM internships WHERE registration_id = ?',
      [req.params.registrationId]
    );
    if (!row) {
      return res.status(404).json({ error: 'Registration not found' });
    }
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin Route to Get All Applications
app.get('/api/admin/internships', async (req, res) => {
  try {
    const { password } = req.query;
    
    if (password !== 'admin@123') {
      return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }

    const rows = await db.all('SELECT * FROM internships ORDER BY created_at DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching admin data:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin Route to Clear Database
app.delete('/api/admin/internships', async (req, res) => {
  try {
    const { password } = req.query;
    
    if (password !== 'admin@123') {
      return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }

    await db.run('DELETE FROM internships');
    // Reset auto-increment counter
    await db.run('DELETE FROM sqlite_sequence WHERE name="internships"');
    
    res.json({ success: true, message: 'Database cleared' });
  } catch (error) {
    console.error('Error clearing database:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Admin Route to Delete Single Record
app.delete('/api/admin/internships/:id', async (req, res) => {
  try {
    const { password } = req.query;
    
    if (password !== 'admin@123') {
      return res.status(401).json({ error: 'Unauthorized: Invalid password' });
    }

    const { id } = req.params;
    await db.run('DELETE FROM internships WHERE id = ?', [id]);
    
    res.json({ success: true, message: 'Record deleted' });
  } catch (error) {
    console.error('Error deleting record:', error);
    res.status(500).json({ error: 'Database error' });
  }
});

// Upload Profile Image
app.post('/api/internship/:registrationId/profile-image', upload.single('image'), async (req, res) => {
  try {
    const imageFile = req.file;
    if (!imageFile) {
      return res.status(400).json({ error: 'No image uploaded' });
    }
    const imagePath = imageFile.filename;
    
    await db.run(
      'UPDATE internships SET profile_image = ? WHERE registration_id = ?',
      [imagePath, req.params.registrationId]
    );
    res.json({ success: true, profile_image: imagePath });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update profile image' });
  }
});

// Start server
initDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Backend server running on http://localhost:${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
});
