const express = require('express');
const path = require('path');
const db = require('./database.js'); // Importamos la base de datos

const app = express();
const PORT = process.env.PORT || 3000;

// --- Middlewares ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Añadido: logging simple de todas las peticiones para depurar
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// --- Servir archivos estáticos ---
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// Añadido: ruta explícita para admin.html (evita ambigüedades)
app.get('/admin.html', (req, res) => {
    res.sendFile(path.join(publicPath, 'admin.html'));
});

// --- Rutas de la API (aquí irá la lógica) ---

// GET /api/socios - Obtener todos los socios
app.get('/api/socios', (req, res) => {
    const sql = "SELECT * FROM socios ORDER BY nombre";
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ message: 'Error al consultar la base de datos.' });
        }
        res.json(rows);
    });
});

// POST /api/socios - Crear o actualizar un socio
app.post('/api/socios', (req, res) => {
    const { id, nombre, fecha_vencimiento_cuota } = req.body;
    // Usamos REPLACE INTO que inserta una nueva fila, o la reemplaza si el ID ya existe.
    const sql = "REPLACE INTO socios (id, nombre, fecha_vencimiento_cuota) VALUES (?, ?, ?)";
    
    db.run(sql, [id, nombre, fecha_vencimiento_cuota], function(err) {
        if (err) {
            return res.status(400).json({ message: 'Error al guardar el socio.', error: err.message });
        }
        res.status(201).json({ message: 'Socio guardado correctamente.', id: this.lastID });
    });
});

// DELETE /api/socios/:id - Eliminar un socio
app.delete('/api/socios/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM socios WHERE id = ?";
    db.run(sql, id, function(err) {
        if (err) {
            return res.status(400).json({ message: 'Error al eliminar el socio.', error: err.message });
        }
        res.json({ message: 'Socio eliminado.', changes: this.changes });
    });
});

// Ruta para verificar el acceso de un socio
app.post('/api/acceso/verificar', (req, res) => {
    const { socioId } = req.body;
    console.log(`Intento de acceso con ID: ${socioId}`);

    const sql = "SELECT * FROM socios WHERE id = ?";

    db.get(sql, [socioId], (err, socio) => {
        if (err) {
            console.error(err.message);
            return res.status(500).json({ message: 'Error interno del servidor.' });
        }

        if (!socio) {
            return res.status(404).json({ message: 'Acceso Denegado: Socio no encontrado.' });
        }

        const hoy = new Date();
        const fechaVencimiento = new Date(socio.fecha_vencimiento_cuota);

        // Comparamos solo la fecha, ignorando la hora
        hoy.setHours(0, 0, 0, 0);
        fechaVencimiento.setHours(0, 0, 0, 0);

        if (fechaVencimiento >= hoy) {
            res.status(200).json({ message: `Acceso Permitido. ¡Bienvenido, ${socio.nombre}!` });
        } else {
            res.status(403).json({ message: 'Acceso Denegado: Cuota pendiente de pago.' });
        }
    });
});

// Por ahora, un ejemplo para probar que funciona
app.get('/api/test', (req, res) => {
    res.json({ message: '¡La API funciona correctamente!' });
});

// --- Iniciar el servidor ---
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});