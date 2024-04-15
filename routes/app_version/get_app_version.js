const { Pool } = require("pg");
require("dotenv").config();

const GetAppVersion = async (req, res) => {
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    client.query(`SELECT * FROM app_version_tbl`).then((result) => {
      res.json(result.rows[0].version);
    });
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = GetAppVersion;
