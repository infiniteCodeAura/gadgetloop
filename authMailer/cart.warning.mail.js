import nodemailer from "nodemailer";

const mailCartWarning = async (email, message) => {
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
    subject: `HELLO gadgetloop user`,
    text: `  ${message}`,
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

export default mailCartWarning;
