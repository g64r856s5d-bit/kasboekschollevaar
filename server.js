const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden (zoals HTML, CSS en client JS) vanuit de hoofdmap
app.use(express.static(__dirname));

// Stuur kas.html mee als iemand de hoofd-URL bezoekt
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'kas.html'));
});

// Verbind met SQLite database
const db = new sqlite3.Database('./kasboek.db', (err) => {
    if (err) {
        console.error('Fout bij open database:', err.message);
    } else {
        console.log('Verbonden met de SQLite-database.');
    }
});

// Maak een tabel aan voor centrale opslag
db.run(`CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value TEXT
)`, (err) => {
    if (err) {
        console.error('Fout bij aanmaken tabel:', err.message);
    } else {
        console.log('Database tabel gecontroleerd/aangemaakt.');
    }
});

// Start de server
app.listen(PORT, () => {
    console.log(`Server draait op poort ${PORT}`);
});
// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden (zoals HTML, CSS en client JS) vanuit de hoofdmap
app.use(express.static(__dirname));

// Stuur kas.html mee als iemand de hoofd-URL bezoekt
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'kas.html'));
});

// Verbind met SQLite database
const db = new sqlite3.Database('./kasboek.db', (err) => {
    if (err) {
        console.error('Fout bij open database:', err.message);
    } else {
        console.log('Verbonden met de SQLite-database.');
    }
});

// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden (zoals HTML, CSS en client JS) vanuit de hoofdmap
app.use(express.static(__dirname));

// Stuur kas.html mee als iemand de hoofd-URL bezoekt
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'kas.html'));
});

// Verbind met SQLite database
const db = new sqlite3.Database('./kasboek.db', (err) => {
    if (err) {
        console.error('Fout bij open database:', err.message);
    } else {
        console.log('Verbonden met de SQLite-database.');
    }
});
// Middleware om JSON-data te kunnen ontvangen
app.use(express.json());

// Server statische bestanden (zoals HTML, CSS en client JS) vanuit de hoofdmap
app.use(express.static(__dirname));

// Stuur kas.html mee als iemand de hoofd-URL bezoekt
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'kas.html'));
});

// Verbind met SQLite database
const db = new sqlite3.Database('./kasboek.db', (err) => {
    if (err) {
        console.error('Fout bij open database:', err.message);
    } else {
        console.log('Verbonden met de SQLite-database.');
    }
});// Middleware om JSON data te kunnen ontvangen
app.use(express.json());

// Serveer statische bestanden (zoals je HTML, CSS en client JS) vanuit dezelfde map
app.use(express.static(path.join(__dirname)));

// Verbinden met SQLite database (wordt automatisch aangemaakt als bestand)
const db = new sqlite3.Database('./kasboek.db', (err) => {
    if (err) {
        console.error('Fout bij openen database:', err.message);
    } else {
        console.log('Verbonden met de SQLite database.');
    }
});

// Maak een tabel aan voor centrale opslag (sleutel-waarde of per module)
db.run(`CREATE TABLE IF NOT EXISTS app_data (
    key TEXT PRIMARY KEY,
    value TEXT
)`);

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




// Start de server
app.listen(PORT, () => {
    console.log(`Server draait op http://localhost:${PORT}`);
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
