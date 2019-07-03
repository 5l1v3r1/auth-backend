import Router from "koa-router";

import { localAuthHandler } from "./auth/passport";

import {
  register,
  verify,
} from "./auth/user";

const router = new Router();

router.post('/authenticate', localAuthHandler);
router.post('/user', register);
router.get('/user/verify/:token', verify);

export default router;
