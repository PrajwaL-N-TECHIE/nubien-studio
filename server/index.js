import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

const app = express();
app.use(cors());
app.use(express.json());

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Batraa@123',
    database: process.env.DB_NAME || 'buildicy'
};

app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, projectType, budget, timeline, message, selectedTags } = req.body;

        const connection = await mysql.createConnection(dbConfig);

        const query = `
            INSERT INTO contact_submissions 
            (name, email, project_type, budget, timeline, message, selected_tags) 
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(query, [
            name,
            email,
            projectType,
            budget,
            timeline,
            message,
            JSON.stringify(selectedTags)
        ]);

        await connection.end();

        res.status(201).json({ message: 'Submission saved successfully', id: result.insertId });
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to save submission' });
    }
});

app.get('/api/submissions', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM contact_submissions ORDER BY created_at DESC');
        await connection.end();
        res.status(200).json(rows);
    } catch (error) {
        console.error('Database error:', error);
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
