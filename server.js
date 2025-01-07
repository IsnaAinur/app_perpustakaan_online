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
  database: 'coba'
});

//middleware untuk permintaan
const cors = require('cors');
app.use(cors());


db.connect(err => {
  if (err) throw err;
  console.log('Connected to the database!');
});

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';  // Path ke folder uploads
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// CREATE - Add new user
app.post('/adduser', upload.single('gambar'), (req, res) => {
  const { nim, nama, program_studi, jenis_kelamin, alamat } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const query = 'INSERT INTO dataanggota (nim, nama, program_studi, jenis_kelamin, alamat, gambar) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [nim, nama, program_studi, jenis_kelamin, alamat, gambar], (err, result) => {
    if (err) throw err;
    res.send('user added successfully');
  });
});

// READ - Get all users
app.get('/users', (req, res) => {
  db.query('SELECT * FROM dataanggota', (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Menambahkan route untuk root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin', 'dataanggota.html'));  // Sesuaikan dengan lokasi file HTML yang diinginkan
  });
  

// UPDATE - Update user data
app.put('/updateuser/:nim', upload.single('gambar'), (req, res) => {
  const { nim } = req.params;
  const { nama, program_studi, jenis_kelamin, alamat } = req.body;
  const gambar = req.file ? req.file.filename : null;

  const query = 'UPDATE dataanggota SET nama = ?, program_studi = ?, jenis_kelamin = ?, alamat = ?, gambar = ? WHERE nim = ?';
  db.query(query, [nama, program_studi, jenis_kelamin, alamat, gambar, nim], (err, result) => {
    if (err) throw err;
    res.send('user updated successfully');
  });
});

// DELETE - Delete a user
app.delete('/deleteuser/:nim', (req, res) => {
  const { nim } = req.params;

  const query = 'DELETE FROM dataanggota WHERE nim = ?';
  db.query(query, [nim, nama, program_studi, jenis_kelamin, alamat, gambar], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Error while adding user');
    }
    res.send('User added successfully');
  });  
});

// Start server
app.listen(port, () => {
  console.log(Server is running on http://localhost:${port});
});