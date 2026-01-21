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


const cors = require("cors");
const allowedOrigins = [
"http://localhost:3000",
// "https://YOUR-frontend.vercel.app", // add later
"https://onlinecardappwebservice-1-ll8h.onrender.com"
// add later
];
app.use(
cors({
origin: function (origin, callback) {
// allow requests with no origin (Postman/server-to-server)
if (!origin) return callback(null, true);
if (allowedOrigins.includes(origin)) {
return callback(null, true);
}
return callback(new Error("Not allowed by CORS"));
},
methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
allowedHeaders: ["Content-Type", "Authorization"],
credentials: false,
})
);

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
    const { card_name, card_URL } = req.body;

    if (!card_name || !card_URL) {
        return res.status(400).json({ message: 'card_name and card_URL are required' });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO cards (card_name, card_URL) VALUES (?, ?)',
            [card_name, card_URL]
        );
        res.status(201).json({ message: `Card ${card_name} added successfully` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: `Server error - could not add card ${card_name}` });
    } finally {
        if (connection) await connection.end();
    }
});

// Example Route: Update a card
app.put('/updatecard/:id', async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('UPDATE cards SET card_name=?, card_pic=? WHERE id=?', [card_name, card_pic, id]);
        res.status(201).json({ message: 'Card ' + id + ' updated successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not update card ' + id });
    }
});

// Example Route: Delete a card
app.delete('/deletecard/:id', async (req, res) => {
    const { id } = req.params;
    try{
        let connection = await mysql.createConnection(dbConfig);
        await connection.execute('DELETE FROM cards WHERE id=?', [id]);
        res.status(201).json({ message: 'Card ' + id + ' deleted successfully!' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error - could not delete card ' + id });
    }
});


