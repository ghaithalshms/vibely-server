const { UploadFileFireBase } = require("../../firebase/file_process");
const checkToken = require("../../func/check_token");
const pool = require("../../pg_pool");

const UpdateProfileData = async (req, res) => {
  const {
    token,
    username,
    firstName,
    lastName,
    biography,
    link,
    privacity,
    fileType,
  } = req.body;
  const file = req.file;
  console.log(file);
  const client = await pool.connect().catch((err) => console.log(err));

  try {
    if (!(token && username)) {
      res.status(400).json("data missing");
      return;
    }

    const tokenUsername = await checkToken(token);
    if (tokenUsername === false) {
      if (!res.headersSent) res.status(401).json("wrong token");
      return;
    }

    const filePath = file
      ? await UploadFileFireBase(file, fileType, "pfp")
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
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = UpdateProfileData;
