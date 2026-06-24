import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Groq from 'groq-sdk';

import axios from 'axios';
import nodemailer from 'nodemailer';

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Groq
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || 'dummy_key_replace_me',
});

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

    await db.exec(`
      CREATE TABLE IF NOT EXISTS roi_leads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT NOT NULL,
        monthly_saas_cost INTEGER NOT NULL,
        estimated_savings INTEGER NOT NULL,
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

    try {
      await db.exec("ALTER TABLE roi_leads ADD COLUMN currency TEXT DEFAULT 'USD'");
    } catch (e) {
      // Column already exists, ignore
    }
  } catch (err) {
    console.error('Error creating databases tables:', err);
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

// Get total registration stats per track (for early bird)
app.get('/api/internship/stats', async (req, res) => {
  try {
    const rows = await db.all('SELECT track, COUNT(*) as count FROM internships GROUP BY track');
    const stats = {};
    rows.forEach((r) => { stats[r.track] = r.count; });
    res.json(stats);
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

// AI-SDR: Generate Personalized Sales Pitch (Manual Single)
app.post('/api/generate-pitch', async (req, res) => {
  try {
    const { leadName, companyName, industry, painPoint } = req.body;

    if (!leadName || !companyName) {
      return res.status(400).json({ error: 'leadName and companyName are required' });
    }

    const systemPrompt = `You are an elite, highly persuasive AI Sales Development Representative (SDR) working for 'Buildicy', a top-tier Custom Software and SaaS development agency based in Coimbatore. 
Your goal is to write a short, punchy, cold email to a potential client.
The email must not sound like marketing spam. It must sound like a human wrote it.
Keep it under 150 words. Do not use generic buzzwords.
Mention that Buildicy builds high-performance SaaS, AI Automation, and Web3 solutions.
End with a soft call to action asking for a quick 10-minute chat.`;

    const userPrompt = `Write a cold email to ${leadName} at ${companyName}. They are in the ${industry || 'Tech'} industry. Focus on the pain point of: ${painPoint || 'Scaling their software infrastructure'}.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 300,
    });

    const generatedEmail = chatCompletion.choices[0]?.message?.content || 'Failed to generate email.';

    res.json({ success: true, email: generatedEmail });
  } catch (error) {
    console.error('Error generating pitch:', error);
    res.status(500).json({ error: 'Failed to generate pitch. Check API key and quota.' });
  }
});

// AI-SDR: Fully Automated Apollo.io Pipeline with Live Streaming
app.post('/api/generate-campaign', async (req, res) => {
  try {
    const { personaTitle, painPoint } = req.body;

    if (!personaTitle) {
      return res.status(400).json({ error: 'Persona title is required (e.g. "SaaS Founder")' });
    }

    const APOLLO_KEY = process.env.APOLLO_API_KEY;
    if (!APOLLO_KEY) {
      return res.status(500).json({ error: 'Apollo API key missing in server/.env' });
    }

    // Set headers for Server-Sent Events (SSE) stream
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 1. Fetch Leads from Apollo
    const apolloData = {
      q_keywords: personaTitle,
      person_titles: [personaTitle],
      page: 1,
      per_page: 5 // Keep it small for MVP performance
    };

    let apolloRes;
    try {
      apolloRes = await axios.post('https://api.apollo.io/v1/mixed_people/api_search', apolloData, {
        headers: {
          'Cache-Control': 'no-cache',
          'Content-Type': 'application/json',
          'X-Api-Key': APOLLO_KEY
        }
      });
    } catch (apolloErr) {
      console.error('Apollo Fetch Error:', apolloErr.response?.data || apolloErr.message);
      res.write(`data: ${JSON.stringify({ error: 'Failed to fetch leads from Apollo API.' })}\n\n`);
      return res.end();
    }

    const people = apolloRes.data.people || [];

    if (people.length === 0) {
      res.write(`data: ${JSON.stringify({ error: 'No leads found for that persona.' })}\n\n`);
      return res.end();
    }

    // 2. Generate Emails for each lead and stream them immediately
    const promptPath = path.join(__dirname, 'prompts', 'sdr_system_prompt.jinja');
    const systemPrompt = fs.readFileSync(promptPath, 'utf-8');

    for (const person of people) {
      const firstName = person.first_name || '';
      const lastName = person.last_name || '';
      const leadName = `${firstName} ${lastName}`.trim() || 'Unknown Lead';
      const companyName = person.organization?.name || 'your company';
      const title = person.title || 'Leader';

      // 3. Unlock Real Email via Apollo Match API (Burns 1 Credit)
      let realEmail = 'No email found (Apollo Free Tier)';
      try {
        const matchRes = await axios.post('https://api.apollo.io/v1/people/match', {
          id: person.id
        }, {
          headers: {
            'Cache-Control': 'no-cache',
            'Content-Type': 'application/json',
            'X-Api-Key': APOLLO_KEY
          }
        });
        if (matchRes.data?.person?.email) {
          realEmail = matchRes.data.person.email;
        }
      } catch (matchErr) {
        console.error(`Failed to unlock email for ${leadName}:`, matchErr.response?.data || matchErr.message);
      }

      const userPrompt = `Write a cold email to ${leadName}, who is the ${title} at ${companyName}. Their likely pain point is: ${painPoint || 'needing scalable custom software'}.`;

      let generatedLead;
      try {
        const chatCompletion = await groq.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          model: 'llama-3.1-8b-instant',
          temperature: 0.7,
          max_tokens: 300,
        });

        const emailBody = chatCompletion.choices[0]?.message?.content || 'Failed to generate pitch.';

        generatedLead = {
          id: person.id,
          name: leadName,
          title: title,
          company: companyName,
          email: realEmail,
          linkedin: person.linkedin_url,
          emailBody: emailBody
        };
      } catch (err) {
        console.error('Groq generation error for lead:', leadName, err);
        generatedLead = {
          id: person.id,
          name: leadName,
          title: title,
          company: companyName,
          email: realEmail,
          linkedin: person.linkedin_url,
          emailBody: 'Error: Could not generate pitch due to AI quota limits.'
        };
      }
      
      // Stream the newly generated lead to the frontend
      res.write(`data: ${JSON.stringify({ lead: generatedLead })}\n\n`);
    }

    // Tell the frontend the stream is complete
    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Error generating campaign:', error);
    res.write(`data: ${JSON.stringify({ error: 'Internal server error during campaign generation.' })}\n\n`);
    res.end();
  }
});

