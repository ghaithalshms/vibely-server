const { bucket } = require("./firebase_bucket");

const GetFileFromFireBase = async (filename) => {
  try {
    const file = bucket.file(`${filename}`);
    const url = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 10 * 60 * 1000, // 10 min
    });

    return url[0];
  } catch (error) {
    console.error(`Error getting file ${filename}:`, error);
    return false;
  }
};

module.exports = { GetFileFromFireBase };
