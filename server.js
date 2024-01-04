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
const SignIn = require("./routes/auth/sign_in");
const SignUp = require("./routes/auth/sign_up");
const CheckUsername = require("./routes/user/check_username");
const GetUserData = require("./routes/user/get_user_data");
const Follow = require("./routes/user/follow");
const GetFollowers = require("./routes/user/userList/get_followers");
const GetFollowing = require("./routes/user/userList/get_following");
const GetUserPostFlow = require("./routes/postFlow/get_user_post_flow");
const LikePost = require("./routes/post/like_post");
const SavePost = require("./routes/post/save_post");
const GetPostComments = require("./routes/post/get_post_comments");
const LikeComment = require("./routes/comment/like_comment");
const CreateComment = require("./routes/comment/create_comment");
const DeleteComment = require("./routes/comment/delete_comment");
const GetPostLikedUsers = require("./routes/post/userList/get_post_liked_users");
const DeletePost = require("./routes/post/delete_post");
const ArchivePost = require("./routes/post/archive_post");
const GetHomePostFlow = require("./routes/postFlow/get_home_post_flow");
const GetExplorerPostFlow = require("./routes/postFlow/get_explorer_post_flow");
const GetUserPicture = require("./routes/user/get_user_picture");
const CreatePost = require("./routes/post/create_post");
const multer = require("multer");
const GetSearchUser = require("./routes/search/get_search_user");
const GetLikedPostFlow = require("./routes/postFlow/get_liked_post_flow");
const GetSavedPostFlow = require("./routes/postFlow/get_saved_post_flow");
const GetArchivedPostFlow = require("./routes/postFlow/get_archived_post_flow");
const GetNotifications = require("./routes/notification/get_notifications");
const AcceptFollowRequest = require("./routes/user/accept_follow_request");
const UpdateProfileData = require("./routes/user/update_profile_data");
const UpdateProfilePicture = require("./routes/user/update_profile_picture");
const GetInbox = require("./routes/inbox/get_inbox");
const GetChat = require("./routes/chat/get_chat");
const SendMessageToDB = require("./routes/chat/send_message_to_db");
const SetMessagesSeen = require("./routes/chat/set_messages_seen");
const SetNotificationSeen = require("./routes/notification/set_notification_seen");
const GetNotificationCount = require("./routes/notification/get_notifications_count");
const GetMessagesCount = require("./routes/inbox/get_messages_count");

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
