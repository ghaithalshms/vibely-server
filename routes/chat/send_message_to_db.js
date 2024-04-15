const { UploadFileToFireBase } = require("../../firebase/upload_file.js");
const CheckTokenNoDB = require("../../func/check_token_no_db");
const { Pool } = require("pg");
require("dotenv").config();

const sendMessageToDB = async (
  client,
  tokenUsername,
  username,
  message,
  fileType,
  filePath,
  oneTime
) => {
  const idQuery = await client.query(
    `INSERT INTO message_tbl (msg_from, msg_to, message, file_path, file_type, sent_date, one_time) 
    VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING msg_id as id`,
    [
      tokenUsername,
      username,
      message,
      filePath,
      fileType,
      new Date().toISOString(),
      oneTime || false,
    ]
  );
  return idQuery.rows[0].id;
};

const SendMessageToDB = async (req, res) => {
  const file = req.file;
  const { token, username, message, fileType, oneTime } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && username && (message || file))) {
      if (!res.headersSent) {
        res.status(400).json("missing data");
        return;
      }
    }

    const tokenUsername = await CheckTokenNoDB(token);
    if (tokenUsername === false) {
      if (!res.headersSent) {
        res.status(401).json("wrong token");
        return;
      }
    }

    const filePath = file
      ? await UploadFileToFireBase(file, fileType, "chat")
      : null;
    if (filePath === false) {
      if (!res.headersSent) {
        res.status(500).json("unexpected error while uploading file");
        return;
      }
    }

    const id = await sendMessageToDB(
      client,
      tokenUsername,
      username,
      message,
      fileType,
      filePath,
      oneTime
    );
    if (!res.headersSent) {
      res.status(200).json({ id, sentDate: new Date().toISOString() });
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = SendMessageToDB;
