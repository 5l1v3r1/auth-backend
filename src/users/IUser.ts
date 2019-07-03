import { Document, Model } from 'mongoose';

export interface IUserDocument extends Document {
    username: string;
    password: string;
    email: string;
    verified: boolean;
    email_token: string;
}

export interface IUser extends IUserDocument {
    // Instanced methods for Document
    verifyPassword(password: any): Promise<boolean>;
}

export interface IUserModel extends Model<IUser> {
    // Static methods for Model
}