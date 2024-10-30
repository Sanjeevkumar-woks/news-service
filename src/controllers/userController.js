import userModel from "../models/userModel.js";

export class UserControllers {
  static async getUserById(req, res) {
    //get user from req
    const user = req.user;

    //check if user Exists
    const dbUser = await userModel.findById(user._id);
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //send user
    res.json(dbUser);
  }

  static async getAllUsers(req, res) {
    //get user from req
    const user = req.user;

    //check if user exists
    const dbUser = await userModel.findById(user._id);
    if (!dbUser) {
      return res.status(404).json({ message: "User not found" });
    }

    //get All Users
    const users = await userModel.find();
    // send users
    res.json(users);
  }
}
