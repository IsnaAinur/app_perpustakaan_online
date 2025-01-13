const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

app.use(express.static('html_admin'));


// MySQL database connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
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
app.use(express.static(path.join(__dirname, 'html_admin')));

const methodOverride = require('method-override');
app.use(methodOverride('_method'));

// Multer configuration for image upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'uploads/');  // Folder tempat file disimpan
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + path.extname(file.originalname));  // Nama file yang unik
  }
});


// ================= CRUD Data Anggota =================
const fs = require('fs');
function convertImageToBase64(imagePath) {
  const image = fs.readFileSync(imagePath); // Membaca gambar sebagai binary
  return `data:image/jpeg;base64,${image.toString('base64')}`; // Mengonversi ke base64
}
// Multer configuration for image upload (folder uploadprofil)
const storageProfil = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploadprofil/'); // Folder tempat file disimpan
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Nama file unik
  }
});

// Initialize multer upload middleware for profile pictures
const uploadProfil = multer({ storage: storageProfil });

app.get('/dataanggota/:NIM', (req, res) => {
  const { NIM } = req.params;
  const query = 'SELECT * FROM data_anggota WHERE NIM = ?';
  db.query(query, [NIM], (err, result) => {
      if (err) {
          console.error("Error fetching data:", err);
          res.status(500).send("Error fetching data");
      } else if (result.length === 0) {
          res.status(404).send("Anggota not found");
      } else {
          res.json(result[0]);
      }
  });
});

app.get('/dataanggota', (req, res) => {
  const query = 'SELECT * FROM data_anggota';
  db.query(query, (err, result) => {
      if (err) {
          console.error("Error fetching data:", err);
          res.status(500).send("Error fetching data");
      } else {
          res.json(result);
      }
  });
});


// POST - addanggota
app.post('/addanggota', uploadProfil.single('foto'), (req, res) => {
  const { NIM, nama, jenis_kelamin, program_studi, alamat } = req.body;
  const fotoPath = req.file ? `uploadprofil/${req.file.filename}` : null;

  const query = 'INSERT INTO data_anggota (NIM, nama, jenis_kelamin, program_studi, alamat, foto) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [NIM, nama, jenis_kelamin, program_studi, alamat, fotoPath], (err, result) => {
    if (err) {
      console.error("Error inserting data: ", err);
      res.status(500).send("Error inserting data");
    } else {
      res.redirect('/dataanggota.html');
    }
  });
});


// PUT - Update anggota data
app.put('/updateanggota/:NIM', uploadProfil.single('foto'), (req, res) => {
  const { NIM } = req.params;
  const { nama, jenis_kelamin, program_studi, alamat } = req.body;
  const fotoPath = req.file ? `uploadprofil/${req.file.filename}` : null;

  const query = 'UPDATE data_anggota SET nama = ?, jenis_kelamin = ?, program_studi = ?, alamat = ?, foto = ? WHERE NIM = ?';
  db.query(query, [nama, jenis_kelamin, program_studi, alamat, fotoPath, NIM], (err, result) => {
      if (err) {
          console.error("Error updating data:", err);
          res.status(500).send("Error updating data");
      } else {
          res.status(200).send("Data berhasil diperbarui"); // Pastikan status 200 OK
      }
  });
});





// DELETE - Delete anggota
app.delete('/deleteanggota/:NIM', (req, res) => {
  const { NIM } = req.params;
  const query = 'DELETE FROM data_anggota WHERE NIM = ?';
  db.query(query, [NIM], (err, result) => {
      if (err) {
          console.error("Error deleting data:", err);
          res.status(500).send("Error deleting data");
      } else {
          res.send('Anggota deleted successfully');
      }
  });
});




// Middleware untuk menangani error file jika file foto tidak disertakan.
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Serve profile picture files (optional, jika Anda ingin menampilkan foto di frontend)
app.use('/uploadprofil', express.static(path.join(__dirname, 'uploadprofil')));



// ================= CRUD Data Buku =================

// Initialize multer upload middleware
const upload = multer({ storage: storage });

// Contoh rute POST untuk menambahkan buku
app.post('/addbook', upload.single('gambar'), (req, res) => {
  const { judul, pengarang, penerbit, tahun_terbit, jumlah_buku } = req.body;
  const gambarPath = req.file ? `uploads/${req.file.filename}` : null;

  const query = 'INSERT INTO databuku (judul, pengarang, penerbit, tahun_terbit, jumlah_buku, gambar) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(query, [judul, pengarang, penerbit, tahun_terbit, jumlah_buku, gambarPath], (err, result) => {
    if (err) {
      console.error("Error inserting data: ", err);
      res.status(500).send("Error inserting data");
    } else {
      res.redirect('/databuku.html');
    }
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
    res.sendFile(path.join(__dirname, 'html_admin', 'databuku.html'));  // Sesuaikan dengan lokasi file HTML yang diinginkan
});

// UPDATE - Update book data
app.put('/updatebook/:judul', upload.single('gambar'), (req, res) => {
  const { judul } = req.params;
  const { pengarang, penerbit, tahun_terbit, jumlah_buku } = req.body;
  const gambarPath = req.file ? `uploads/${req.file.filename}` : null;

  const query = 'UPDATE databuku SET pengarang = ?, penerbit = ?, tahun_terbit = ?, jumlah_buku = ?, gambar = ? WHERE judul = ?';
  db.query(query, [pengarang, penerbit, tahun_terbit, jumlah_buku, gambarPath, judul], (err, result) => {
    if (err) {
      console.error("Error updeting data: ", err);
      res.status(500).send("Error updering data");
    } else {
      res.redirect('/databuku.html');
    }
  });
});

// DELETE - Delete a book
app.delete('/deletebook/:judul', (req, res) => {
  const { judul } = req.params;
  console.log('Judul yang akan dihapus:', judul); // Debug log
  
  const query = 'DELETE FROM databuku WHERE judul = ?';
  db.query(query, [judul], (err, result) => {
    if (err) {
    console.error('Error deleting book:', err); // Debug log
      res.status(500).send('Internal Server Error');
      return;
    }
    if (result.affectedRows > 0) {
      console.log('Buku berhasil dihapus:', result); // Debug log
      res.send('Book deleted successfully');
    } else {
      res.status(404).send('Book not found');
    }
  });
});

// Middleware untuk melayani file statis dari folder uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


// Start server
app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
