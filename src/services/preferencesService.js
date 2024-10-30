import mongoose from "mongoose";
import Preferences from "../models/preferences.js";

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

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
      return { message: "Preferences already exists" };
    }

    const preferences = await Preferences.create({
      user_id,
      email_frequency,
      notification_type,
      categories,
    });

    if (!preferences) {
      return { message: "Preferences not created" };
    }

    return { message: "Preferences created successfully" };
  }

  static async updatePreferences({
    preferences_id,
    user_id,
    email_frequency,
    notification_type,
    categories,
  }) {
    const preferences = await Preferences.findOneAndUpdate(
      { _id: preferences_id },
      { email_frequency, notification_type, categories },
      { new: true }
    );

    return preferences;
  }

  static async deletePreferences({ user_id }) {
    const preferences = await Preferences.findOneAndDelete({ user_id });

    return preferences || null;
  }

  static async getPreferences({ user_id }) {
    const preferences = await Preferences.findOne({ user_id });

    return preferences;
  }

  static async getUsersByPreferences(newsCategories, email_frequency) {
    console.log(newsCategories, email_frequency, "from service");
    const users = await Preferences.aggregate([
      {
        $match: {
          categories: { $in: newsCategories },
          email_frequency: email_frequency,
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
