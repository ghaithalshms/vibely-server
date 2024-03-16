const { UploadFileFireBase } = require("../../firebase/file_process");
const CheckTokenNoDB = require("../../func/check_token_no_db");
const pool = require("../../pg_pool");

require("dotenv").config();

const SendMessageToDB = async (req, res) => {
  const file = req.file;
  const { token, username, message, fileType } = req.body;
  const client = await pool.connect().catch((err) => console.log(err));

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

    const filePath = file
      ? await UploadFileFireBase(file, fileType, "chat")
      : null;
    if (filePath === false) {
      if (!res.headersSent)
        res.status(500).json("unexpected error while uploading file");
      return;
    }

    const handleSendMessageToDB = async () => {
      const idQuery = await client.query(
        `INSERT INTO message_tbl (msg_from, msg_to, message,file_path, file_type,sent_date) 
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING msg_id as id`,
        [
          tokenUsername,
          username,
          message,
          filePath,
          fileType,
          new Date().toISOString(),
        ]
      );
      if (!res.headersSent) res.status(200).json(idQuery.rows[0]);
    };
    handleSendMessageToDB();
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = SendMessageToDB;
