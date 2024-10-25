import Preferences from "../models/preferences.js";

export default class PreferencesService {
  static async createPreferences({
    user_id,
    email_frequency,
    notification_type,
    categories,
  }) {
    //check if preferences already exists
    const existingPreferences = await Preferences.findOne({ user_id });

    if (existingPreferences) {
      throw new Error("Preferences already exists");
    }

    const preferences = await Preferences.create({
      user_id,
      email_frequency,
      notification_type,
      categories,
    });

    return preferences;
  }

  static async updatePreferences({
    user_id,
    email_frequency,
    notification_type,
    categories,
  }) {
    const preferences = await Preferences.findOneAndUpdate(
      { user_id },
      { email_frequency, notification_type, categories },
      { new: true }
    );

    return preferences;
  }

  static async deletePreferences({ user_id }) {
    const preferences = await Preferences.findOneAndDelete({ user_id });

    if (!preferences) {
      throw new Error("Preferences not found");
    }

    return preferences;
  }

  static async getPreferences({ user_id }) {
    const preferences = await Preferences.findOne({ user_id });

    if (!preferences) {
      throw new Error("Preferences not found");
    }

    return preferences;
  }
}
