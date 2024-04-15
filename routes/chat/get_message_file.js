require("dotenv").config();
const { GetFileFromFireBase } = require("../../firebase/get_file.js");
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");
const fetch = require("node-fetch");

const getFileInformation = async (client, messageID, tokenUsername) => {
  const fileQuery = await client.query(
    `SELECT file_path, file_type, one_time, one_time_opened, msg_from FROM message_tbl 
    WHERE msg_id = $1
    AND (msg_from = $2 OR msg_to = $2)`,
    [messageID, tokenUsername]
  );
  return fileQuery.rows[0];
};

const setOneTimeFileOpened = async (client, messageID, tokenUsername) => {
  await client.query(
    `UPDAte message_tbl set one_time_opened = true  
    WHERE msg_id = $1`,
    [messageID]
  );
};

const GetMessageFile = async (req, res) => {
  const { token, messageID } = req.query;

  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).json(err);
  });
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

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

    const fileInfo = await getFileInformation(client, messageID, tokenUsername);
    if (!fileInfo) {
      res.status(404).send("File not found");
      return;
    }

    const {
      file_path: filePath,
      file_type: fileType,
      one_time: oneTime,
      one_time_opened: oneTimeOpened,
      msg_from: from,
    } = fileInfo;

    if (!res.headersSent) {
      if (!oneTime || (oneTime && !oneTimeOpened && from !== tokenUsername)) {
        GetFileFromFireBase(filePath)
          .then(async (url) => {
            if (oneTime && !oneTimeOpened) {
              await setOneTimeFileOpened(client, messageID, tokenUsername);
            }
            res.redirect(url);
          })
          .catch((error) => {
            console.error(error);
            res.status(500).send("Error fetching audio");
          });
      } else {
        res.status(400).send("File was already opened");
      }
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = GetMessageFile;
