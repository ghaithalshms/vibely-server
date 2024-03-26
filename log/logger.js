const fs = require("fs");

const logger = (req, res, next) => {
  const method = req.method;
  const pathName = req.url;
  const browser = req.rawHeaders[7];
  const os = req.rawHeaders[11];
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  const formattedDate = `${day}/${month}/${year}`;

  const logData = {
    method: method,
    pathName: pathName,
    browser: browser,
    os: os,
    date: formattedDate,
  };

  fs.readFile("log/log.json", "utf8", (err, data) => {
    if (err) {
      console.error("Dosya okunurken bir hata oluştu:", err);
      return;
    }

    let logArray = [];
    try {
      logArray = JSON.parse(data);
    } catch (error) {
      console.error("JSON parse hatası:", error);
      return;
    }

    logArray.push(logData);

    const jsonData = JSON.stringify(logArray, null, 2);

    fs.writeFile("log/log.json", jsonData, (err) => {
      if (err) {
        console.error("Dosya yazılırken bir hata oluştu:", err);
        return;
      }
      console.log("Yeni log verisi başarıyla eklendi.");
    });
  });

  next();
};

module.exports = logger;
