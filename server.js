require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'castidekor2026'; // change this in production!

// ---------- Database setup ----------
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}
const db = new Database(path.join(dataDir, 'castidekor.db'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS contacts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    phone TEXT,
    event_type TEXT,
    event_date TEXT,
    message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  )
`);

const insertContact = db.prepare(`
  INSERT INTO contacts (name, phone, event_type, event_date, message)
  VALUES (@name, @phone, @event_type, @event_date, @message)
`);

const getAllContacts = db.prepare(`SELECT * FROM contacts ORDER BY created_at DESC`);
const deleteContact = db.prepare(`DELETE FROM contacts WHERE id = ?`);

// ---------- Middleware ----------
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// very simple request logging so you can see traffic in the terminal/logs
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// ---------- Public API: submit a contact ----------
app.post('/api/contact', (req, res) => {
  const { name, phone, event_type, event_date, message } = req.body || {};

  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ ok: false, error: 'Emri është i domosdoshëm.' });
  }

  try {
    const info = insertContact.run({
      name: name.trim().slice(0, 200),
      phone: (phone || '').trim().slice(0, 60),
      event_type: (event_type || '').trim().slice(0, 60),
      event_date: (event_date || '').trim().slice(0, 40),
      message: (message || '').trim().slice(0, 2000),
    });
    res.json({ ok: true, id: info.lastInsertRowid });
  } catch (err) {
    console.error('Insert failed:', err);
    res.status(500).json({ ok: false, error: 'Gabim në server. Provo përsëri.' });
  }
});

// ---------- Admin auth helper ----------
function requireAdmin(req, res, next) {
  const provided = req.headers['x-admin-password'] || req.query.password;
  if (provided !== ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false, error: 'Unauthorized' });
  }
  next();
}

// ---------- Admin API: list / delete contacts ----------
app.get('/api/admin/contacts', requireAdmin, (req, res) => {
  res.json({ ok: true, contacts: getAllContacts.all() });
});

app.delete('/api/admin/contacts/:id', requireAdmin, (req, res) => {
  deleteContact.run(req.params.id);
  res.json({ ok: true });
});

// ---------- Health check (useful for hosting platforms) ----------
app.get('/api/health', (req, res) => res.json({ ok: true, status: 'up' }));

app.listen(PORT, () => {
  console.log(`Çastidekor server running on http://localhost:${PORT}`);
  console.log(`Admin panel:            http://localhost:${PORT}/admin.html`);
});
