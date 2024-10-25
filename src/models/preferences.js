import mongoose from "mongoose";

// stores the users preferences for the news they receive by categories and also the frequency AND type of notification they receive email or push notification
const preferencesSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true,
  },
  email_frequency: {
    type: String,
    required: true,
  },
  notification_type: {
    type: String,
    required: true,
  },
  categories: {
    type: [String],
    required: true,
  },
});

const Preferences = mongoose.model("Preferences", preferencesSchema);

export default Preferences;
