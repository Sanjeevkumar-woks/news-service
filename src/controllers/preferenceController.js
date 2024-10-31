import { validateJoiSchema } from "../utils/validateSchema.js";
import Joi from "joi";
import {
  emailFrequencyEnum,
  notificationEnum,
} from "../utils/constants/common.js";
import { categoriesEnum } from "../utils/constants/categories.js";
import preferencesService from "../services/preferencesService.js";

const preferenceSchema = Joi.object({
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
});

const createPreferences = async (req, res) => {
  try {
    const validationError = validateJoiSchema(req.body, preferenceSchema);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { user_id, email_frequency, notification_type, categories } =
      req.body;
    const preferences = await preferencesService.createPreferences({
      user_id,
      email_frequency,
      notification_type,
      categories,
    });

    res.status(201).json(preferences);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create preferences." });
  }
};

const updatePreferences = async (req, res) => {
  try {
    const validationError = validateJoiSchema(req.body, preferenceSchema);
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { preferences_id } = req.params;
    const { user_id, email_frequency, notification_type, categories } =
      req.body;
    const preferences = await preferencesService.updatePreferences({
      preferences_id,
      user_id,
      email_frequency,
      notification_type,
      categories,
    });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found." });
    }

    res
      .status(200)
      .json({ message: "Preferences updated successfully", preferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to update preferences." });
  }
};

const deletePreferences = async (req, res) => {
  try {
    const validationError = validateJoiSchema(
      req.params,
      Joi.object({ user_id: Joi.string().required() })
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { user_id } = req.params;
    const result = await preferencesService.deletePreferences({ user_id });

    if (!result) {
      return res.status(404).json({ error: "Preferences not found." });
    }

    res.status(200).json({ message: "Preferences deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete preferences." });
  }
};

const getPreferences = async (req, res) => {
  try {
    const validationError = validateJoiSchema(
      req.params,
      Joi.object({ user_id: Joi.string().required() })
    );
    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const { user_id } = req.params;
    const preferences = await preferencesService.getPreferences({ user_id });

    if (!preferences) {
      return res.status(404).json({ error: "Preferences not found." });
    }

    res.status(200).json({ preferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve preferences." });
  }
};

export {
  createPreferences,
  updatePreferences,
  deletePreferences,
  getPreferences,
};
