import Preferences from "../models/preferences.js";

export default class PreferencesService {
  static async createPreferences({
    user_id,
    email_frequency,
    notification_type,
    categories,
  }) {
    const existingPreferences = await Preferences.findOne({ user_id });
    if (existingPreferences) {
      throw new Error("Preferences already exist.");
    }

    const preferences = await Preferences.create({
      user_id,
      email_frequency,
      notification_type,
      categories,
    });

    await preferences.save();

    console.log(preferences);

    if (!preferences) {
      throw new Error("Failed to create preferences.");
    }

    return { message: "Preferences created successfully", preferences };
  }

  static async updatePreferences({
    preferences_id,
    user_id,
    email_frequency,
    notification_type,
    categories,
  }) {
    const preferences = await Preferences.findOneAndUpdate(
      { _id: preferences_id, user_id },
      { email_frequency, notification_type, categories },
      { new: true }
    );

    if (!preferences) {
      throw new Error("Preferences not found.");
    }

    return preferences;
  }

  static async deletePreferences({ user_id }) {
    const preferences = await Preferences.findOneAndDelete({ user_id });
    if (!preferences) {
      throw new Error("Preferences not found.");
    }
    return preferences;
  }

  static async getPreferences({ user_id }) {
    const preferences = await Preferences.findOne({ user_id });
    if (!preferences) {
      throw new Error("Preferences not found.");
    }
    return preferences;
  }
}
