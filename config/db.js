const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function testConnection() {
  try {
    const { rows } = await pool.query("SELECT NOW()");
    console.log(
      "✅ Successfully connected to Neon database. Current time:",
      rows[0].now
    );
  } catch (err) {
    console.error(" Error acquiring client", err.stack);
    console.error(
      "Please check your database connection parameters in .env file"
    );
  }
}


const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS admin (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Tables are ready");
  } catch (error) {
    console.error("❌ Error creating tables:", error.message);
    console.error("Please check your database connection and permissions");
  }
};


(async () => {
  await testConnection();
  await createTables();
})();

module.exports = pool;
