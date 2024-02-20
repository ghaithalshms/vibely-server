const { Pool } = require("pg");

let pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  connectionTimeoutMillis: 50000,
});

const getPoolIdleCount = () => {
  let poolIdleCount;
  try {
    poolIdleCount = pool?.idleCount;
  } catch (error) {
    poolIdleCount = 0;
  }

  return poolIdleCount;
};

const _pool = () => {
  if (getPoolIdleCount > 0) return pool;
  else {
    pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });
    return pool;
  }
};

module.exports = _pool();
