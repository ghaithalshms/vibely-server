const funcIsValidUsername = require("../../func/is_valid_username");
const { Pool } = require("pg");

const checkUsername = async (req, res) => {
  const { username } = req.body;

  if (!username) {
    return res.status(400).json("Data missing");
  }

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    const isValid = validateUsername(username);

    if (!isValid) {
      return res
        .status(200)
        .json("Only letters, numbers, and underscores are allowed.");
    }

    const isTaken = await isUsernameTaken(client, username);

    if (!isTaken) {
      return res.status(200).json("This username is available.");
    } else {
      return res.json("This username is already taken.");
    }
  } catch (err) {
    handleError(res)(err);
  } finally {
    await client?.release();
  }
};

const handleError = (res) => (err) => {
  console.error("Unexpected error:", err);
  res.status(500).json(err);
};

const validateUsername = (username) => {
  return funcIsValidUsername(username);
};

const isUsernameTaken = async (client, username) => {
  const result = await client.query(
    `SELECT username FROM user_tbl WHERE username = $1`,
    [username]
  );
  return result.rows.length > 0;
};

module.exports = checkUsername;
