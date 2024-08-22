const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 4000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para servir el archivo JSON del menú
app.get('/api/menu', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'data', 'menu.json'));
});

// Ruta principal para servir la página de inicio
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Ruta para la página del carrito
app.get('/carrito', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'carrito.html'));
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

