const express = require('express');
const { createClient } = require("@libsql/client");
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden vanuit de hoofdmap
app.use(express.static(path.join(__dirname)));

// Stuur de hoofdpagina mee
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'biljartkas.html'));
});

// Verbind met Turso Cloud Database
const db = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// Maak een tabel aan voor centrale opslag als deze nog niet bestaat
async function initDb() {
    try {
        await db.execute(`
            CREATE TABLE IF NOT EXISTS app_data (
                key TEXT PRIMARY KEY,
                value TEXT
            )
        `);
        console.log("Database tabel gecontroleerd/aangemaakt in Turso.");
    } catch (err) {
        console.error("Fout bij aanmaken tabel in Turso:", err.message);
    }
}
initDb();

// API Eindpunt om data op te halen
app.get('/api/data/:key', async (req, res) => {
    try {
        const key = req.params.key;
        const result = await db.execute({
            sql: "SELECT value FROM app_data WHERE key = ?",
            args: [key]
        });
        
        if (result.rows.length > 0) {
            res.json({ value: JSON.parse(result.rows[0].value) });
        } else {
            res.json({ value: null });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Eindpunt om data op te slaan
app.post('/api/data', async (req, res) => {
    try {
        const { key, value } = req.body;
        const valueString = JSON.stringify(value);
        
        await db.execute({
            sql: "INSERT INTO app_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            args: [key, valueString]
        });
        
        res.json({ status: "success" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
