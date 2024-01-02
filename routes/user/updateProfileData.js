const { Pool } = require("pg");
const checkToken = require("../../func/checkToken");

const UpdateProfileData = async (req, res) => {
  const { token, username, firstName, lastName, biography, link, privacity } =
    req.body;
  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
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
    const handleUpdateProfileData = async () => {
      await pool.query(
        `UPDATE user_tbl 
        SET username=$1,
        first_name=$2,
        last_name=$3,
        biography=$4,
        link=$5,
        privacity=$6,
        WHERE username=$7`,
        [
          username,
          firstName,
          lastName,
          biography,
          link,
          privacity,
          tokenUsername,
        ]
      );
      if (!res.headersSent) res.status(200).json("data updated");

      handleUpdateProfileData();
    };
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = UpdateProfileData;
