require('dotenv').config()
const nodemailer = require('nodemailer');
const stmp = process.env.stmp
const sender = process.env.sender
const receiver = process.env.receiver
const user = process.env.user
let transporter = nodemailer.createTransport({
  service: 'qq',
  port: 465,
  secureConnection: true,
  auth: {
    user,
    pass: stmp,
  }
});

const sendEmail = (url) => {

  let mailOptions = {
    from: sender,
    to: receiver,
    subject: '成功检测到XBOX库存！！',
    text: `点击网页！${url}`,
  };

  transporter.sendMail(mailOptions, (error) => {
    if (error) {
      return console.log(error);
    }
    console.log("邮件成功发射!");
  });
}
module.exports = sendEmail
