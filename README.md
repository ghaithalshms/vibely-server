# Vibely Social Media Server

Welcome to the Vibely social media server application! This Node.js application serves as the backend for the Vibely social media platform, providing essential functionalities:

<a target="_blank" href="https://vibely-backend-fkpv.onrender.com">Deployed API URL</a>

- **Example User For Testing:**
  - `username`: test_user
  - `password`: test
  - `token`: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InRlc3RfdXNlciIsInRva2VuVmVyc2lvbiI6MSwiaWF0IjoxNzEyMDcyNTkzLCJleHAiOjE3OTg0NzI1OTN9.EeqDIqc8U4ctCoubdUyl9KQOM0A6y8GV-2cAcZNunzE

# Table of Contents

1. [Database Diagram](#database-diagram)
2. [Error Codes](#error-codes)
3. [Authentication Routes](#authentication-routes)
   - [Sign In Route](#sign-in-route)
   - [Sign Up Route](#sign-up-route)
   - [Forgot Password Route](#forgot-password-route)
   - [Reset Password Route](#reset-password-route)
4. [User Routes](#user-routes)
   - [Follow User Route](#follow-user-route)
   - [Accept Follow Request Route](#accept-follow-request-route)
   - [Check Username Route](#check-username-route)
   - [Get User Data Route](#get-user-data-route)
   - [Get User Profile Picture Route](#get-user-profile-picture-route)
   - [Update User Profile Data Route](#update-user-profile-data-route)
   - [User List Routes](#user-list-routes)
     - [Get User Followers Route](#get-user-followers-route)
     - [Get User Following Route](#get-user-following-route)
5. [Inbox Routes](#inbox-routes)
   - [Get Inbox Users Route](#get-inbox-users-route)
   - [Get Inbox Messages Count Route](#get-inbox-users-route)
6. [Chat Routes](#chat-routes)
   - [Send Message To Database Route](#send-message-to-database-route)
   - [Get Chat Route](#get-chat-route)
   - [Get Message File Route](#get-message-file-route)
   - [Set Messages Seen Route](#set-messages-seen-route)
   - [Delete Message Route](#delete-message-route)
7. [Socket IO Functions](#socket-io-functions)
   - [Set User Socket Function](#set-user-socket-function)
   - [Connection Function](#connection-function)
   - [Send Message Function](#send-message-function)
   - [Disconnection Function](#disconnection-function)
8. [Web Push API Functions](#web-push-api-functions)
   - [Subscribe Web Push Function](#subscribe-web-push-function)
   - [Unsubscribe Web Push Function](#unsubscribe-web-push-function)
   - [Send Web Push Function](#send-web-push-function)
9. [Suggested Users Route](#suggested-users-route)
10. [Search Users Route](#search-users-route)
11. [Post Routes](#post-routes)
    - [Create Post Route](#create-post-route)
    - [Like Post Route](#like-post-route)
    - [Save Post Route](#save-post-route)
    - [Delete Post Route](#delete-post-route)
    - [Archive Post Route](#archive-post-route)
    - [Get Post File](#get-post-file)
    - [Get Post Liked Users Route](#get-post-liked-users-route)
    - [Get Post Comments File](#get-post-comments-file)
12. [Post Flow Routes](#post-flow-routes)
    - [Home Post Flow Route](#home-post-flow-route)
    - [User Post Flow Route](#user-post-flow-route)
    - [Explorer Post Flow Route](#explorer-post-flow-route)
    - [Archived/Liked/Saved Post Flows Routes](#archived/liked/saved-post-flow-route)
13. [Comment Routes](#comment-routes)
    - [Create Comment Route](#create-comment-route)
    - [Delete Comment Route](#delete-comment-route)
    - [Like Comment Route](#like-comment-route)
14. [Other Functions](#other-functions)
    - [Check Token Function](#check-token-function)
    - [Is Valid Username Function](#is-valid-username-function)
    - [Send Mail Function](#send-mail-function)

## Database Diagram

![plot](./vibely_db_diagram.png)

## Error Codes

| Status Code                            | Description                                                                                                                                   |
| -------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| <span style="color:#008000">200</span> | OK - The request has succeeded. The information returned with the response is dependent on the method used in the request.                    |
| <span style="color:#008000">201</span> | Created - The request has been fulfilled, resulting in the creation of a new resource.                                                        |
| <span style="color:#FF0000">400</span> | Bad Request - The server cannot or will not process the request due to something that is perceived to be a client error.                      |
| <span style="color:#FF0000">401</span> | Unauthorized - The request has not been applied because it lacks valid authentication credentials for the target resource.                    |
| <span style="color:#FFA500">409</span> | Conflict - Indicates that the request could not be completed due to a conflict with the current state of the resource.                        |
| <span style="color:#FF0000">500</span> | Internal Server Error - A generic error message, given when an unexpected condition was encountered and no more specific message is suitable. |

## Authentication Routes

These routes handle user authentication and related functionalities.

### Sign In Route

- **Description:** Authenticates a user based on provided username/email and password.
- **Method:** POST
- **Endpoint:** `/api/auth/sign-in`
- **Request Body:**
  - `usernameOrEmail`: Username or email of the user (String)
  - `password`: Password of the user (String)

**Example:**

```javascript
const axios = require("axios");

axios
  .post("/api/auth/sign-in", {
    usernameOrEmail: "exampleUser",
    password: "examplePassword",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Sign Up Route

- **Description:** Registers a new user.
- **Method:** POST
- **Endpoint:** `/api/auth/sign-up`
- **Request Body:**
  - `username`: Username of the new user (String)
  - `firstName`: First name of the new user (String)
  - `password`: Password of the new user (String)
  - `email`: Email address of the new user (String)

**Example:**

```javascript
axios
  .post("/api/auth/sign-up", {
    username: "newUser",
    firstName: "John",
    password: "newPassword",
    email: "john@example.com",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Forgot Password Route

- **Description:** Sends a password reset email to the user.
- **Method:** POST
- **Endpoint:** `/api/auth/forgot-password`
- **Request Body:**
  - `usernameOrEmail`: Username or email of the user (String)

**Example:**

```javascript
axios
  .post("/api/auth/forgot-password", {
    usernameOrEmail: "userToReset",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Reset Password Route

- **Description:** Resets the user's password.
- **Method:** POST
- **Endpoint:** `/api/auth/reset-password`
- **Request Body:**
  - `password`: New password for the user (String)
  - `token`: Reset password token (String)

**Example:**

```javascript
axios
  .post("/api/auth/reset-password", {
    password: "newPassword",
    token: "resetToken",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

## User Routes

These routes handle user-related operations.

### Follow User Route

- **Description:** Handles following/unfollowing a user.
- **Method:** POST
- **Endpoint:** `/api/user/follow`
- **Request Body:**
  - `token`: Authentication token (String)
  - `username`: Username of the user to follow (String)

**Example:**

```javascript
axios
  .post("/api/user/follow", {
    token: "authenticationToken",
    username: "userToFollow",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Accept Follow Request Route

- **Description:** Accepts a follow request from a user.
- **Method:** POST
- **Endpoint:** `/api/user/follow/request/accept`
- **Request Body:**
  - `token`: Authentication token (String)
  - `username`: Username of the user whose follow request is accepted (String)

**Example:**

```javascript
axios
  .post("/api/user/follow/request/accept", {
    token: "authenticationToken",
    username: "userToAccept",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Check Username Route

- **Description:** Checks the availability of a username.
- **Method:** POST
- **Endpoint:** `/api/user/check-username`
- **Request Body:**
  - `username`: Username to check (String)

**Example:**

```javascript
axios
  .post("/api/user/check-username", {
    username: "usernameToCheck",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Get User Data Route

- **Description:** Retrieves data of a user.
- **Method:** GET
- **Endpoint:** `/api/user/data`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the user to retrieve data for (String)

**Example:**

```javascript
axios
  .get("/api/user/data", {
    params: {
      token: "authenticationToken",
      username: "userToRetrieveDataFor",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Get User Profile Picture Route

- **Description:** Retrieves the profile picture of a user.
- **Method:** GET
- **Endpoint:** `/api/user/update/picture`
- **Query Parameters:**
  - `username`: Username of the user to retrieve the profile picture for (String)

**Example:**

```javascript
axios
  .get("/api/user/data/picture", {
    params: {
      username: "userToRetrieveProfilePictureFor",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Update User Profile Data Route

- **Description:** Updates profile data of a user.
- **Method:** POST
- **Endpoint:** `/api/user/update/data`
- **Request Body:**
  - `token`: Authentication token (String)
  - `username`: Username of the user to update profile data for (String)
  - Other profile data fields (String)

**Example:**

```javascript
axios
  .post("/api/user/update/data", {
    token: "authenticationToken",
    username: "userToUpdateProfileDataFor",
    // Other profile data fields
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### User List Routes

These routes handle retrieving lists of users.

#### Get User Followers Route

- **Description:** Retrieves the list of followers for a user.
- **Method:** GET
- **Endpoint:** `/api/user/followers`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the user to retrieve followers for (String)

**Example:**

```javascript
axios
  .get("/api/user/followers", {
    params: {
      token: "authenticationToken",
      username: "userToRetrieveFollowersFor",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get User Following Route

- **Description:** Retrieves the list of users a user is following.
- **Method:** GET
- **Endpoint:** `/api/user/following`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the user to retrieve following for (String)

**Example:**

```javascript
axios
  .get("/api/user/following", {
    params: {
      token: "authenticationToken",
      username: "userToRetrieveFollowingFor",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Inbox Routes

These routes handle operations related to user inboxes, such as retrieving inbox users and message counts.

#### Get Inbox Users Route

- **Description:** Retrieves a list of users with their last message for the authenticated user's inbox.
- **Method:** GET
- **Endpoint:** `/api/inbox`
- **Query Parameters:**
  - `token`: Authentication token (String)

**Example:**

```javascript
axios
  .get("/api/inbox", {
    params: {
      token: "authenticationToken",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Functionality

1. Retrieves users with their last message for the authenticated user's inbox.
2. Ensures the provided token is valid.
3. Retrieves inbox users and their last messages from the database.
4. Formats the retrieved data into a standardized format.
5. Sends the formatted list of inbox users as a response.

#### Get Inbox Messages Count Route

- **Description:** Retrieves the count of unseen messages in the authenticated user's inbox.
- **Method:** GET
- **Endpoint:** `/api/inbox/count`
- **Query Parameters:**
  - `token`: Authentication token (String)

**Example:**

```javascript
axios
  .get("/api/inbox/count", {
    params: {
      token: "authenticationToken",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Functionality

1. Retrieves the count of unseen messages in the authenticated user's inbox.
2. Validates the provided token.
3. Retrieves inbox users and their last messages from the database.
4. Retrieves the count of unseen messages from the database.
5. Sends the count of unseen messages as a response.

### Chat Routes

These routes handle various operations related to chatting, including sending messages, retrieving chat history, fetching message files, marking messages as seen, and deleting messages.

#### Send Message To Database Route

- **Description:** Sends a message to the database.
- **Method:** POST
- **Endpoint:** `/api/chat/send-message`
- **Body Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the recipient (String)
  - `message`: Content of the message (String)
  - `file`: File to be sent (image, video or audio (can be null))
  - `fileType`: Type of the file (String)
  - `oneTime`: One time viewed media only for images and videos (Boolean)

**Example:**

```javascript
const formData = new FormData();
formData.append("token", "authenticationToken");
formData.append("username", "recipientUsername");
formData.append("message", "Your message here");
formData.append("file", file);
formData.append("fileType", "image/jpeg | video/mp4 | audio/mp3");

axios
  .post("/api/chat/send-message", formData)
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get Chat Route

- **Description:** Retrieves chat history with a specific user.
- **Method:** GET
- **Endpoint:** `/api/chat`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the chat partner (String)
  - `oldestMessageGot`: ID of the oldest message received (Integer)

**Example:**

```javascript
axios
  .get("/api/chat", {
    params: {
      token: "authenticationToken",
      username: "chatPartnerUsername",
      oldestMessageGot: "123",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get Message File Route

- **Description:** Retrieves the file attached to a specific message.
- **Method:** GET
- **Endpoint:** `/api/chat/message-file`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `messageID`: ID of the message (String)

**Example:**

```javascript
axios
  .get("/api/chat/message-file", {
    params: {
      token: "authenticationToken",
      messageID: "messageID",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Set Messages Seen Route

- **Description:** Marks messages as seen between the authenticated user and a specific user.
- **Method:** POST
- **Endpoint:** `/api/chat/seen`
- **Body Parameters:**
  - `token`: Authentication token (String)
  - `username`: Username of the chat partner (String)

**Example:**

```javascript
axios
  .post("/api/chat/seen", {
    token: "authenticationToken",
    username: "chatPartnerUsername",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Delete Message Route

- **Description:** Deletes a specific message from the database.
- **Method:** DELETE
- **Endpoint:** `/api/chat/message/delete`
- **Body Parameters:**
  - `token`: Authentication token (String)
  - `messageID`: ID of the message to delete (String)

**Example:**

```javascript
axios
  .post("/api/chat/message/delete", {
    data: {
      token: "authenticationToken",
      messageID: "messageIDToDelete",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Socket IO Functions

These functions are responsible for handling socket-related operations, including setting up user sockets, managing connections, disconnections, and sending messages.

#### Set User Socket Function

- **Description:** Sets up a user's socket connection.
- **Parameters:**
  - `socket`: Socket object representing the user's connection
  - `connectedUsers`: Map of connected users where usernames are keys and sockets are values

#### Connection Function

- **Description:** Manages socket connections.
- **Parameters:**

  - `io`: Socket.io server instance
  - `connectedUsers`: Map of connected users where usernames are keys and sockets are values

  #### Disconnection Function

- **Description:** Manages socket disconnections.
- **Parameters:**
  - `socket`: Socket object representing the user's connection
  - `connectedUsers`: Map of connected users where usernames are keys and sockets are values

#### Send Message Function

- **Description:** Handles sending messages via sockets.
- **Parameters:**
  - `socket`: Socket object representing the user's connection
  - `connectedUsers`: Map of connected users where usernames are keys and sockets are values

### Web Push API Functions

These functions handle interactions with the Web Push API, including subscribing, unsubscribing, and sending push notifications.

#### Subscribe Web Push Function

- **Description:** Allows users to subscribe to push notifications.
- **Parameters:**
  - `req`: Request object containing the user's subscription data, including:
    - `token`: Authentication token for verifying the user
    - `pushSubscription`: Push subscription object containing endpoint, keys, etc.
    - `browserID`: Identifier for the user's browser
  - `res`: Response object for sending back the result
- **Returns:** Upon successful subscription, it returns a success message indicating that the subscription was added or updated.

#### Unsubscribe Web Push Function

- **Description:** Allows users to unsubscribe from push notifications.
- **Parameters:**
  - `req`: Request object containing the user's subscription data, including:
    - `token`: Authentication token for verifying the user
    - `browserID`: Identifier for the user's browser
  - `res`: Response object for sending back the result
- **Data Required:** Requires the user's authentication token and browser ID to identify the subscription to be removed.
- **Returns:** Upon successful unsubscription, it returns a success message indicating that the subscription was deleted.

#### Send Web Push Function

- **Description:** Sends push notifications to subscribed users.
- **Parameters:**
  - `title`: Title of the push notification
  - `body`: Body of the push notification
  - `to`: Username of the recipient
- **Data Required:** Requires the title and body of the push notification, along with the username of the recipient.

### Suggested Users Route

This route retrieves a list of suggested users for the authenticated user.

- **Description:** Retrieves a list of suggested users for the authenticated user.
- **Method:** GET
- **Endpoint:** `/api/suggested-users`
- **Query Parameters:**
  - `token`: Authentication token (String)

**Example:**

```javascript
axios
  .get("/api/suggestions", {
    params: {
      token: "authenticationToken",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Functionality

1.  Checks the validity of the provided token.
2.  Retrieves suggested users based on the user's network activity.
3.  Excludes users already followed by the authenticated user and users who have sent follow requests to the authenticated user.
4.  Limits the number of suggested users to a maximum of 6.
5.  Transforms the suggested users' data into a standardized format.
6.  Sends the list of suggested users as a response.

### Search Users Route

- **Description:** Searches for users based on provided criteria such as username, first name, or last name.
- **Method:** GET
- **Endpoint:** `/api/user/search`
- **Query Parameters:**
  - `username`: The username to search for (String)

**Example:**

```javascript
axios
  .get("/api/user/search", {
    params: {
      username: usernameToSearch,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Post Routes

These routes handle various operations related to posts within the application.

#### Create Post Route

- **Description:** Creates a new post.
- **Method:** POST
- **Endpoint:** `/api/post/create`
- **Request Body:**
  - `file`: File to be uploaded (File)
  - `fileType`: Type of the file (String)
  - `token`: Authentication token (String)
  - `description`: Description of the post (String)

**Example:**

```javascript
axios
  .post("/api/post/create", formData, {
    params: {
      token: "authenticationToken",
      description: "Post description",
      fileType: "image",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Like Post Route

- **Description:** Handles liking/unliking a post.
- **Method:** POST
- **Endpoint:** `/api/post/like`
- **Request Body:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post to be liked/unliked (Integer)

**Example:**

```javascript
axios
  .post("/api/post/like", {
    token: "authenticationToken",
    postID: 12345,
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Save Post Route

- **Description:** Handles saving/unsaving a post.
- **Method:** POST
- **Endpoint:** `/api/post/save`
- **Request Body:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post to be saved/unsaved (Integer)

**Example:**

```javascript
axios
  .post("/api/post/save", {
    token: "authenticationToken",
    postID: 12345,
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Delete Post Route

- **Description:** Deletes a post.
- **Method:** POST
- **Endpoint:** `/api/post/delete`
- **Request Body:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post to be deleted (Integer)

```javascript
axios
  .post("/api/post/delete", {
    data: {
      token: "authenticationToken",
      postID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Archive Post Route

- **Description:** Archives a post.
- **Method:** POST
- **Endpoint:** `/api/post/archive`
- **Request Body:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post to be archived (Integer)

**Example:**

```javascript
axios
  .post("/api/post/archive", {
    token: "authenticationToken",
    postID: 12345,
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get Post File

- **Description:** Retrieves the file associated with a post.
- **Method:** GET
- **Endpoint:** `/api/post/file`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post (Integer)

**Example:**

```javascript
axios
  .get("/api/post/file", {
    params: {
      token: "authenticationToken",
      postID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get Post Liked Users Route

- **Description:** Retrieves the list of users who liked a post.
- **Method:** GET
- **Endpoint:** `/api/post/liked-users`
- **Query Parameters:**
  - `postID`: ID of the post to retrieve liked users for (Integer)
  - `token`: Authentication token (String)

**Example:**

```javascript
axios
  .get("/api/post/liked-users", {
    params: {
      postID: 12345,
      token: "authenticationToken",
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Get Post Comments File

- **Description:** Retrieves the comments associated with a post.
- **Method:** GET
- **Endpoint:** `/api/post/comments`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post (Integer)

**Example:**

```javascript
axios
  .get("/api/post/comments", {
    params: {
      token: "authenticationToken",
      postID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Post Flow Routes

These routes handle the flow of posts within the application.

#### Home Post Flow Route

- **Description:** Retrieves the post flow for the home page.
- **Method:** GET
- **Endpoint:** `/api/post-flow/home`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `lastGotPostID`: ID of the last post received (Integer)

**Example:**

```javascript
axios
  .get("/api/post-flow/home", {
    params: {
      token: "authenticationToken",
      lastGotPostID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### User Post Flow Route

- **Description:** Retrieves the post flow for a specific user.
- **Method:** GET
- **Endpoint:** `/api/post-flow/user`
- **Query Parameters:**
  - `username`: Username of the user whose posts are being retrieved (String)
  - `token`: Authentication token (String)
  - `lastGotPostID`: ID of the last post received (Integer)

**Example:**

```javascript
axios
  .get("/api/post-flow/user", {
    params: {
      username: "usernameToRetrievePostsFor",
      token: "authenticationToken",
      lastGotPostID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Explorer Post Flow Route

- **Description:** Retrieves the post flow for the explorer page.
- **Method:** GET
- **Endpoint:** `/api/post-flow/explorer`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `lastGotPostID`: ID of the last post received (Integer)

**Example:**

```javascript
axios
  .get("/api/post-flow/explorer", {
    params: {
      token: "authenticationToken",
      lastGotPostID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Archived/Liked/Saved Post Flows Routes

These routes handle retrieving post flows for archived, liked, and saved posts.

- **Description:** Retrieves the post flow for archived/liked/saved posts.
- **Method:** GET
- **Endpoint:** `/api/post-flow/archived|liked|saved`
- **Query Parameters:**
  - `token`: Authentication token (String)
  - `lastGotPostID`: ID of the last post received (Integer)

**Example:**

```javascript
axios
  .get("/api/post-flow/archived|liked|saved", {
    params: {
      token: "authenticationToken",
      lastGotPostID: 12345,
    },
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Comment Routes

#### Create Comment Route

- **Description:** Creates a new comment on a post.
- **Method:** POST
- **Endpoint:** `/api/comment/create`
- **Request Body:**
  - `token`: Authentication token (String)
  - `postID`: ID of the post to comment on (String)
  - `comment`: Content of the comment (String)

**Example:**

```javascript
axios
  .post("/api/comment/create", {
    token: "authenticationToken",
    postID: "postIDToCommentOn",
    comment: "Comment content",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Delete Comment Route

- **Description:** Deletes a comment from a post.
- **Method:** POST
- **Endpoint:** `/api/comment/delete`
- **Request Body:**
  - `token`: Authentication token (String)
  - `commentID`: ID of the comment to delete (String)

**Example:**

```javascript
axios
  .post("/api/comment/delete", {
    token: "authenticationToken",
    commentID: "commentIDToDelete",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

#### Like Comment Route

- **Description:** Likes or unlikes a comment.
- **Method:** POST
- **Endpoint:** `/api/comment/like`
- **Request Body:**
  - `token`: Authentication token (String)
  - `commentID`: ID of the comment to like/unlike (String)

**Example:**

```javascript
axios
  .post("/api/comment/like", {
    token: "authenticationToken",
    commentID: "commentIDToLikeUnlike",
  })
  .then((response) => {
    console.log(response.data);
  })
  .catch((error) => {
    console.error(error.response.data);
  });
```

### Other Functions

#### Check Token Function

- **Description:** Checks the validity of a JWT token.
- **Usage:** This function is used to validate JWT tokens for authentication purposes.
- **Dependencies:** `jsonwebtoken`, `pg_pool`, `dotenv`

#### Is Valid Username Function

- **Description:** Validates if a username follows a specific pattern.
- **Usage:** This function checks if a username contains only lowercase letters, numbers, and underscores.

#### Send Mail Function

- **Description:** Sends an email using nodemailer.
- **Usage:** This function is used to send emails with a specified subject and content.
- **Dependencies:** `nodemailer`, `dotenv`
