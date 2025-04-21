const nodemailer = require('nodemailer');
require('dotenv').config(); // Load environment variables

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST, // e.g., 'smtp.gmail.com'
  port: process.env.SMTP_PORT, // e.g., 587
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER, // Your email address
    pass: process.env.SMTP_PASS, // Your email password
  },
});

async function sendEmail(to, subject, text, html = null) {
  const mailOptions = {
    from: process.env.SMTP_USER, // Sender address
    to, // Recipient address
    subject, // Subject line
    text, // Plain text body
    ...(html && { html }), // Optional HTML body
  };

  return transporter.sendMail(mailOptions);
}

module.exports = sendEmail;
