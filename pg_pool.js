const { Pool } = require("pg");

let pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  connectionTimeoutMillis: 50000,
});

const _pool = () => {
  if (pool.idleCount > 0) return pool;
  else {
    pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    return pool;
  }
};

module.exports = _pool();
