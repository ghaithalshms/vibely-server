const funcIsValidUsername = require("../../func/is_valid_username");
const pool = require("../../pg_pool");

const checkUsername = async (req, res) => {
  const { username } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));
  client.on("error", (err) => console.log(err));

  try {
    if (!username) {
      res.status(400).json("data missing");
      return;
    }

    if (!funcIsValidUsername(username)) {
      if (!res.headersSent)
        res.json("Only letters, numbers, and underscores are allowed.");
      return;
    }

    const result = await client.query(
      `SELECT username FROM user_tbl WHERE username = $1`,
      [username]
    );
    if (result.rows.length === 0) {
      if (!res.headersSent) res.status(200).json("This username is available.");
    } else {
      if (!res.headersSent) res.json("This username is already taken.");
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = checkUsername;
