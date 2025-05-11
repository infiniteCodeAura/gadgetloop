
import nodemailer from "nodemailer"

export const mail = async (to,name,code,subject,text)=>{

    // Configure transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'wwwghimiresagar88@gmail.com',        // Your Gmail address
    pass: process.env.appPassword             // App password (not your Gmail password)
  }
});

// Mail options
const mailOptions = {
  from: 'wwwghimiresagar88@gmail.com',
  to: 's.g.devil.88@gmail.com',
  subject: 'Hello from Nodemailer!',
  text: 'This is a test email sent using Nodemailer and Gmail.'
};

// Send mail
 transporter.sendMail(mailOptions, function(error, info){
  if (error) {
    console.log('Error:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});


}




