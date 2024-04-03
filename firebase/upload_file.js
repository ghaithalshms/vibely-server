const { bucket } = require("./firebase_bucket");
const { v4: uuidv4 } = require("uuid");

const UploadFileToFireBase = async (file, fileType, folderName) => {
  try {
    if (!file) {
      return console.log("no file");
    }

    const fileName = `${folderName}/${Date.now()}-${uuidv4()}.${
      fileType.split("/")[1]
    }`;
    const blob = bucket.file(fileName);

    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: fileType,
      },
      gzip: true,
    });

    return new Promise((resolve, reject) => {
      blobStream.on("error", (err) => reject(err));
      blobStream.on("finish", () => resolve(fileName));

      const buffer = Buffer.from(file.buffer);
      blobStream.end(buffer);
    });
  } catch (error) {
    console.error(`Error uploading file`, error);
    return false;
  }
};

module.exports = { UploadFileToFireBase };
