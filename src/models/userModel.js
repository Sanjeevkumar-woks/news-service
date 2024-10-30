import mongoose from "mongoose";

export const userSchema = new mongoose.Schema(
  {
    emailId: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    userName: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true, collection: "Users" }
);

const Users = mongoose.model("User", userSchema);

export default Users;