// AI-SDR: Nodemailer Automated Dispatcher
app.post('/api/send-email', async (req, res) => {
  try {
    const { to, subject, text } = req.body;

    if (!to || !subject || !text) {
      return res.status(400).json({ error: 'Missing to, subject, or text fields' });
    }

    if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
      return res.status(500).json({ error: 'Gmail credentials not configured in server/.env' });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Buildicy" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      text,
    });

    res.json({ success: true, message: 'Email dispatched successfully!' });
  } catch (error) {
    console.error('Nodemailer Error:', error);
    res.status(500).json({ error: 'Failed to dispatch email' });
  }
});

// AI-SDR: ROI Calculator Lead Capture & Auto-responder
app.post('/api/roi-leads', async (req, res) => {
  try {
    const { email, monthlySaasCost, estimatedSavings, currency, currencySymbol, customBuildCost } = req.body;

    if (!email) return res.status(400).json({ error: 'Email is required' });

    // 1. Save Lead to Database
    await db.run(
      'INSERT INTO roi_leads (email, monthly_saas_cost, estimated_savings, currency) VALUES (?, ?, ?, ?)',
      [email, monthlySaasCost || 0, estimatedSavings || 0, currency || 'USD']
    );

    // 2. Auto-responder via Nodemailer
    if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.GMAIL_USER,
          pass: process.env.GMAIL_APP_PASSWORD,
        },
      });

      const emailBody = `Hey!

Thanks for checking out the Buildicy ROI Calculator.

Based on your inputs, you are currently spending ${currencySymbol}${monthlySaasCost}/month on SaaS subscriptions. Over 5 years, that's a massive ${currencySymbol}${monthlySaasCost * 60} bleed on your revenue.

A custom Buildicy ecosystem built specifically for your exact workflow would cost an estimated ${currencySymbol}${customBuildCost} one-time fee.
That means we could save you roughly ${currencySymbol}${estimatedSavings} over the next 5 years, while giving you absolute ownership of your software.

Are you open to a quick 10-minute chat to see what a custom build would look like?

Best,
Prajwal
Founder @ Buildicy`;

      await transporter.sendMail({
        from: `"Prajwal @ Buildicy" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Your Custom Software ROI Blueprint',
        text: emailBody,
      });
    }

    res.json({ success: true, message: 'Lead captured and email sent!' });
  } catch (error) {
    console.error('ROI Lead Capture Error:', error);
    // Even if email fails, we return 200 so the user sees the frontend result
    res.json({ success: true, warning: 'Lead captured but email failed to send.' });
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
