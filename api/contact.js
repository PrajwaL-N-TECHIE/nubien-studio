import mysql from 'mysql2/promise';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { name, email, projectType, budget, timeline, message, selectedTags } = req.body;

    const dbConfig = {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        ssl: {
            rejectUnauthorized: false // Often required for cloud MySQL like Aiven/Railway
        }
    };

    try {
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
        res.status(500).json({ error: 'Failed to save submission', details: error.message });
    }
}
