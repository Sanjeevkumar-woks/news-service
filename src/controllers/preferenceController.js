import { validateJoiSchema } from "../utils/validateSchema.js";
import Joi from "joi";
import {
  emailFrequencyEnum,
  notificationEnum,
} from "../utils/constants/common.js";
import { categoriesEnum } from "../utils/constants/categories.js";
import preferencesService from "../services/preferencesService.js";

const createPreferences = async (req, res) => {
  const { user_id, email_frequency, notification_type, categories } = req.body;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      user_id: Joi.string().required(),
      email_frequency: Joi.string()
        .valid(...emailFrequencyEnum)
        .required(),
      notification_type: Joi.string()
        .valid(...notificationEnum)
        .required(),
      categories: Joi.array()
        .items(Joi.string().valid(...categoriesEnum))
        .required(),
    }),

    data: req.body,
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const preferences = await preferencesService.createPreferences({
    user_id,
    email_frequency,
    notification_type,
    categories,
  });

  res.status(201).json({
    message: "Preferences created successfully",
    preferences,
  });
};

const updatePreferences = async (req, res) => {
  const { user_id, email_frequency, notification_type, categories } = req.body;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      user_id: Joi.string().required(),
      email_frequency: Joi.string()
        .valid(...emailFrequencyEnum)
        .required(),
      notification_type: Joi.string()
        .valid(...notificationEnum)
        .required(),
      categories: Joi.array()
        .items(Joi.string().valid(...categoriesEnum))
        .required(),
    }),

    data: req.body,
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const preferences = await preferencesService.updatePreferences({
    user_id,
    email_frequency,
    notification_type,
    categories,
  });

  res.status(200).json({
    message: "Preferences updated successfully",
    preferences,
  });
};

const deletePreferences = async (req, res) => {
  const { user_id } = req.params;
  const validationError = validateJoiSchema({
    schema: Joi.object({
      user_id: Joi.string().required(),
    }),
    data: req.params,
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  await PreferencesService.deletePreferences(user_id);

  res.status(200).json({ message: "Preferences deleted successfully" });
};

const getPreferences = async (req, res) => {
  const { user_id } = req.params;

  const validationError = validateJoiSchema({
    schema: Joi.object({
      user_id: Joi.string().required(),
    }),
    data: req.params,
  });

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const preferences = await preferencesService.getPreferences(user_id);

  res.status(200).json({ preferences });
};

export {
  createPreferences,
  updatePreferences,
  deletePreferences,
  getPreferences,
};
