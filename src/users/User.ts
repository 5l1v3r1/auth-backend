import { Schema, Document, Model, model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as validator from 'validator';

import { IUser, IUserModel } from './IUser'

let SALT_WORK_FACTOR = 10;

var userSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 20
  },
  password: { type: String, required: true },
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true,
    trim: true,
    index: { unique: true },
    validate: {
      validator: (val) => {
        return validator.isEmail(val);
      }
    },
  },
  verified: { type: Boolean, default: false },
  email_token: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
});

userSchema.pre('save', function (next) {
  let user = this;

  // only hash the password if it has been modified (or is new)
  if (!user.isModified('password')) return next();

  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err);

    bcrypt.hash(user.get('password'), salt, function (err, hash) {
      if (err) return next(err);

      user.set('password', hash);
      next();
    });
  });
});

userSchema.methods.verifyPassword = function (candidatePassword) {
  let user = this;
  return new Promise((resolve, reject) => {
    bcrypt.compare(candidatePassword, user.password, (err, isMatch) => {
      if (err) reject(err);
      resolve(isMatch);
    });
  });
};


const User: IUserModel = model<IUser, IUserModel>('User', userSchema);
export default User;