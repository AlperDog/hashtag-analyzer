const express = require("express");
const router = express.Router();
const Hashtag = require("../models/Hashtag");

// Get trend analysis for a hashtag
router.get("/trends/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform, days = 30 } = req.query;

    const query = { hashtag: hashtag.toLowerCase() };
    if (platform) query.platform = platform;

    const hashtagData = await Hashtag.findOne(query).sort({
      "metadata.last_updated": -1,
    });

    if (!hashtagData) {
      return res.status(404).json({ error: "Hashtag not found" });
    }

    const cutoffDate = new Date(
      Date.now() - parseInt(days) * 24 * 60 * 60 * 1000
    );
    const timeSeriesData = hashtagData.time_series
      .filter((entry) => entry.timestamp >= cutoffDate)
      .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate trend metrics
    const trendAnalysis = calculateTrendMetrics(timeSeriesData);

    res.json({
      hashtag: hashtagData.hashtag,
      platform: hashtagData.platform,
      timeSeries: timeSeriesData,
      analysis: trendAnalysis,
    });
  } catch (error) {
    console.error("Error analyzing trends:", error);
    res.status(500).json({ error: "Failed to analyze trends" });
  }
});

// Get predictions for a hashtag
router.get("/predictions/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform } = req.query;

    const query = { hashtag: hashtag.toLowerCase() };
    if (platform) query.platform = platform;

    const hashtagData = await Hashtag.findOne(query).sort({
      "metadata.last_updated": -1,
    });

    if (!hashtagData) {
      return res.status(404).json({ error: "Hashtag not found" });
    }

    // Generate predictions based on historical data
    const predictions = generatePredictions(hashtagData.time_series);

    res.json({
      hashtag: hashtagData.hashtag,
      platform: hashtagData.platform,
      predictions,
    });
  } catch (error) {
    console.error("Error generating predictions:", error);
    res.status(500).json({ error: "Failed to generate predictions" });
  }
});

// Get category analysis
router.get("/categories", async (req, res) => {
  try {
    const { platform, days = 7 } = req.query;

    const query = {};
    if (platform) query.platform = platform;
    if (days) {
      query["metadata.last_updated"] = {
        $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
      };
    }

    const categoryStats = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          totalMentions: { $sum: "$metrics.mentions" },
          avgTrendingScore: { $avg: "$trending_score" },
          avgSentiment: { $avg: "$sentiment.overall_score" },
          hashtags: {
            $push: { hashtag: "$hashtag", trending_score: "$trending_score" },
          },
        },
      },
      { $sort: { totalMentions: -1 } },
    ]);

    // Get top hashtags for each category
    const topHashtagsByCategory = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          topHashtags: {
            $top: {
              n: 5,
              sortBy: { trending_score: -1 },
              output: {
                hashtag: "$hashtag",
                trending_score: "$trending_score",
                mentions: "$metrics.mentions",
              },
            },
          },
        },
      },
    ]);

    res.json({
      categories: categoryStats,
      topHashtags: topHashtagsByCategory,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error analyzing categories:", error);
    res.status(500).json({ error: "Failed to analyze categories" });
  }
});

// Get platform comparison analytics
router.get("/platforms/comparison", async (req, res) => {
  try {
    const { days = 7 } = req.query;

    const query = {
      "metadata.last_updated": {
        $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
      },
    };

    const platformStats = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$platform",
          hashtagCount: { $sum: 1 },
          totalMentions: { $sum: "$metrics.mentions" },
          totalEngagement: {
            $sum: {
              $add: ["$metrics.likes", "$metrics.shares", "$metrics.comments"],
            },
          },
          avgTrendingScore: { $avg: "$trending_score" },
          avgSentiment: { $avg: "$sentiment.overall_score" },
          categories: { $addToSet: "$category" },
        },
      },
      { $sort: { totalMentions: -1 } },
    ]);

    // Get trending hashtags by platform
    const trendingByPlatform = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$platform",
          trendingHashtags: {
            $top: {
              n: 10,
              sortBy: { trending_score: -1 },
              output: {
                hashtag: "$hashtag",
                trending_score: "$trending_score",
                mentions: "$metrics.mentions",
                category: "$category",
              },
            },
          },
        },
      },
    ]);

    res.json({
      platformStats,
      trendingByPlatform,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error comparing platforms:", error);
    res.status(500).json({ error: "Failed to compare platforms" });
  }
});

