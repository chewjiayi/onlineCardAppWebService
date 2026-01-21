const express = require("express");
const mysql = require("mysql2/promise");
const cors = require("cors");
require("dotenv").config();

const app = express();

/* ======================
   Server Configuration
====================== */
const PORT = 5000; // backend should NOT use 3000

app.use(express.json());

/* ======================
   CORS Configuration
====================== */
const allowedOrigins = [
    "http://localhost:3000",
    // "https://your-frontend.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin) return callback(null, true);
            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }
            return callback(new Error("Not allowed by CORS"));
        },
        methods: ["GET", "POST", "PUT", "DELETE"],
    })
);

/* ======================
   Database Configuration
====================== */
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
};

/* ======================
   Routes
====================== */

// GET all cards
app.get("/allcards", async (req, res) => {
    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute("SELECT * FROM cards");
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch cards" });
    } finally {
        if (connection) await connection.end();
    }
});

// ADD new card
app.post("/addcard", async (req, res) => {
    const { card_name, card_URL } = req.body;

    if (!card_name || !card_URL) {
        return res.status(400).json({ message: "card_name and card_URL are required" });
    }

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            "INSERT INTO cards (card_name, card_URL) VALUES (?, ?)",
            [card_name, card_URL]
        );
        res.status(201).json({ message: "Card added successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to add card" });
    } finally {
        if (connection) await connection.end();
    }
});

// UPDATE card
app.put("/updatecard/:id", async (req, res) => {
    const { id } = req.params;
    const { card_name, card_pic } = req.body;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            "UPDATE cards SET card_name = ?, card_pic = ? WHERE id = ?",
            [card_name, card_pic, id]
        );
        res.json({ message: "Card updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update card" });
    } finally {
        if (connection) await connection.end();
    }
});

// DELETE card
app.delete("/deletecard/:id", async (req, res) => {
    const { id } = req.params;

    let connection;
    try {
        connection = await mysql.createConnection(dbConfig);
        await connection.execute("DELETE FROM cards WHERE id = ?", [id]);
        res.json({ message: "Card deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete card" });
    } finally {
        if (connection) await connection.end();
    }
});

/* ======================
   Start Server
====================== */
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
