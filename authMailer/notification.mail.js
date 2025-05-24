import nodemailer from "nodemailer";

const mailCommentReply = async (email,replierName,url,commentOwner,productOwner) => {
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
    subject: `HELLO ${replierName.toUpperCase()}`,
    text: ` ${replierName} replied to your comment! Check it out on the app. `,
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
