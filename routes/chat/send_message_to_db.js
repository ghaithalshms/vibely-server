const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Client } = require("pg");
require("dotenv").config();

const SendMessageToDB = async (req, res) => {
  const { token, username, message, fileType } = req.body;
  const file = req.file;
  const buffer = file ? file.buffer : null;

  const client = new Client({
    connectionString: process.env.DATABASE_STRING,
    connectionTimeoutMillis: 5000,
  });

  try {
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

    await client.connect();

    const handleSendMessageToDB = async () => {
      const idQuery = await client.query(
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
  } catch (err) {
    if (client?.connected) client.end().catch(() => {});
    console.error("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    if (client?.connected) client.end().catch(() => {});
  }
};

module.exports = SendMessageToDB;
