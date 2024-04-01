# Vibely Social Media Server

Welcome to the Vibely social media server application! This Node.js application serves as the backend for the Vibely social media platform, providing essential functionalities:

- [Authentication Routes](#authentication-routes)
  - [Sign Up](#sign-up-root)
  - [Sign In](#sign-in-root)
  - [Forgot Password](#forgot-password-root)
  - [Reset Password](#reset-password-root)
- [User Routes](#user-routes)
  - [Check Username](#check-usernames-root)
  - [Follow User](#follow-user-root)
  - [Accept User Follow Request](#accept-user-follow-request-root)
  - [Update User Profile Data](#update-user-profile-data-root)
  - [Get User Data](#get-user-data-root)
  - [Get User Picture](#get-user-picture-root)
  - [Get User List](#get-user-list-root)
    - [Get User Followers](#get-user-followers-root)
    - [Get User Following](#get-user-following-root)
    - [Get Post's Liked Users](#get-post-liked-users-root)

## Authentication Routes

#### Common Functionality:

1. **Database Connection**:

   - The server establishes a connection to the PostgreSQL database using a connection pool.

2. **Input Validation**:

   - Checks for the presence of required fields in the request body (e.g., `username`, `firstName`, `password`, `email`).
   - If any required field is missing, it returns a 400 status code along with a "Missing required data" error message.

3. **JWT Token Generation**:

   - Generates a JWT token for the user using the `generateToken` function.
   - The token includes the `username` and `tokenVersion` of the user.
   - Specifies an expiration time of 1000 days for the token.

4. **Unique Browser ID Generation**:

   - Generates a unique browser ID using the `generateUniqueBrowserID` function.
   - The browser ID is concatenated from a random hexadecimal string and the current timestamp.

5. **Response Handling**:
   - Handles response generation for successful and error scenarios.
   - Sends appropriate status codes and response messages.

### Sign Up Root

This root handles the sign up process for new users.

#### Variables:

- `req.body.username`:
  - This variable contains the username provided by the user during signup.
- `req.body.firstName`:
  - This variable contains the first name provided by the user during signup.
- `req.body.password`:
  - This variable contains the password provided by the user during signup.
- `req.body.email`:
  - This variable contains the email provided by the user during signup.

#### Functionality

1. **Username Validation**:

   - Validates the format of the username using the `validateUsername` function.
   - Converts the username to lowercase and trims any leading or trailing whitespace.
   - If the username is invalid, it returns a 400 status code with an "Invalid username" error message.

2. **Username Availability Check**:

   - Queries the database to check if the username is already taken using the `isUsernameTaken` function.
   - If the username is already taken, it returns a 409 status code with a "Username is already taken" error message.

3. **User Creation**:

   - Inserts a new user record into the `user_tbl` table in the database using the `createUser` function.
   - Includes the username, password, email, first name, and the current date as the created date.

4. **Welcome Message**:

   - Sends a welcome message along with the JWT token, username, and browser ID in the response body upon successful user creation.

### Sign In Root

This root handles the sign-in process for users.

#### Variables:

- `req.body.usernameOrEmail`:

  - This variable contains the username or email provided by the user during sign-in.

- `req.body.password`:
  - This variable contains the password provided by the user during sign-in.

#### Functionality

1. **User Retrieval**:

   - Queries the database to retrieve user information based on the provided `usernameOrEmail`.
   - If the user is not found, it returns a 404 status code with an error message.

2. **Password Validation**:

   - Compares the provided password with the password stored in the database.
   - If the password is incorrect, it returns a 401 status code with an error message.

### Forgot Password Root

This root handles the process for users who have forgotten their passwords and need to reset them.

#### Variables:

- `req.body.usernameOrEmail`:
  - This variable contains the username or email provided by the user who has forgotten their password.

#### Functionality

1. **Data Validation**:

   - Checks if the `usernameOrEmail` field is provided in the request body.
   - If the field is missing, it returns a 400 status code with a "Data missing" error message.

2. **Email Retrieval**:

   - Queries the database to retrieve the email associated with the provided `usernameOrEmail`.
   - If the email is found, it proceeds to the next step; otherwise, it stops execution and does not send a reset password link.

3. **Token Generation**:

   - Generates a JWT token for resetting the password using the `generateResetPasswordToken` function.
   - The token includes the `resetPasswordUsername` payload with the `usernameOrEmailVerified`.
   - Specifies an expiration time of 10 minutes for the token.

4. **Email Composition**:

   - Composes an email body with a reset password link using the `composeEmailBody` function.
   - The email contains instructions and a link to reset the password.

5. **Email Sending**:

   - Sends the composed email to the retrieved email address using the `SendMail` function.
   - If the email is successfully sent, it responds with a 200 status code and the email address.
   - If there's an error during any step of the process, it returns a 500 status code with an error message.

### Reset Password Root

This root handles the process for users resetting their passwords using a token sent via email.

#### Variables:

- `req.body.password`:
  - This variable contains the new password provided by the user for resetting.
- `req.body.token`:
  - This variable contains the token sent to the user's email for password reset verification.

#### Functionality

1. **Data Validation**:

   - Checks if both `password` and `token` fields are provided in the request body.
   - If any field is missing, it returns a 400 status code with a "Data missing" error message.

2. **Token Verification**:

   - Verifies the token received in the request body using the `verifyTokenAndGetUsername` function.
   - If the token is invalid or expired, it returns a 400 status code with a "Wrong token" error message.

3. **Password Update**:

   - Updates the user's password in the database using the `updateUserPassword` function.
   - Increments the `token_version` in the `user_tbl` table to invalidate any existing tokens.
   - Uses the username obtained from the verified token to identify the user.

4. **Response**:

   - If the password is changed successfully, it responds with a 200 status code and a "Password changed successfully" message.
   - If there's an error during any step of the process, it returns a 500 status code with an error message.

## User Routes

#### Common Functionality:

### Check Username Root

This route checks the availability of a username.

#### Variables:

- `req.body.username`:
  - This variable contains the username to be checked for availability.

#### Functionality

1. **Data Validation**:

   - Checks if the `username` field is provided in the request body.
   - If the field is missing, it returns a 400 status code with a "Data missing" error message.

2. **Username Format Validation**:

   - Validates the format of the username.
   - If the username contains invalid characters, it responds with a 200 status code and an appropriate error message.

3. **Username Availability Check**:

   - Queries the database to check if the username is already taken.
   - If the username is available, it responds with a 200 status code and a message indicating availability.
   - If the username is already taken, it responds with a message indicating that the username is taken.
