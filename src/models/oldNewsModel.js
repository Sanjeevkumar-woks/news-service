import mongoose from "mongoose";

const OldNewsArticleSchema = new mongoose.Schema(
  {
    article_id: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    link: {
      type: String,
      required: false,
    },
    keywords: {
      type: [String],
      default: null,
    },
    creator: {
      type: [String],
      required: false,
    },
    video_url: {
      type: String,
      default: null,
    },
    description: {
      type: String,
      required: false,
    },
    content: {
      type: String,
      required: false,
    },
    pubDate: {
      type: Date,
      required: false,
    },
    pubDateTZ: {
      type: String,
      required: false,
    },
    image_url: {
      type: String,
      required: false,
    },
    source_id: {
      type: String,
      required: false,
    },
    source_priority: {
      type: Number,
      required: false,
    },
    source_name: {
      type: String,
      required: false,
    },
    source_url: {
      type: String,
      required: false,
    },
    source_icon: {
      type: String,
      required: false,
    },
    language: {
      type: String,
      required: false,
    },
    country: {
      type: [String],
      required: false,
    },
    category: {
      type: [String],
      required: false,
    },
    ai_tag: {
      type: String,
      default: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS",
    },
    sentiment: {
      type: String,
      default: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS",
    },
    sentiment_stats: {
      type: String,
      default: "ONLY AVAILABLE IN PROFESSIONAL AND CORPORATE PLANS",
    },
    ai_region: {
      type: String,
      default: "ONLY AVAILABLE IN CORPORATE PLANS",
    },
    ai_org: {
      type: String,
      default: "ONLY AVAILABLE IN CORPORATE PLANS",
    },
    duplicate: {
      type: Boolean,
      required: false,
    },
  },
  { timestamps: true }
);
const OldNewsArticle = mongoose.model("OldNewsArticle", OldNewsArticleSchema);

export default OldNewsArticle;
