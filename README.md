# Vibely Social Media Server

Welcome to the Vibely social media server application! This Node.js application serves as the backend for the Vibely social media platform, providing essential functionalities:

# Table of Contents

1. [Error Codes](#error-codes)
2. [Authentication Routes](#authentication-routes)
   - [Sign In Route](#sign-in-route)
   - [Sign Up Route](#sign-up-route)
   - [Forgot Password Route](#forgot-password-route)
   - [Reset Password Route](#reset-password-route)
3. [User Routes](#user-routes)
   - [Follow User Route](#follow-user-route)
   - [Accept Follow Request Route](#accept-follow-request-route)
   - [Check Username Route](#check-username-route)
   - [Get User Data Route](#get-user-data-route)
   - [Get User Profile Picture Route](#get-user-profile-picture-picture-route)
   - [Update User Profile Data Route](#update-user-profile-data-route)
   - [User List Routes](#user-list-routes)
     - [Get User Followers Route](#get-user-followers-route)
     - [Get User Following Route](#get-user-following-route)
     - [Get Post's Liked Users Route](#get-post's-liked-users-route)

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
  .get("/api/user/update/picture", {
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

#### Get Post's Liked Users Route

- **Description:** Retrieves the list of users who liked a post.
- **Method:** GET
- **Endpoint:** `/api/post/liked-users`
- **Query Parameters:**
  - `postID`: ID of the post to retrieve liked users for (String)
  - `token`: Authentication token (String)

**Example:**

```javascript
axios
  .get("/api/post/liked-users", {
    params: {
      postID: "postIDToRetrieveLikedUsersFor",
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
