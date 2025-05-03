const express = require('express');
const router = express.Router();
const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

// Configuración del directorio de subidas
const uploadsDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configuración de Multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'imagen-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.jpg' && ext !== '.jpeg' && ext !== '.png') {
      return cb(new Error('Solo se permiten archivos .jpg, .jpeg y .png'));
    }
    cb(null, true);
  }
});

// Configuración de body-parser para formularios
router.use(bodyParser.urlencoded({ extended: true })); // Para formularios codificados como x-www-form-urlencoded
router.use(bodyParser.json()); // Para formularios JSON

// 👉 Página de bienvenida (index2.ejs)
router.get('/', (req, res) => {
  res.render('index2');
});

// 👉 Catálogo de vinos (index.ejs)
router.get('/catalogo', async (req, res) => {
  try {
    const query = `
      SELECT
        V.idvino,
        M.marca AS marca,
        V.nombre,
        V.variedad,
        V.anio,
        V.tipo,
        V.alcohol,
        V.precio,
        V.imagen_url
      FROM vinos V
      INNER JOIN marcas M ON V.idmarca = M.idmarca
    `;
    const [vinos] = await db.query(query);
    res.render('index', { vinos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar los vinos');
  }
});

// 👉 Ruta para mostrar formulario de creación
router.get('/create', async (req, res) => {
  try {
    const [datos] = await db.query("SELECT * FROM marcas");
    res.render('create', { marcas: datos });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar el formulario');
  }
});

// 👉 Crear nuevo vino
router.post('/create', upload.single('imagen'), async (req, res) => {
  try {
    // Verificar si se subió un archivo
    if (!req.file) {
      return res.status(400).send('No se ha subido ninguna imagen');
    }

    const { marcas, nombre, variedad, anio, tipo, alcohol, precio } = req.body;

    // Guardar la URL de la imagen
    const imagen_url = '/uploads/' + req.file.filename;

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
      return res.status(400).send('El precio debe ser un número válido');
    }

    // Guardar el vino en la base de datos
    await db.query(`
      INSERT INTO vinos (idmarca, nombre, variedad, anio, tipo, alcohol, precio, imagen_url)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [marcas, nombre, variedad, anio, tipo, alcohol, precioNum, imagen_url]);

    res.redirect('/catalogo');  // Redirige al catálogo
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al registrar el vino');
  }
});

// 👉 Formulario de edición
router.get('/edit/:idvino', async (req, res) => {
  try {
    const { idvino } = req.params;
    const [vino] = await db.query(`
      SELECT
        V.idvino,
        V.nombre,
        V.variedad,
        V.anio,
        V.tipo,
        V.alcohol,
        V.precio,
        V.imagen_url,
        M.idmarca,
        M.marca
      FROM vinos V
      INNER JOIN marcas M ON V.idmarca = M.idmarca
      WHERE V.idvino = ?`, [idvino]);

    const [marcas] = await db.query("SELECT * FROM marcas");

    res.render('edit', { vino: vino[0], marcas });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al cargar los datos del vino');
  }
});

// 👉 Actualizar vino
router.post('/edit/:idvino', upload.single('imagen'), async (req, res) => {
  try {
    const { idvino } = req.params;
    const { marcas, nombre, variedad, anio, tipo, alcohol, precio } = req.body;

    let imagen_url = null;

    // Si se sube una nueva imagen, actualizar la URL
    if (req.file) {
      imagen_url = '/uploads/' + req.file.filename;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum)) {
      return res.status(400).send('El precio debe ser un número válido');
    }

    // Si no se ha subido una nueva imagen, mantener la imagen actual
    const queryUpdate = `
      UPDATE vinos
      SET idmarca = ?, nombre = ?, variedad = ?, anio = ?, tipo = ?, alcohol = ?, precio = ?, 
          imagen_url = IFNULL(?, imagen_url)
      WHERE idvino = ?`;

    await db.query(queryUpdate, [marcas, nombre, variedad, anio, tipo, alcohol, precioNum, imagen_url, idvino]);

    res.redirect('/catalogo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al actualizar el vino');
  }
});

// 👉 Eliminar vino
router.get('/delete/:idvino', async (req, res) => {
  try {
    const { idvino } = req.params;
    await db.query("DELETE FROM vinos WHERE idvino = ?", [idvino]);
    res.redirect('/catalogo');
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al eliminar el vino');
  }
});

module.exports = router;
