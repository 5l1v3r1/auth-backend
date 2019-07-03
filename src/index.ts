import Koa from "koa";
import mongoose from "mongoose";
import bodyparser from "koa-bodyparser";
import Jwt from 'koa-jwt';
import { verifyToken } from './auth/oauth';
import passport from "./auth/passport";
import router from "./routes";
import config from "./config";
import { createServer } from "./apollo";

const app = new Koa();

/* Mongoose */
// Use native promises
(<any>mongoose).Promise = global.Promise;
mongoose.connect(config.mongodb_url, { useNewUrlParser: true });
mongoose.set('useCreateIndex', true);

app.use(bodyparser());
app.use(passport.initialize());

// Routes defined here does not require authentication
app.use(router.routes()).use(router.allowedMethods());

/** Authentication */
// Koa middlewares order matters
// JsonWebToken stateless authentication
app.use(Jwt({ secret: config.jwt_secret, key: 'jwtdata' }));

// Enable redis session storage and TTL for stateful authentication
if (config.stateless === false) {
  app.use(async (ctx, next) => {
    try {
      await verifyToken(ctx.state.jwtdata.jti, ctx.state.jwtdata.email);
      return next();
    } catch (e) {
      ctx.throw(401, 'Token expired');
    }
  });
}

/**  Anything below here must be authenticated */

// Apollo server middleware
let server = createServer();
app.use(server.getMiddleware());

/** Custom 401 handling */
app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    if (err.status == 401) {
      ctx.throw(401, 'Protected resource, use Authorization header to get access\n');
    } else {
      ctx.throw(500, err.message);
    }
  }
});

app.listen({ port: 4000 }, () =>
  console.log(`🚀 Server ready at http://localhost:4000/graphql`),
);