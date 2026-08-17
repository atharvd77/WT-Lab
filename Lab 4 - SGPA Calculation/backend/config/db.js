const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'vit_sgpa_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Quick connectivity check on boot (non-fatal, just logs a warning)
(async () => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    console.log('✅ Connected to MySQL database:', process.env.DB_NAME);
  } catch (err) {
    console.warn('⚠️  Could not connect to MySQL. Make sure MySQL is running and .env is configured.');
    console.warn('   Error:', err.message);
  }
})();

module.exports = pool;
