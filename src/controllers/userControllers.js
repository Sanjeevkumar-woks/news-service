import UserService from "../services/usersService.js";
import { validateJoiSchema } from "../utils/validateSchema.js";
import Joi from "joi";

const signup = async (req, res) => {
  const { name, email, username, password } = req.body;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const user = await UserService.createUser({
    name,
    email,
    username,
    password,
  });

  res.status(201).json({
    message: "User created successfully",
    user,
  });
};

const login = async (req, res) => {
  const { username, password } = req.body;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      username: Joi.string().required(),
      password: Joi.string().required(),
    }),
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const user = await UserService.loginUser({ username, password });

  res.status(200).json({
    message: "User logged in successfully",
    user,
  });
};

const getProfile = async (req, res) => {
  const { user_id } = req.params;

  const user = await UserService.getUserProfile(user_id);

  res.status(200).json({
    message: "User profile fetched successfully",
    user,
  });
};

export { signup, login, getProfile };
