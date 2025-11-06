const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Definimos la ruta al archivo de la base de datos
const dbPath = path.resolve(__dirname, '../db/gimnasio.db');

// Creamos o nos conectamos a la base de datos
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error al abrir la base de datos', err.message);
    } else {
        console.log('Conectado a la base de datos SQLite.');
        // Creamos las tablas si no existen
        db.run(`CREATE TABLE IF NOT EXISTS socios (
            id TEXT PRIMARY KEY,
            nombre TEXT NOT NULL,
            fecha_vencimiento_cuota DATE
        )`, (err) => {
            if (err) {
                console.error('Error al crear la tabla socios', err.message);
            } else {
                // Insertamos datos de ejemplo si la tabla está vacía
                const insert = 'INSERT OR IGNORE INTO socios (id, nombre, fecha_vencimiento_cuota) VALUES (?,?,?)';
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);

                db.run(insert, ["12345", "Socio Activo", tomorrow.toISOString().split('T')[0]]);
                db.run(insert, ["67890", "Socio Vencido", yesterday.toISOString().split('T')[0]]);
            }
        });
    }
});

module.exports = db;