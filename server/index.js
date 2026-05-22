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
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
  console.log('Database initialized successfully.');
}

// Routes
app.post('/api/register-internship', upload.single('receipt'), async (req, res) => {
  try {
    const { name, email, phone, track, college, degree, reason } = req.body;
    const receiptFile = req.file;

    // Basic validation
    if (!name || !email || !phone || !track || !receiptFile) {
      return res.status(400).json({ error: 'Missing required fields or receipt upload' });
    }

    const receiptPath = receiptFile.filename;

    const result = await db.run(
      `INSERT INTO internships (name, email, phone, track, college, degree, reason, receipt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone, track, college, degree, reason, receiptPath]
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
