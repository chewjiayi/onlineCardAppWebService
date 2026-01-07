const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const port = 3000;

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0
};

const app = express();
app.use(express.json());

// start server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});

// GET all cards
app.get('/allcards', async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM cards');
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allcards' });
    } finally {
        if (connection) await connection.end();
    }
});

// ADD new card
app.post('/addcard', async (req, res) => {
    const { card_name, card_pic } = req.body;

    if (!card_name || !card_pic) {
        return res.status(400).json({ message: 'card_name and card_pic are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO cards (card_name, card_pic) VALUES (?, ?)',
            [card_name, card_pic]
        );
        res.status(201).json({ message: `Card ${card_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not add card ${card_name}` });
    } finally {
        if (connection) await connection.end();
    }
});
