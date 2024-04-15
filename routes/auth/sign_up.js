const FuncIsValidUsername = require("../../func/is_valid_username");
const jwt = require("jsonwebtoken");
const { Pool } = require("pg");

require("dotenv").config();

const signUp = async (req, res) => {
  const { username, firstName, password, email } = req.body;

  if (!(username && firstName && password && email)) {
    return res.status(400).json("Missing required data");
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
    const usernameVerified = validateUsername(username);

    if (!usernameVerified) {
      return res.status(400).json("Invalid username");
    }

    if (await isUsernameTaken(client, usernameVerified)) {
      return res.status(409).json("Username is already taken");
    }

    await createUser(client, usernameVerified, password, email, firstName);

    const token = generateToken(usernameVerified);

    const browserID = generateUniqueBrowserID();

    res.status(201).json({
      token,
      username: usernameVerified,
      browserID,
      message: "Your account has been created, welcome to Vibely!",
    });
  } catch (err) {
    handleError(res)(err);
  } finally {
    await client?.release();
  }
};

const handleError = (res) => (err) => {
  console.error(err);
  res.status(500).json(err);
};

const validateUsername = (username) => {
  const usernameVerified = username.toLowerCase().trim();
  return FuncIsValidUsername(usernameVerified) ? usernameVerified : null;
};

const isUsernameTaken = async (client, username) => {
  const usernameQuery = await client.query(
    "SELECT username FROM user_tbl WHERE username =$1",
    [username]
  );
  return usernameQuery.rows.length > 0;
};

const createUser = async (client, username, password, email, firstName) => {
  await client.query(
    "INSERT INTO user_tbl (username, password, email, first_name, created_date)" +
      "values ($1, $2, $3, $4, $5)",
    [username, password, email, firstName, new Date().toISOString()]
  );
};

const generateToken = (username) => {
  return jwt.sign({ username, tokenVersion: 1 }, process.env.JWT_SECRET_KEY, {
    expiresIn: "1000d",
  });
};

const generateUniqueBrowserID = () => {
  return Math.random().toString(16).substring(2) + Date.now().toString(16);
};

module.exports = signUp;
