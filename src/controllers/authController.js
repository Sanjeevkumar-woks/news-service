import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mail.js";
import Users from "../models/userModel.js";
export class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { userName, password, emailId } = req.body;

      // Check for missing fields
      if (!userName || !password || !emailId) {
        return res
          .status(400)
          .json({ message: "Username, password, and emailId are required" });
      }

      // Check if user already exists
      const existingUser = await Users.findOne({ emailId });

      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
      const user = new Users({
        userName,
        emailId,
        password: hashedPassword,
        isVerified: true, // Set to false if verification is needed
      });

      // Save the user to the database
      await user.save();

      // Send success response
      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      if (err.code === 11000 && err.keyPattern && err.keyPattern.userName) {
        // Handle duplicate userName error
        return res.status(400).json({ message: "Username already exists" });
      }
      // Handle any other errors
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { userName, password } = req.body;

      // Check for missing fields
      if (!userName || !password) {
        return res
          .status(400)
          .json({ message: "Username and password are required" });
      }

      const user = await Users.findOne({
        $or: [{ emailId: userName }, { userName: userName }],
      });

      // Check if user exists
      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }

      // Compare the provided password with the stored hash
      const isPasswordMatch = await bcrypt.compare(password, user.password);

      if (!isPasswordMatch) {
        return res
          .status(400)
          .json({ message: "Invalid username or password" });
      }

      // Check if the user is verified
      if (!user.isVerified) {
        return res.status(400).json({ message: "Please verify your email" });
      }

      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, userName: user.userName, emailId: user.emailId },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      //set cookie with token for domanain http://localhost:5173/
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      // Handle server errors
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  // logout
  static async logout(req, res) {
    res.clearCookie("token", { httpOnly: true });
    res.status(200).json({ message: "Logout successful" });
  }

  //forgot password
  static async forgetPassword(req, res) {
    const { emailId } = req.body;

    const user = await Users.findOne({ emailId });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    const link = `https://resetpassword-app.netlify.app/resetPassword?token=${token}`; // Replace with your reset password link

    //send email
    sendMail(
      "sanjeevmanagutti@gmail.com",
      emailId,
      `Click on the link to reset your password: ${link}`,
      "Reset Password Link"
    );

    res.status(200).json({ message: "Reset password link sent to your email" });
  }

  //reset password
  static async resetPassword(req, res) {
    const { password } = req.body;
    const { token } = req.query;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await Users.findById(decoded._id);

      if (!user) {
        return res.status(400).json({ message: "User not found" });
      }
      const salt = await bcrypt.genSalt(10);

      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      const response = await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return res.status(400).json({ message: "Invalid token" });
      }
      if (err.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
