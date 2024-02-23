require("dotenv").config();
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const GetMessageFile = async (req, res) => {
  const { token, messageID } = req.query;

  const client = await pool.connect().catch((err) => console.log(err));
  try {
    if (!(token && messageID)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const fileQuery = await client?.query(
      `SELECT file, file_type FROM message_tbl 
      WHERE msg_id = $1
      AND (msg_from = $2 OR msg_to = $2)
`,
      [messageID, tokenUsername]
    );

    const file = fileQuery.rows[0].file;
    const fileType = fileQuery.rows[0].file_type;

    if (!res.headersSent) {
      if (fileType === "picture") res.setHeader("Content-Type", "image/png");
      else if (fileType === "video") res.setHeader("Content-Type", "video/mp4");
      else if (fileType === "audio") res.setHeader("Content-Type", "audio/mp3");

      res.send(file);
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetMessageFile;
