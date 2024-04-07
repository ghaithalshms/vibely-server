const SendWebPush = require("../web_push_notification/send_web_push");

const sendMessageSocket = (socket, connectedUsers) => {
  socket.on("send_message", (messageData) => {
    try {
      const userSocketID = connectedUsers.get(messageData.to)?.id;
      socket.to(userSocketID)?.emit("receive_message", messageData);
      let title = messageData.from,
        body = setNotiBody(messageData),
        to = messageData.to;

      if (!userSocketID) SendWebPush(title, body, to);
    } catch (err) {
      console.log(err);
    }
  });
};

const setNotiBody = (messageData) => {
  messageData.fileType.startsWith("text")
    ? messageData.message
    : `Sent you ${
        messageData.fileType.split("/")[0].charAt(0) === "v" ? "a" : "an"
      }` + messageData.fileType.split("/")[0];
};
module.exports = sendMessageSocket;
