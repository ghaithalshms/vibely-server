const SendWebPush = require("../web_push_notification/send_web_push");

const sendMessageSocket = (socket, connectedUsers) => {
  socket.on("send_message", (messageData) => {
    try {
      const userSocketID = connectedUsers.get(messageData.to)?.id;
      socket.to(userSocketID)?.emit("receive_message", messageData);
      let title = messageData.from,
        body = messageData.fileType.startsWith("text")
          ? messageData.message
          : `Sent you ${
              messageData.fileType.split("/").charAt(0) === "v" ? "a" : "an"
            }` + messageData.fileType.split("/")[0];
      to = messageData.to;

      if (!userSocketID) SendWebPush(title, body, to);
    } catch (err) {
      console.log(err);
    }
  });
};
module.exports = sendMessageSocket;
