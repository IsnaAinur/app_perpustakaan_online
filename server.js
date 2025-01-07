const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

// Inisialisasi aplikasi
const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Konfigurasi koneksi database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'password', // Ganti dengan password MySQL Anda
  database: 'digital_library' // Pastikan database sudah dibuat
});

// Tes koneksi database
db.connect(err => {
  if (err) {
    console.error('Database connection error:', err);
    process.exit(1); // Keluar jika koneksi gagal
  }
  console.log('Connected to the database');
});

// CREATE: Tambah user baru
app.post('/users', (req, res) => {
  const { name, email, role } = req.body;
  if (!name || !email || !role) {
    return res.status(400).json({ error: 'Name, email, and role are required' });
  }

  const sql = 'INSERT INTO users (name, email, role) VALUES (?, ?, ?)';
  db.query(sql, [name, email, role], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to create user' });
    }
    res.status(201).json({ message: 'User created', userId: result.insertId });
  });
});

// READ: Ambil semua user
app.get('/users', (req, res) => {
  const sql = 'SELECT * FROM users';
  db.query(sql, (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch users' });
    }
    res.json(results);
  });
});

// READ: Ambil user berdasarkan ID
app.get('/users/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'SELECT * FROM users WHERE id = ?';
  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to fetch user' });
    }
    if (results.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(results[0]);
  });
});

// UPDATE: Perbarui user berdasarkan ID
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;

  const sql = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
  db.query(sql, [name, email, role, id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to update user' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User updated' });
  });
});

// DELETE: Hapus user berdasarkan ID
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  const sql = 'DELETE FROM users WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Failed to delete user' });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
