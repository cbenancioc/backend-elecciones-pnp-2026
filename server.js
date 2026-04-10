const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 10000;

// Configuración de CORS para permitir la conexión con el mapa
app.use(cors());
app.use(express.json());

// Conexión con la Base de Datos Supabase
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// --- RUTAS DEL SISTEMA ---

// 1. Ruta de Prueba de Vida del Servidor
app.get('/', (req, res) => {
  res.send('Servidor de Inteligencia PNP Operativo');
});

// 2. Ruta para Puntos Críticos (Existente)
app.get('/puntos-criticos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM puntos_criticos');
    res.json(result.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Error en servidor');
  }
});

// 3. NUEVA RUTA: VINCULACIÓN POLICIAL (Para App.js)
app.get('/personal-asignado', async (req, res) => {
  try {
    // Consulta a la tabla que contiene el personal y sus locales asignados
    const result = await pool.query('SELECT * FROM fuerza_efectiva_elecciones');
    res.json(result.rows);
  } catch (err) {
    console.error("Error en consulta de personal:", err.message);
    res.status(500).json({ error: "Error interno del servidor al obtener personal" });
  }
});

// Inicio del Servidor
app.listen(port, () => {
  console.log(`Servidor táctico corriendo en el puerto ${port}`);
});
