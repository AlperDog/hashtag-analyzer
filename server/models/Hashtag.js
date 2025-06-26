const mongoose = require("mongoose");

const hashtagSchema = new mongoose.Schema(
  {
    hashtag: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    platform: {
      type: String,
      required: true,
      enum: ["twitter", "instagram", "youtube", "tiktok"],
    },
    category: {
      type: String,
      required: true,
      enum: [
        "politics",
        "sports",
        "entertainment",
        "technology",
        "business",
        "health",
        "education",
        "lifestyle",
        "news",
        "other",
      ],
    },
    metrics: {
      mentions: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
      engagement_rate: { type: Number, default: 0 },
      reach: { type: Number, default: 0 },
    },
    sentiment: {
      positive: { type: Number, default: 0 },
      negative: { type: Number, default: 0 },
      neutral: { type: Number, default: 0 },
      overall_score: { type: Number, default: 0 },
    },
    trending_score: {
      type: Number,
      default: 0,
    },
    related_hashtags: [
      {
        hashtag: String,
        correlation: Number,
      },
    ],
    top_posts: [
      {
        platform: String,
        post_id: String,
        content: String,
        author: String,
        engagement: Number,
        timestamp: Date,
      },
    ],
    location_data: {
      countries: [String],
      cities: [String],
      languages: [String],
    },
    time_series: [
      {
        timestamp: { type: Date, required: true },
        mentions: Number,
        engagement: Number,
        sentiment_score: Number,
      },
    ],
    predictions: {
      next_24h: {
        mentions_prediction: Number,
        confidence: Number,
      },
      next_week: {
        mentions_prediction: Number,
        confidence: Number,
      },
    },
    metadata: {
      first_seen: { type: Date, default: Date.now },
      last_updated: { type: Date, default: Date.now },
      total_mentions: { type: Number, default: 0 },
      peak_mentions: { type: Number, default: 0 },
      peak_date: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
hashtagSchema.index({ hashtag: 1, platform: 1 });
hashtagSchema.index({ category: 1 });
hashtagSchema.index({ "metadata.last_updated": -1 });
hashtagSchema.index({ trending_score: -1 });
hashtagSchema.index({ "time_series.timestamp": -1 });

// Virtual for calculating trend direction
hashtagSchema.virtual("trend_direction").get(function () {
  if (this.time_series.length < 2) return "stable";

  const recent = this.time_series.slice(-2);
  const change = recent[1].mentions - recent[0].mentions;

  if (change > 0) return "rising";
  if (change < 0) return "falling";
  return "stable";
});

// Method to update trending score
hashtagSchema.methods.updateTrendingScore = function () {
  const recentMentions = this.time_series
    .filter(
      (entry) => entry.timestamp > new Date(Date.now() - 24 * 60 * 60 * 1000)
    )
    .reduce((sum, entry) => sum + entry.mentions, 0);

  const engagementWeight = this.metrics.engagement_rate * 0.3;
  const mentionWeight = recentMentions * 0.4;
  const sentimentWeight = this.sentiment.overall_score * 0.3;

  this.trending_score = engagementWeight + mentionWeight + sentimentWeight;
  return this.trending_score;
};

// Static method to get trending hashtags
hashtagSchema.statics.getTrending = function (platform, limit = 20) {
  return this.find({ platform })
    .sort({ trending_score: -1, "metadata.last_updated": -1 })
    .limit(limit);
};

// Static method to get hashtags by category
hashtagSchema.statics.getByCategory = function (category, platform) {
  const query = { category };
  if (platform) query.platform = platform;

  return this.find(query).sort({ trending_score: -1 }).limit(50);
};

module.exports = mongoose.model("Hashtag", hashtagSchema);
