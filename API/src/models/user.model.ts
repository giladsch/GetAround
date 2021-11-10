import { Document, Schema, model, SchemaDefinition, Model } from "mongoose";

export interface IUser extends Document {
  name: string;
  height: number;
  _id: string;
}

export type IUserSchema = IUser & SchemaDefinition;
export interface IUserModel extends IUser {}

export const userSchema = new Schema<IUserSchema>(
  {
    name: String,
    height: Number
  },
  { versionKey: false }
);

export const User: Model<IUserModel> = model<IUserModel>("User", userSchema, "Users");
