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

  static async getUsersByPreferences(newsCategories) {
    const users = await Preferences.aggregate([
      {
        $match: {
          categories: { $in: newsCategories },
          email_frequency: "immediately",
        },
      },
      {
        $addFields: {
          userId: { $toObjectId: "$user_id" },
        },
      },
      {
        $lookup: {
          from: "Users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          email: "$userDetails.emailId",
          username: "$userDetails.username",
          user_id: "$user_id",
          notification_type: "$notification_type",
        },
      },
    ]);

    console.log(users.length, "users from service");
    return users;
  }
}
