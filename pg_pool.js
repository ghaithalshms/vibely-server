const { Pool } = require("pg");

const _pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  connectionTimeoutMillis: 5000,
});

module.exports = _pool;
