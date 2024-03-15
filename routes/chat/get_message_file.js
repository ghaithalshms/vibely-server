require("dotenv").config();
const { GetFileFireBase } = require("../../firebase/file_process");
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
      `SELECT file_path FROM message_tbl 
      WHERE msg_id = $1
      AND (msg_from = $2 OR msg_to = $2)
`,
      [messageID, tokenUsername]
    );

    const filePath = fileQuery.rows[0].file_path;

    if (!res.headersSent) {
      GetFileFireBase(filePath)
        .then((url) => {
          res.redirect(url);
        })
        .catch((err) => console.log(err));
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = GetMessageFile;
