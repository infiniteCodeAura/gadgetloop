import nodemailer from "nodemailer";

export const mail = async (country, city, ip, message, email,  date) => {
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
    to: "s.g.devil.88@gmail.com",
    subject: `${sub}`,
    text: `${message} \n 
            Country:        ${country} \n
            Ip Address :    ${ip}
            loggedIn Date : ${date}

\n
If this was you, no action is needed.

If you didn’t try to log in, please secure your account immediately by changing your password
    
    `,
  };

  // Send mail
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log("Error:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
  });
};
