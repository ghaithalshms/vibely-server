const { v4: uuidv4 } = require("uuid");
require("dotenv").config();
const serviceAccount = require("./service_account.js");
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
});
const bucket = admin.storage().bucket();

const UploadFileFireBase = async (file, fileType, folderName) => {
  if (!file) {
    console.log("no file");
    return;
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
};

const GetFileFireBase = async (filename) => {
  const file = bucket.file(`${filename}`);
  const url = await file.getSignedUrl({
    action: "read",
    expires: Date.now() + 60 * 60 * 1000, // 1 hour
  });

  return url[0];
};

module.exports = { UploadFileFireBase, GetFileFireBase };
