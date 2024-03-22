require("dotenv").config();
const jwt = require("jsonwebtoken");
const pool = require("../../pg_pool");
const SendMail = require("../../mail/send_mail");

const getEmailFromUsernameOrEmail = async (client, usernameOrEmailVerified) => {
  const emailAddressQuery = await client.query(
    `SELECT email FROM user_tbl 
    WHERE username = $1 OR email = $1`,
    [usernameOrEmailVerified]
  );
  return emailAddressQuery.rows[0]?.email;
};

const generateResetPasswordToken = (usernameOrEmailVerified) => {
  return jwt.sign(
    { resetPasswordUsername: usernameOrEmailVerified },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "10m" }
  );
};

const composeEmailBody = (usernameOrEmailVerified, token) => {
  return `
  <div style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1); text-align: left;">
    <p style="font-size: 18px;">Hello ${usernameOrEmailVerified},</p>
    <p style="font-size: 16px;">If you're facing difficulty logging into your Vibely account and have forgotten your password, we've received a request to assist you. Please proceed to regain access to your account or reset your password using the options below.</p>
    <div style="text-align: center;">
         <a href="${process.env.CLIENT_URL}/reset-password?username=${usernameOrEmailVerified}&token=${token}" style="display: inline-block; padding: 10px 20px; font-size: 16px; text-decoration: none; background-color: #f874bb; color: #fff; border-radius: 5px; margin-bottom: 10px;">Reset your password</a>
    </div>
    <p style="font-size: 16px;">If you didn't request a login or password reset link, you can ignore this message and find out why you received it.</p>
    <p style="font-size: 14px; color: #888;">Please note: This password reset link is valid for 10 minutes.</p>
  </div>`;
};

const ForgotPassword = async (req, res) => {
  const { usernameOrEmail } = req.body;
  const client = await pool.connect().catch((err) => {
    console.log(err);
    res.status(500).send("Error connecting to database");
  });

  try {
    if (!usernameOrEmail) {
      res.status(400).json("data missing");
      return;
    }

    const usernameOrEmailVerified = usernameOrEmail.toLowerCase().trim();
    const email = await getEmailFromUsernameOrEmail(
      client,
      usernameOrEmailVerified
    );

    if (email) {
      const token = generateResetPasswordToken(usernameOrEmailVerified);
      const body = composeEmailBody(usernameOrEmailVerified, token);
      await SendMail(email, "Reset Password", body);
      res.status(200).send({ email });
    }
  } catch (err) {
    console.log("unexpected error : ", err);
    res.status(500).json(err);
  } finally {
    client?.release();
  }
};

module.exports = ForgotPassword;
