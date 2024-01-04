const CheckTokenNoDB = require("../../func/checkTokenNO_DB");
const { Pool } = require("pg");
require("dotenv").config();

const SendMessageToDB = async (req, res) => {
  const { token, username, message, fileType } = req.body;
  const file = req.file;
  const buffer = file ? file.buffer : null;

  if (!(token && username && (message || file)))
    if (!res.headersSent) {
      res.status(400).json("missing data");
      return;
    }

  const tokenUsername = await CheckTokenNoDB(token);
  if (tokenUsername === false) {
    if (!res.headersSent) res.status(401).json("wrong token");
    return;
  }

  const pool = new Pool({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

  const handleSendMessageToDB = async () => {
    const idQuery = await pool.query(
      `INSERT INTO message_tbl (msg_from, msg_to, message, sent_date, file, file_type) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING msg_id as id, file`,
      [
        tokenUsername,
        username,
        message,
        new Date().toISOString(),
        buffer,
        fileType,
      ]
    );
    if (!res.headersSent) res.status(200).json(idQuery.rows[0]);
  };
  handleSendMessageToDB();
};

module.exports = SendMessageToDB;
