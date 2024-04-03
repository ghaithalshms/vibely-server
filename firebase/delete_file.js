const { bucket } = require("./firebase_bucket");

const DeleteFileFromFirebase = async (filename) => {
  try {
    const file = bucket.file(filename);
    await file.delete();
    return true;
  } catch (error) {
    console.error(`Error deleting file ${filename}:`, error);
    return false;
  }
};

module.exports = { DeleteFileFromFirebase };
