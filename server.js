const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden vanuit de hoofdmap
app.use(express.static(path.join(__dirname)));

// Stuur kas.html mee als iemand de hoofd-URL bezoekt
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
// API Endpoint om data op te halen
app.get('/api/data/:key', (req, res) => {
    const key = req.params.key;
    db.get(`SELECT value FROM app_data WHERE key = ?`, [key], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ value: row ? JSON.parse(row.value) : null });
        }
    });
});

// API Endpoint om data op te slaan
app.post('/api/data', (req, res) => {
    const { key, value } = req.body;
    const stringValue = JSON.stringify(value);
    
    db.run(`INSERT INTO app_data (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?`, 
        [key, stringValue, stringValue], 
        function(err) {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });
            }
        }
    );
});

// Zorg voor standaard startdata als de database nog leeg is
db.serialize(() => {
    db.get("SELECT value FROM app_data WHERE key = 'gebruikers'", (err, row) => {
        if (!row) {
            const standaardGebruikers = [
                { naam: 'Admin', korteInlog: 'admin', wachtwoord: 'wachtwoord', functie: '1', envAccess: ['Admin', 'Voorraad', 'Storting/Opname', 'Wallet', 'Overzichten'] }
            ];
            db.run("INSERT OR REPLACE INTO app_data (key, value) VALUES ('gebruikers', ?)", [JSON.stringify(standaardGebruikers)], (err) => {
                if (!err) {
                    console.log('Standaard gebruikers succesvol aangemaakt in je database!');
                }
            });
        }
    });
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
