const express = require("express");
const router = express.Router();
const Hashtag = require("../models/Hashtag");
const twitterService = require("../services/twitterService");
const youtubeService = require("../services/youtubeService");

// Get all hashtags with pagination and filtering
router.get("/", async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      platform,
      category,
      sortBy = "trending_score",
      sortOrder = "desc",
    } = req.query;

    const query = {};
    if (platform) query.platform = platform;
    if (category) query.category = category;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

    const hashtags = await Hashtag.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Hashtag.countDocuments(query);

    res.json({
      hashtags,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: parseInt(page) * parseInt(limit) < total,
        hasPrev: parseInt(page) > 1,
      },
      total,
    });
  } catch (error) {
    console.error("Error fetching hashtags:", error);
    res.status(500).json({ error: "Failed to fetch hashtags" });
  }
});

// Get trending hashtags
router.get("/trending", async (req, res) => {
  try {
    const { platform, limit = 20 } = req.query;

    let hashtags;
    if (platform) {
      hashtags = await Hashtag.getTrending(platform, parseInt(limit));
    } else {
      hashtags = await Hashtag.find()
        .sort({ trending_score: -1, "metadata.last_updated": -1 })
        .limit(parseInt(limit));
    }

    res.json(hashtags);
  } catch (error) {
    console.error("Error fetching trending hashtags:", error);
    res.status(500).json({ error: "Failed to fetch trending hashtags" });
  }
});

// Get hashtags by category
router.get("/category/:category", async (req, res) => {
  try {
    const { category } = req.params;
    const { platform, limit = 50 } = req.query;

    const hashtags = await Hashtag.getByCategory(category, platform);
    res.json(hashtags);
  } catch (error) {
    console.error("Error fetching hashtags by category:", error);
    res.status(500).json({ error: "Failed to fetch hashtags by category" });
  }
});

// Get specific hashtag details
router.get("/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform } = req.query;

    const query = { hashtag: hashtag.toLowerCase() };
    if (platform) query.platform = platform;

    const hashtagData = await Hashtag.find(query).sort({
      "metadata.last_updated": -1,
    });

    if (!hashtagData || hashtagData.length === 0) {
      return res.status(404).json({ error: "Hashtag not found" });
    }

    res.json(hashtagData);
  } catch (error) {
    console.error("Error fetching hashtag details:", error);
    res.status(500).json({ error: "Failed to fetch hashtag details" });
  }
});

// Get hashtag time series data
router.get("/:hashtag/timeseries", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platform, days = 7 } = req.query;

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

    res.json({
      hashtag: hashtagData.hashtag,
      platform: hashtagData.platform,
      timeSeries: timeSeriesData,
    });
  } catch (error) {
    console.error("Error fetching hashtag time series:", error);
    res.status(500).json({ error: "Failed to fetch time series data" });
  }
});

// Search hashtags
router.get("/search/:query", async (req, res) => {
  try {
    const { query } = req.params;
    const { platform, limit = 20 } = req.query;

    const searchQuery = {
      hashtag: { $regex: query, $options: "i" },
    };
    if (platform) searchQuery.platform = platform;

    const hashtags = await Hashtag.find(searchQuery)
      .sort({ trending_score: -1 })
      .limit(parseInt(limit));

    res.json(hashtags);
  } catch (error) {
    console.error("Error searching hashtags:", error);
    res.status(500).json({ error: "Failed to search hashtags" });
  }
});

// Get hashtag statistics
router.get("/stats/overview", async (req, res) => {
  try {
    const stats = await Hashtag.aggregate([
      {
        $group: {
          _id: null,
          totalHashtags: { $sum: 1 },
          totalMentions: { $sum: "$metrics.mentions" },
          avgTrendingScore: { $avg: "$trending_score" },
          topCategory: {
            $top: {
              n: 1,
              sortBy: { count: -1 },
              output: { category: "$_id", count: "$count" },
              groupBy: "$category",
            },
          },
        },
      },
    ]);

    const platformStats = await Hashtag.aggregate([
      {
        $group: {
          _id: "$platform",
          count: { $sum: 1 },
          totalMentions: { $sum: "$metrics.mentions" },
        },
      },
    ]);

    const categoryStats = await Hashtag.aggregate([
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
          avgTrendingScore: { $avg: "$trending_score" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    res.json({
      overview: stats[0] || {},
      platforms: platformStats,
      categories: categoryStats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
});

module.exports = router;