// Get sentiment analysis
router.get("/sentiment", async (req, res) => {
  try {
    const { platform, category, days = 7 } = req.query;

    const query = {
      "metadata.last_updated": {
        $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
      },
    };
    if (platform) query.platform = platform;
    if (category) query.category = category;

    const sentimentStats = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          positiveCount: { $sum: "$sentiment.positive" },
          negativeCount: { $sum: "$sentiment.negative" },
          neutralCount: { $sum: "$sentiment.neutral" },
          avgSentimentScore: { $avg: "$sentiment.overall_score" },
          totalMentions: { $sum: "$metrics.mentions" },
        },
      },
    ]);

    const sentimentByCategory = await Hashtag.aggregate([
      { $match: query },
      {
        $group: {
          _id: "$category",
          positiveCount: { $sum: "$sentiment.positive" },
          negativeCount: { $sum: "$sentiment.negative" },
          neutralCount: { $sum: "$sentiment.neutral" },
          avgSentimentScore: { $avg: "$sentiment.overall_score" },
        },
      },
      { $sort: { avgSentimentScore: -1 } },
    ]);

    res.json({
      overall: sentimentStats[0] || {},
      byCategory: sentimentByCategory,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

// Get growth analysis
router.get("/growth", async (req, res) => {
  try {
    const { platform, category, days = 30 } = req.query;

    const query = {
      "metadata.last_updated": {
        $gte: new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000),
      },
    };
    if (platform) query.platform = platform;
    if (category) query.category = category;

    const hashtags = await Hashtag.find(query).sort({
      "metadata.last_updated": -1,
    });

    const growthData = hashtags.map((hashtag) => {
      const timeSeries = hashtag.time_series
        .filter(
          (entry) =>
            entry.timestamp >=
            new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000)
        )
        .sort((a, b) => a.timestamp - b.timestamp);

      const growthRate = calculateGrowthRate(timeSeries);

      return {
        hashtag: hashtag.hashtag,
        platform: hashtag.platform,
        category: hashtag.category,
        currentMentions: hashtag.metrics.mentions,
        growthRate,
        trending_score: hashtag.trending_score,
      };
    });

    const fastestGrowing = growthData
      .filter((item) => item.growthRate > 0)
      .sort((a, b) => b.growthRate - a.growthRate)
      .slice(0, 10);

    const declining = growthData
      .filter((item) => item.growthRate < 0)
      .sort((a, b) => a.growthRate - b.growthRate)
      .slice(0, 10);

    res.json({
      fastestGrowing,
      declining,
      period: `${days} days`,
    });
  } catch (error) {
    console.error("Error analyzing growth:", error);
    res.status(500).json({ error: "Failed to analyze growth" });
  }
});

// Helper functions
function calculateTrendMetrics(timeSeriesData) {
  if (timeSeriesData.length < 2) {
    return {
      trend: "stable",
      growthRate: 0,
      volatility: 0,
      peak: 0,
      average: 0,
    };
  }

  const mentions = timeSeriesData.map((entry) => entry.mentions);
  const engagements = timeSeriesData.map((entry) => entry.engagement);

  // Calculate growth rate
  const firstMentions = mentions[0];
  const lastMentions = mentions[mentions.length - 1];
  const growthRate =
    firstMentions > 0
      ? ((lastMentions - firstMentions) / firstMentions) * 100
      : 0;

  // Calculate volatility
  const mean = mentions.reduce((sum, val) => sum + val, 0) / mentions.length;
  const variance =
    mentions.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
    mentions.length;
  const volatility = Math.sqrt(variance);

  // Determine trend
  let trend = "stable";
  if (growthRate > 10) trend = "rising";
  else if (growthRate < -10) trend = "falling";

  return {
    trend,
    growthRate: Math.round(growthRate * 100) / 100,
    volatility: Math.round(volatility * 100) / 100,
    peak: Math.max(...mentions),
    average: Math.round(mean * 100) / 100,
    totalMentions: mentions.reduce((sum, val) => sum + val, 0),
    totalEngagement: engagements.reduce((sum, val) => sum + val, 0),
  };
}

function generatePredictions(timeSeriesData) {
  if (timeSeriesData.length < 3) {
    return {
      next_24h: { mentions_prediction: 0, confidence: 0 },
      next_week: { mentions_prediction: 0, confidence: 0 },
    };
  }

  const mentions = timeSeriesData.map((entry) => entry.mentions);
  const recentMentions = mentions.slice(-3);

  // Simple linear regression for prediction
  const n = recentMentions.length;
  const sumX = (n * (n + 1)) / 2;
  const sumY = recentMentions.reduce((sum, val) => sum + val, 0);
  const sumXY = recentMentions.reduce(
    (sum, val, index) => sum + (index + 1) * val,
    0
  );
  const sumX2 = (n * (n + 1) * (2 * n + 1)) / 6;

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  // Predict next 24 hours
  const next24h = Math.max(0, Math.round(slope * (n + 1) + intercept));
  const confidence24h = Math.min(0.9, Math.max(0.1, 1 - Math.abs(slope) / 100));

  // Predict next week
  const nextWeek = Math.max(0, Math.round(slope * (n + 7) + intercept));
  const confidenceWeek = Math.min(0.7, Math.max(0.1, 1 - Math.abs(slope) / 50));

  return {
    next_24h: {
      mentions_prediction: next24h,
      confidence: Math.round(confidence24h * 100) / 100,
    },
    next_week: {
      mentions_prediction: nextWeek,
      confidence: Math.round(confidenceWeek * 100) / 100,
    },
  };
}

function calculateGrowthRate(timeSeriesData) {
  if (timeSeriesData.length < 2) return 0;

  const firstMentions = timeSeriesData[0].mentions;
  const lastMentions = timeSeriesData[timeSeriesData.length - 1].mentions;

  if (firstMentions === 0) return lastMentions > 0 ? 100 : 0;

  return (
    Math.round(((lastMentions - firstMentions) / firstMentions) * 100 * 100) /
    100
  );
}

module.exports = router;
