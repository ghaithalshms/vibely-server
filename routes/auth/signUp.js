const FuncIsValidUsername = require("../../func/funcIsValidUsername");
const { Pool } = require("pg");
require("dotenv").config();
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  const pool = new Pool({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });
  try {
    await pool
      .connect()
      .then()
      .catch(() => {
        if (!res.headersSent) res.status(502).json("DB connection error");
        return;
      });

    const { username, firstName, password, email } = req.body;

    usernameVerified = username.toLowerCase().trim();

    if (usernameVerified && firstName && password && email) {
      if (FuncIsValidUsername(usernameVerified)) {
        client = await pool.connect();
        const usernameQuery = await client.query(
          "SELECT username FROM user_tbl WHERE username =$1",
          [usernameVerified]
        );
        if (usernameQuery.rows.length === 0) {
          await client.query(
            "INSERT INTO user_tbl (username, password, email, first_name, created_date)" +
              "values ($1, $2, $3, $4, $5)",
            [
              usernameVerified,
              password,
              email,
              firstName,
              new Date().toISOString(),
            ]
          );
          const token = jwt.sign(
            {
              username: usernameVerified,
              tokenVersion: 1,
            },
            process.env.JWT_SECRET_KEY,
            {
              expiresIn: "1000d",
            }
          );
          if (!res.headersSent)
            res.status(201).json({
              token,
              message: "Your account has been created, welcome to Vibely!",
            });
        } else {
          if (!res.headersSent)
            res.status(409).json("Username is already taken.");
        }
      } else {
        if (!res.headersSent)
          res.status(400).json("Username is not available.");
      }
    }
  } catch (err) {
    if (!res.headersSent) res.status(500).json(err);
  }
};

module.exports = signUp;
