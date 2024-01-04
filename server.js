const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const {
  postLink,
  getLink,
  deleteLink,
  putLink,
  updateLink,
} = require("./API_LINK");

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "2mb" }));
app.use(bodyParser.urlencoded({ limit: "2mb", extended: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb" }));

const server = http.createServer(app);

const io = new Server(server, {
  maxHttpBufferSize: 2e6,
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "DELETE"],
  },
});

const connectionToSocket = require("./socket/connection");
// IMPORT ROUTES
const SignIn = require("./routes/auth/signIn");
const SignUp = require("./routes/auth/signUp");
const CheckUsername = require("./routes/user/checkUsername");
const GetUserData = require("./routes/user/getUserData");
const Follow = require("./routes/user/follow");
const GetFollowers = require("./routes/user/userList/getFollowers");
const GetFollowing = require("./routes/user/userList/getFollowing");
const GetUserPostFlow = require("./routes/postFlow/getUserPostFlow");
const LikePost = require("./routes/post/likePost");
const SavePost = require("./routes/post/savePost");
const GetPostComments = require("./routes/post/getPostComments");
const LikeComment = require("./routes/comment/likeComment");
const CreateComment = require("./routes/comment/createComment");
const DeleteComment = require("./routes/comment/deleteComment");
const GetPostLikedUsers = require("./routes/post/userList/getPostLikedUsers");
const DeletePost = require("./routes/post/deletePost");
const ArchivePost = require("./routes/post/archivePost");
const GetHomePostFlow = require("./routes/postFlow/getHomePostFlow");
const GetExplorerPostFlow = require("./routes/postFlow/getExplorerPostFlow");
const GetUserPicture = require("./routes/user/getUserPicture");
const CreatePost = require("./routes/post/createPost");
const multer = require("multer");
const GetSearchUser = require("./routes/search/getSearchUser");
const GetLikedPostFlow = require("./routes/postFlow/getLikedPostFlow");
const GetSavedPostFlow = require("./routes/postFlow/getSavedPostFlow");
const GetArchivedPostFlow = require("./routes/postFlow/getArchivedPostFlow");
const GetNotifications = require("./routes/notification/getNotification");
const AcceptFollowRequest = require("./routes/user/acceptFollowRequest");
const UpdateProfileData = require("./routes/user/updateProfileData");
const UpdateProfilePicture = require("./routes/user/updateProfilePicture");
const GetInbox = require("./routes/inbox/getInbox");
const GetChat = require("./routes/chat/getChat");
const SendMessageToDB = require("./routes/chat/sendMessageToDB");
const SetMessagesSeen = require("./routes/chat/setMessagesSeen");
const SetNotificationSeen = require("./routes/notification/setNotificationSeen");
const GetNotificationCount = require("./routes/notification/getNotificationCount");
const GetMessagesCount = require("./routes/inbox/getMessagesCount");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// *********** POST ***********
// activate server
app.get(getLink.activateServer, (req, res) => {
  res.status(200).json("hey");
});
// AUTH
app.post(postLink.signIn, SignIn);
app.post(postLink.signUp, SignUp);
// USER
app.post(postLink.checkUsername, CheckUsername);
app.post(postLink.follow, Follow);
app.post(postLink.acceptFollowRequest, AcceptFollowRequest);
// POST
app.post(postLink.createPost, upload.single("file"), CreatePost);
app.post(postLink.likePost, LikePost);
app.post(postLink.savePost, SavePost);
// COMMENT
app.post(postLink.likeComment, LikeComment);
app.post(postLink.createComment, CreateComment);
// CHAT
app.post(postLink.sendMessageToDB, upload.single("file"), SendMessageToDB);

// *********** GET ***********
// USER
app.get(getLink.getUserData, GetUserData);
app.get(getLink.getUserFollowers, GetFollowers);
app.get(getLink.getUserFollowing, GetFollowing);
app.get(getLink.getUserPicture, GetUserPicture);
app.get(getLink.getSearchUser, GetSearchUser);
// POST FLOW
app.get(getLink.getUserPostFlow, GetUserPostFlow);
app.get(getLink.getHomePostFlow, GetHomePostFlow);
app.get(getLink.getExplorerPostFlow, GetExplorerPostFlow);
app.get(getLink.getLikedPostFlow, GetLikedPostFlow);
app.get(getLink.getSavedPostFlow, GetSavedPostFlow);
app.get(getLink.getArchivedPostFlow, GetArchivedPostFlow);
// POST
app.get(getLink.getPostComments, GetPostComments);
app.get(getLink.getPostLikedUsers, GetPostLikedUsers);
// NOTIFICATION
app.get(getLink.getNotification, GetNotifications);
app.get(getLink.getNotificationCount, GetNotificationCount);
// INBOX
app.get(getLink.getInbox, GetInbox);
app.get(getLink.getMessagesCount, GetMessagesCount);
// CHAT
app.get(getLink.getChat, GetChat);

// *********** DELETE ***********
// POST
app.post(deleteLink.deletePost, DeletePost);
// COMMENT
app.post(deleteLink.deleteComment, DeleteComment);

// *********** UPDATE ***********
// POST
app.post(updateLink.archivePost, ArchivePost);
app.post(updateLink.updateProfileData, UpdateProfileData);
app.post(
  updateLink.updateProfilePicture,
  upload.single("file"),
  UpdateProfilePicture
);
// CHAT
app.post(updateLink.setMessagesSeen, SetMessagesSeen);
// CHAT
app.post(updateLink.setNotificationSeen, SetNotificationSeen);

const connectedUsers = new Map();

connectionToSocket(io, connectedUsers);

const listener = server.listen(8055 || process.env.PORT, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});

////////////////////////////////
//KEEP SERVER ACTIVE
const axios = require("axios");

// Function to send HTTP request to the self server
const sendHttpRequest = async () => {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/api/server/activate`
    );
    console.log("HTTP Request Successful:", response.data);
  } catch (error) {
    console.error("HTTP Request Failed:", error);
  }
};

// Set up interval to send HTTP request every 10 minutes (600,000 milliseconds)
const interval = 10 * 60 * 1000;
setInterval(sendHttpRequest, interval);

////////////////////////////////
