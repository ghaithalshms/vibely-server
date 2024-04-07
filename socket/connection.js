const dissconnectSocket = require("./disconnect");
const setUserSocket = require("./set_user_socket");
const sendMessageSocket = require("./send_message");
const messageSeenSocket = require("./message_seen");

const connectionToSocket = (io, connectedUsers) => {
  io.on("connection", (socket) => {
    setUserSocket(socket, connectedUsers);
    sendMessageSocket(socket, connectedUsers);
    messageSeenSocket(socket, connectedUsers);
    dissconnectSocket(socket, connectedUsers);
  });
};

module.exports = connectionToSocket;
