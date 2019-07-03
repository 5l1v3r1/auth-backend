import jwt from "jsonwebtoken";
import crypto from "crypto";
import { promisify } from "es6-promisify";
import Redis from "ioredis";

import config from "../config";

const redis = new Redis();
export const signAsync = promisify(jwt.sign);
export const verifyAsync = promisify(jwt.verify);
const randomBytesAsync = promisify(crypto.randomBytes);

const generateJti = async (salt) => {
  try {
    let jti = await randomBytesAsync(32);
    return Promise.resolve(crypto.createHmac('sha256', jti.toString("hex") + salt).digest('hex'));
  } catch (e) {
    return Promise.reject(e);
  }
}

export const generateEmailToken = async (payload, secret) => {
  try {
    const jti = await generateJti(payload.email);
    const emailTokenPayload = Object.assign({}, payload, { jti: jti });
    const emailToken = await signAsync(emailTokenPayload, secret);

    return Promise.resolve({ emailToken, jti });
  } catch (e) {
    return Promise.reject(e);
  }
}

export const generateTokens = async (payload, secret) => {
  try {
    const jti = await generateJti(payload.email);
    payload.jti = jti;

    const accessToken = await signAsync(payload, secret);
    await redis.setex(jti, config.access_token_ttl, payload.email);

    return Promise.resolve({ accessToken });

  } catch (e) {
    return Promise.reject(e);
  }
}

export const verifyToken = async (jti, email) => {
  try {
    const resp = await redis.get(jti);
    if (email !== resp) throw null;
    else return Promise.resolve();
  }
  catch (err) {
    return Promise.reject({ message: "Expired" });
  }
}
