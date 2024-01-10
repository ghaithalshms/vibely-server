const SendWebPush = require("../routes/web_push_notification/send_web_push");

const sendMessageSocket = (socket, connectedUsers) => {
  socket.on("send_message", (messageData) => {
    const userSocketID = connectedUsers.get(messageData.to)?.id;
    socket.to(userSocketID)?.emit("receive_message", messageData);
    SendWebPush(messageData);
  });
};
module.exports = sendMessageSocket;
