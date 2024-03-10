const nodemailer = require("nodemailer");
require("dotenv").config();

// SEND E-MAIL REQUEST
const SendMail = async (email, subject, html) => {
  //E-MAIL INFORMATION
  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true, //ssl
    auth: {
      user: process.env.ZOHO_EMAIL,
      pass: process.env.ZOHO_PASSWORD,
    },
  });

  const mailOptions = {
    from: "Vibely <help@vibely.rf.gd>",
    to: email,
    subject,
    html,
  };

  transporter.sendMail(mailOptions).catch((err) => console.log(err));
};

module.exports = SendMail;
