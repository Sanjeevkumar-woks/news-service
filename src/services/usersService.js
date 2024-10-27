import Users from "../models/usersModel.js";
import bcrypt from "bcrypt";

export default class UserService {
  static async createUser({ name, email, username, password }) {
    if (await Users.findOne({ email })) {
      throw new Error("User already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await Users.create({
      name,
      email,
      username,
      password: hashedPassword,
      is_active: true,
    });
    return user;
  }

  static async loginUser({ username, password }) {
    const user = await Users.findOne({ username });
    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error("Invalid password");
    }

    return user;
  }

  static async getUserProfile(user_id) {
    const user = await Users.findById(user_id);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }
}
