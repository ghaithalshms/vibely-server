require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require("body-parser");
const cors = require("cors");
const axios = require("axios");
const multer = require("multer");
const spotifyApi = require("./spotify_listening/spotify_api");

const { postLink, getLink, deleteLink, updateLink } = require("./API_LINK");

const app = express();
app.use(cors());

app.use(bodyParser.json({ limit: "30mb" }));
app.use(bodyParser.urlencoded({ limit: "30mb", extended: true }));
app.use(express.json({ limit: "30mb" }));
app.use(express.urlencoded({ extended: true, limit: "30mb" }));

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
const GetUserPostFlow = require("./routes/post_flow/get_user_post_flow");
const LikePost = require("./routes/post/like_post");
const SavePost = require("./routes/post/save_post");
const GetPostComments = require("./routes/post/get_post_comments");
const LikeComment = require("./routes/comment/like_comment");
const CreateComment = require("./routes/comment/create_comment");
const DeleteComment = require("./routes/comment/delete_comment");
const GetPostLikedUsers = require("./routes/user/userList/get_post_liked_users");
const DeletePost = require("./routes/post/delete_post");
const ArchivePost = require("./routes/post/archive_post");
const UnarchivePost = require("./routes/post/unarchive_post");
const GetHomePostFlow = require("./routes/post_flow/get_home_post_flow");
const GetExplorerPostFlow = require("./routes/post_flow/get_explorer_post_flow");
const GetUserPicture = require("./routes/user/get_user_picture");
const CreatePost = require("./routes/post/create_post");
const GetSearchUser = require("./routes/search/get_search_user");
const GetLikedPostFlow = require("./routes/post_flow/get_liked_post_flow");
const GetSavedPostFlow = require("./routes/post_flow/get_saved_post_flow");
const GetArchivedPostFlow = require("./routes/post_flow/get_archived_post_flow");
const GetNotifications = require("./routes/notification/get_notifications");
const AcceptFollowRequest = require("./routes/user/accept_follow_request");
const UpdateProfileData = require("./routes/user/update_profile_data");
const GetInbox = require("./routes/inbox/get_inbox");
const GetChat = require("./routes/chat/get_chat");
const SendMessageToDB = require("./routes/chat/send_message_to_db");
const SetMessagesSeen = require("./routes/chat/set_messages_seen");
const SetNotificationSeen = require("./routes/notification/set_notification_seen");
const GetNotificationCount = require("./routes/notification/get_notifications_count");
const GetMessagesCount = require("./routes/inbox/get_messages_count");
const SubscribeWebPush = require("./web_push_notification/subscribe_web_push");
const GetPostFile = require("./routes/post/get_post_file");
const GetSuggestions = require("./routes/suggestions/get_suggestions");
const UnsubscribeWebPush = require("./web_push_notification/unsubscribe_web_push");
const GetMessageFile = require("./routes/chat/get_message_file");
const SpotifyLogin = require("./spotify_listening/spotify_login");
const SpotifyPlay = require("./spotify_listening/spotify_play");
const SpotifySearch = require("./spotify_listening/spotify_search");
const SpotifyCallback = require("./spotify_listening/spotify_callback");
const ForgotPassword = require("./routes/auth/forgot_password");
const ResetPassword = require("./routes/auth/reset_password");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const connectedUsers = new Map();

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
// WEB PUSH NOTIFICATION
app.post(postLink.subscribeWebPush, SubscribeWebPush);
// *********** GET ***********
// USER
app.get(getLink.getUserData, (req, res) =>
  GetUserData(req, res, connectedUsers)
);
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
app.get(getLink.getPostFile, GetPostFile);
// NOTIFICATION
app.get(getLink.getNotification, GetNotifications);
app.get(getLink.getNotificationCount, GetNotificationCount);
// INBOX
app.get(getLink.getInbox, (req, res) => GetInbox(req, res, connectedUsers));
app.get(getLink.getMessagesCount, GetMessagesCount);
// CHAT
app.get(getLink.getChat, GetChat);
app.get(getLink.getMessageFile, GetMessageFile);
// SUGGESTIONS
app.get(getLink.getSuggestions, GetSuggestions);
// SPOTIFY API
app.get(getLink.spotifyLogin, (req, res) => SpotifyLogin(req, res, spotifyApi));
app.get(getLink.spotifyCallback, (req, res) =>
  SpotifyCallback(req, res, spotifyApi)
);
app.get(getLink.spotifySearch, (req, res) =>
  SpotifySearch(req, res, spotifyApi)
);
app.get(getLink.spotifyPlay, (req, res) => SpotifyPlay(req, res, spotifyApi));

// *********** DELETE ***********
// POST
app.post(deleteLink.deletePost, DeletePost);
// COMMENT
app.post(deleteLink.deleteComment, DeleteComment);
app.post(deleteLink.unsubscribeWebPush, UnsubscribeWebPush);

// *********** UPDATE ***********
// POST
app.post(updateLink.forgotPassword, ForgotPassword);
app.post(updateLink.resetPassword, ResetPassword);
app.post(updateLink.archivePost, ArchivePost);
app.post(updateLink.unarchivePost, UnarchivePost);
app.post(
  updateLink.updateProfileData,
  upload.single("file"),
  UpdateProfileData
);
// CHAT
app.post(updateLink.setMessagesSeen, SetMessagesSeen);
// CHAT
app.post(updateLink.setNotificationSeen, SetNotificationSeen);

connectionToSocket(io, connectedUsers);

const listener = server.listen(8000 || process.env.PORT, () => {
  console.log(`Server is running on port ${listener.address().port}`);
});

////////////////////////////////
//KEEP SERVER ACTIVE
// Function to send HTTP request to the self server
const sendHttpRequest = async () => {
  try {
    const response = await axios.get(
      `${process.env.API_URL}/api/server/activate`
    );
    // console.log("HTTP Request Successful:", response.data);
  } catch (error) {
    console.log("HTTP Request Failed:", error);
  }
};

// Set up interval to send HTTP request every 10 minutes (600,000 milliseconds)
const interval = 10 * 60 * 1000;
setInterval(sendHttpRequest, interval);
////////////////////////////////
