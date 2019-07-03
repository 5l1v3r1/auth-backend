import nodemailer from 'nodemailer';
import config from '../config';

let smtpTransport = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: config.email_smtp_user,
    pass: config.email_smtp_password
  }
});

export const sendVerificationLink = async (email, token) => {
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail({
      from: `Admin <${config.email_smtp_user}>`,
      to: email,
      subject: 'Account Verification',
      text: `${config.host}:${config.port}/user/verify/${token}`
    }, (err, info) => {
      smtpTransport.close();
      if (err) reject(err);
      else resolve();
    })
  });
}

