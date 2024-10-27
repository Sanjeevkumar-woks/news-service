import Preferences from "../models/preferences.js";

import NodeCache from "node-cache";

const cache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

export async function getUsersByPreferences(categories) {
  const cacheKey = `users_${categories.sort().join("_")}`;
  const cachedUsers = cache.get(cacheKey);

  if (cachedUsers) {
    return cachedUsers;
  }

  const users = await fetchUsersFromDatabase(categories);
  cache.set(cacheKey, users);
  return users;
}

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

  static async getUsersByPreferences(newsCategories) {
    const cacheKey = `users_${newsCategories.sort().join("_")}`;
    const cachedUsers = cache.get(cacheKey);

    if (cachedUsers) {
      return cachedUsers;
    }
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
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
      { $match: { "userDetails.is_active": true } },
      {
        $project: {
          email: "$userDetails.email",
          username: "$userDetails.username",
          user_id: "$user_id",
        },
      },
    ]);
    cache.set(cacheKey, users);
    console.log(users.length, "users from service");
    return users;
  }
}
