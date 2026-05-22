import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize SQLite Database
let db;
async function initDB() {
  db = await open({
    filename: path.join(__dirname, 'database.sqlite'),
    driver: sqlite3.Database
  });

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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized successfully.');
}

// Routes
app.post('/api/register-internship', async (req, res) => {
  try {
    const { name, email, phone, track, college, degree, reason } = req.body;

    // Basic validation
    if (!name || !email || !phone || !track) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const result = await db.run(
      `INSERT INTO internships (name, email, phone, track, college, degree, reason)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, track, college, degree, reason]
    );

    res.status(201).json({ 
      message: 'Application received successfully',
      id: result.lastID 
    });
  } catch (error) {
    console.error('Error saving application:', error);
    res.status(500).json({ error: 'Internal server error' });
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
