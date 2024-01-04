const dissconnectSocket = require("./disconnect");
const setUserSocket = require("./setUserSocket");
const sendMessageSocket = require("./sendMessage");

const connectionToSocket = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    setUserSocket(socket, connectedUsers);
    sendMessageSocket(socket, connectedUsers);
    dissconnectSocket(socket, connectedUsers);
  });
};

module.exports = connectionToSocket;
