const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const UpdateProfilePicture = async (req, res) => {
  const { token } = req.body;
  const file = req.file;
  const buffer = file ? file.buffer : null;
  try {
    if (!token) {
      res.status(401).json("data missing");
      return;
    }
    const pool = new Pool({
      connectionString: process.env.DATABASE_STRING,
      connectionTimeoutMillis: 5000,
    });

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    // DEFINITION OF FUNCTIONS
    const handleUpdateProfilePicture = async () => {
      await pool.query(
        `UPDATE user_tbl 
        SET picture=$1
        WHERE username=$2`,
        [buffer, tokenUsername]
      );
      if (!res.headersSent) res.status(200).json("pfp updated");

      handleUpdateProfilePicture();
    };
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = UpdateProfilePicture;
