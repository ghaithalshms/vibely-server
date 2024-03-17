const { Pool } = require("pg");

let pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  max: 20,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

module.exports = pool;
