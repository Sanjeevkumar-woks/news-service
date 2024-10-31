import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../utils/mail.js";
import Users from "../models/userModel.js";
import Joi from "joi";

const sendErrorResponse = (res, status, message) => {
  return res.status(status).json({ error: message });
};

// Define validation schemas
const userSchema = Joi.object({
  userName: Joi.string().min(3).max(30).required(),
  password: Joi.string().min(6).max(50).required(),
  emailId: Joi.string().email().required(),
});

const loginSchema = Joi.object({
  userName: Joi.string().required(),
  password: Joi.string().required(),
});

const passwordSchema = Joi.object({
  password: Joi.string().min(6).max(50).required(),
});

export class AuthController {
  // User registration
  static async register(req, res) {
    try {
      const { error } = userSchema.validate(req.body);
      if (error) {
        return sendErrorResponse(res, 400, error.details[0].message);
      }

      const { userName, password, emailId } = req.body;

      // Check if user already exists
      const existingUser = await Users.findOne({ emailId });
      if (existingUser) {
        return sendErrorResponse(res, 400, "User already exists");
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create new user
      const user = new Users({
        userName,
        emailId,
        password: hashedPassword,
        isVerified: true, // Set to false if verification is needed
      });

      // Save the user to the database
      await user.save();
      return res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
      if (err.code === 11000) {
        return sendErrorResponse(
          res,
          400,
          "Duplicate field error: " + Object.keys(err.keyPattern).join(", ")
        );
      }
      return sendErrorResponse(res, 500, "Internal server error");
    }
  }

  // User login
  static async login(req, res) {
    try {
      const { error } = loginSchema.validate(req.body);
      if (error) {
        return sendErrorResponse(res, 400, error.details[0].message);
      }

      const { userName, password } = req.body;

      const user = await Users.findOne({
        $or: [{ emailId: userName }, { userName }],
      });

      // Check if user exists
      if (!user) {
        return sendErrorResponse(res, 400, "User not found");
      }

      // Compare the provided password with the stored hash
      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch) {
        return sendErrorResponse(res, 400, "Invalid username or password");
      }

      // Check if the user is verified
      if (!user.isVerified) {
        return sendErrorResponse(res, 400, "Please verify your email");
      }

      // Generate JWT token
      const token = jwt.sign(
        { _id: user._id, userName: user.userName, emailId: user.emailId },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      // Set cookie with token
      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Only secure in production
        sameSite: "none",
        maxAge: 24 * 60 * 60 * 1000,
      });
      res.status(200).json({ message: "Login successful", token });
    } catch (err) {
      return sendErrorResponse(res, 500, "Internal server error");
    }
  }

  // Logout
  static async logout(req, res) {
    res.clearCookie("token", { httpOnly: true });
    res.status(200).json({ message: "Logout successful" });
  }

  // Forgot password
  static async forgetPassword(req, res) {
    try {
      const { emailId } = req.body;
      const user = await Users.findOne({ emailId });

      if (!user) {
        return sendErrorResponse(res, 400, "User not found");
      }

      const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
        expiresIn: "1d",
      });
      const link = `${process.env.RESET_PASSWORD_URL}/resetPassword?token=${token}`; // Using env variable for URL

      // Send email
      await sendMail(
        process.env.EMAIL_SENDER, // Using env variable for sender email
        emailId,
        `Click on the link to reset your password: ${link}`,
        "Reset Password Link"
      );

      res
        .status(200)
        .json({ message: "Reset password link sent to your email" });
    } catch (err) {
      return sendErrorResponse(res, 500, "Internal server error");
    }
  }

  // Reset password
  static async resetPassword(req, res) {
    const { error } = passwordSchema.validate(req.body);
    const { token } = req.query;

    if (error) {
      return sendErrorResponse(res, 400, error.details[0].message);
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await Users.findById(decoded._id);

      if (!user) {
        return sendErrorResponse(res, 400, "User not found");
      }

      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      user.password = hashedPassword;
      await user.save();

      res.status(200).json({ message: "Password reset successfully" });
    } catch (err) {
      if (err.name === "JsonWebTokenError") {
        return sendErrorResponse(res, 400, "Invalid token");
      }
      if (err.name === "TokenExpiredError") {
        return sendErrorResponse(res, 401, "Token expired");
      }
      console.error(err);
      return sendErrorResponse(res, 500, "Internal server error");
    }
  }
}
