const { Pool } = require("pg");

let pool = new Pool({
  connectionString: process.env.DATABASE_STRING,
  max: 20,
});

module.exports = pool;
