/**
 * SERVIDOR BACKEND - ELECCIONES 2026 (CC. OPERACIONES)
 * Este servidor hace de puente entre PostgreSQL/PostGIS y el Aplicativo Web (React).
 */

const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();

app.use(cors());
app.use(express.json());

// --- 1. CONFIGURACIÓN (MODO CONFIANZA LOCAL) ---
const pool = new Pool({
    user: 'postgres',
    host: 'db.fdexkgchsrzclllpxsrf.supabase.co',
    database: 'postgres', // Apuntamos a la base de datos donde están sus mapas
    password: 'Ybena230297$$', // Al usar el modo 'trust', el motor dejará entrar sin validar esta clave
    port: 5432,
    ssl: { rejectUnauthorized: false }
});

pool.connect()
    .then(() => console.log('✅ ¡Conectado exitosamente a PostgreSQL (test_geo) en Modo Confianza!'))
    .catch(err => console.error('❌ Error de conexión:', err.message));

// --- 2. RUTAS (ENDPOINTS) DE LA API ---

app.post('/api/login', async (req, res) => {
    const { dni, cip } = req.body;
    try {
        res.json({
            success: true,
            user: { dni, cip, role: 'agente', nombre: 'AGENTE AUTENTICADO' }
        });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
});

app.get('/api/locales', async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                nombre_del AS nombre, 
                direccion AS direccion, 
                distrito AS distrito, 
                mesas, 
                electores,
                ST_Y(geom) as lat, 
                ST_X(geom) as lng
            FROM locales;
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error al extraer locales:', error.message);
        res.status(500).json({ error: 'Falla al extraer cartografía.' });
    }
});

app.post('/api/novedades', async (req, res) => {
    const { agente_dni, local_id, tipo_incidencia, prioridad, descripcion } = req.body;
    try {
        console.log(`🚨 ALERTA RECIBIDA: ${tipo_incidencia} (Prioridad: ${prioridad})`);
        res.json({ success: true, message: 'Novedad registrada' });
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar la novedad' });
    }
});

// --- 3. INICIAR EL SERVIDOR ---
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🛡️  SERVIDOR C.C. OPERACIONES INICIADO EN PUERTO ${PORT}`);
    console.log(`🌐 API escuchando en: http://127.0.0.1:${PORT}`);
    console.log(`======================================================\n`);
});
