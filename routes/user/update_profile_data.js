const { UploadFileToFireBase } = require("../../firebase/upload_file.js");
const checkToken = require("../../func/check_token");
const { Pool } = require("pg");

const updateProfileData = async (client, req, res, tokenUsername) => {
  const {
    username,
    firstName,
    lastName,
    biography,
    link,
    privacity,
    fileType,
  } = req.body;
  const file = req.file;

  const filePath = file
    ? await UploadFileToFireBase(file, fileType, "pfp")
    : null;
  if (filePath === false) {
    if (!res.headersSent)
      res.status(500).json("unexpected error while uploading file");
    return;
  }

  await client.query(
    `UPDATE user_tbl 
      SET username=$1,
      first_name=$2,
      last_name=$3,
      biography=$4,
      link=$5,
      privacity=$6
      WHERE username=$7`,
    [username, firstName, lastName, biography, link, privacity, tokenUsername]
  );

  if (fileType.startsWith("image/"))
    await client.query(
      `UPDATE user_tbl SET pfp_path=$1
      WHERE username=$2`,
      [filePath, tokenUsername]
    );

  if (!res.headersSent) res.status(200).json("data updated");
};

const UpdateProfileData = async (req, res) => {
  const { token } = req.body;
  const pool = new Pool({ connectionString: process.env.DATABASE_STRING });
  const client = await pool.connect();
  client.on("error", (err) =>
    console.error("something bad has happened!", err.stack)
  );

  try {
    if (!(token && req.body.username)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    await updateProfileData(client, req, res, tokenUsername);
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    await client?.release();
  }
};

module.exports = UpdateProfileData;
