import passport from "koa-passport";
import { Strategy as LocalStrategy } from "passport-local";
import { generateTokens, generateEmailToken } from "./oauth";
import User from '../users/User';
import config from "../config";

passport.use(new LocalStrategy(async (username, password, done) => {
  try {
    let user = await User.findOne({ email: username });
    if (!user) throw null;

    let isMatch = await user.verifyPassword(password);
    if (!isMatch) throw null;

    if (isMatch) {
      done(null, { email: username, verified: user.verified }, { message: 'Success' });
    }

  } catch (err) {
    done(null, false, { message: 'Incorrect username or password.' });
  }
}));

export const localAuthHandler = (ctx, next) => {
  return passport.authenticate('local', async (err, user, info) => {
    if (user === false) {
      ctx.status = 401;
      ctx.body = info.message;
    } else {
      try {
        const { accessToken } = await generateTokens(user, config.jwt_secret);
        ctx.body = { accessToken }
      } catch (e) {
        ctx.throw(500, e);
      }
    }
  })(ctx, next);
};

export default passport;
