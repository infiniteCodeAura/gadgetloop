import nodemailer from "nodemailer";

const mailCode = async (otp, email, name) => {
  // Configure transporter
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "wwwghimiresagar88@gmail.com", // Your Gmail address
      pass: process.env.appPassword, // App password (not your Gmail password)
    },
  });
  // Mail options
  const mailOptions = {
    from: "wwwghimiresagar88@gmail.com",
    to: `${email}`,
    subject: `HELLO ${name.toUpperCase()}`,
    text: `  Your password reset code is: ${otp}

If you requested this, use the code to reset your password.

If you did not request a password reset, please ignore this message or secure your account. `,
  };

  // Send mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error.message);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};

export default mailCode;
