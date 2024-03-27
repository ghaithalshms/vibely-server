# Vibely Social Media Server

Welcome to the Vibely social media server application! This Node.js application serves as the backend for the Vibely social media platform, providing essential functionalities:

- [Authentication](#authentication)
  - [Sign Up](#sign-up-root)
  - [Sign In](#sign-in-root)

## Authentication

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
