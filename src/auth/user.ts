import jwt from "jsonwebtoken";

import User from '../users/User';
import * as email from './email';
import config from "../config";
import { generateEmailToken, verifyAsync } from "./oauth";

export const register = async (ctx, next) => {
  let user = new User({
    username: ctx.request.body.username,
    password: ctx.request.body.password,
    email: ctx.request.body.email
  });

  try {
    const { emailToken, jti } = await generateEmailToken({ user }, config.email_verification_secret);
    user.email_token = jti;
    await user.save();
    email.sendVerificationLink(user.email, emailToken);

    ctx.status = 201;
  } catch (err) {

    if (err.name === 'ValidationError') {
      if (err.errors.email) ctx.throw(400, "'email' not valid");
      if (err.errors.username) ctx.throw(400, "'username' not valid");
      if (err.errors.password) ctx.throw(400, "'password' not valid");
    }
    else if (err.code === 11000) {
      if (await User.count({ username: user.username }) > 0) ctx.throw(303, "'username' already in use'");
      if (await User.count({ email: user.email }) > 0) ctx.throw(303, "'email' already in use");
    }
    else ctx.throw(500, err);
  }
}

export const verify = async (ctx, next) => {
  try {
    let token = ctx.params.token;

    const decoded: any = jwt.verify(token, config.email_verification_secret);
    let user = await User.findOne({ email: decoded.user.email });

    if (user.email_token === decoded.jti) {
      if (user.verified) {
        ctx.status = 201;
        ctx.body = "Email already verified";
      }
      else {
        user.verified = true;
        user.save();
        ctx.status = 201;
        ctx.body = "Account verified";
      }
    }
    else throw null;

  } catch (err) {
    ctx.status = 401;
    ctx.body = "Email verification token not valid";
  }
}

export const resendVerification = async (ctx, next) => {
  try {
    let user = await User.findOne({ email: ctx.state.jwtdata.email });
    email.sendVerificationLink(user.email, user.email_token);

    ctx.status = 200;
    ctx.body = "Verification email sended sucessfully";
  }
  catch (err) {
    ctx.throw(500, err);
  }
}
