<<<<<<< HEAD
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root', // replace with your MySQL username
  password: '', // replace with your MySQL password
  database: 'perpus'
});

// Middleware untuk permintaan
const cors = require('cors');
app.use(cors());

db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'admin')));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';  // Path ke folder uploads
    cb(null, uploadPath);  // Tentukan folder tujuan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Menyimpan dengan nama unik
  }
});

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Contoh rute POST untuk menambahkan buku
app.post('/addbook', upload.single('gambar'), (req, res) => {
  const { judul, pengarang, penerbit, tahun_terbit, jumlah_buku } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const query = 'INSERT INTO databuku (judul, pengarang, penerbit, tahun_terbit, jumlah_buku, gambar) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [judul, pengarang, penerbit, tahun_terbit, jumlah_buku, gambar], (err, result) => {
    if (err) throw err;
    console.log('Buku berhasil ditambahkan:', result); // Menambahkan log di sini untuk memverifikasi
    res.send('Buku berhasil ditambahkan!');
  });
});


// READ - Get all books
app.get('/books', (req, res) => {
  db.query('SELECT * FROM databuku', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Menambahkan route untuk root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'databuku.html'));  // Sesuaikan dengan lokasi file HTML yang diinginkan
});

// UPDATE - Update book data
app.put('/updatebook/:judul', upload.single('gambar'), (req, res) => {
  const { judul } = req.params;
  const { pengarang, penerbit, tahun_terbit, jumlah_buku } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const query = 'UPDATE databuku SET pengarang = ?, penerbit = ?, tahun_terbit = ?, jumlah_buku = ?, gambar = ? WHERE judul = ?';
  db.query(query, [pengarang, penerbit, tahun_terbit, jumlah_buku, gambar, judul], (err, result) => {
    if (err) throw err;
    res.send('Book updated successfully');
  });
});

// DELETE - Delete a book
app.delete('/deletebook/:judul', (req, res) => {
  const { judul } = req.params;

  const query = 'DELETE FROM databuku WHERE judul = ?';
  db.query(query, [judul], (err, result) => {
    if (err) throw err;
    res.send('Book deleted successfully');
  });
});

// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
=======
>>>>>>> be200e6c5766c8fdc47b1c01f2cb175a1f137ee6
