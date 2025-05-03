const express = require('express');
const path = require('path');

// Importar rutas
const rutaVinos = require('./routes/vinos');  // Asegúrate de que la ruta sea correcta

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));  // Middleware para parsear datos de formularios
app.use(express.json());  // Middleware para parsear JSON

// Archivos estáticos (para las imágenes subidas y otros archivos estáticos)
app.use(express.static(path.join(__dirname, 'public')));  // Asegúrate de que 'public' esté accesible



app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Motor de vistas
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'view'));  // Asegúrate de que las vistas estén en la carpeta 'views'

// Usar rutas
app.use('/', rutaVinos);  // Revisa que esta ruta esté correcta

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
