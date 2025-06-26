const express = require("express");
const router = express.Router();
const Hashtag = require("../models/Hashtag");
const twitterService = require("../services/twitterService");
const youtubeService = require("../services/youtubeService");

// Fetch trending hashtags from Twitter
router.get("/twitter/trending", async (req, res) => {
  try {
    const { woeid = 1 } = req.query;
    const trendingHashtags = await twitterService.getTrendingHashtags(
      parseInt(woeid)
    );

    res.json({
      platform: "twitter",
      hashtags: trendingHashtags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching Twitter trends:", error);
    res.status(500).json({ error: "Failed to fetch Twitter trends" });
  }
});

// Fetch trending hashtags from YouTube
router.get("/youtube/trending", async (req, res) => {
  try {
    const { regionCode = "US", maxResults = 50 } = req.query;
    const trendingHashtags = await youtubeService.getTrendingVideos(
      regionCode,
      parseInt(maxResults)
    );

    res.json({
      platform: "youtube",
      hashtags: trendingHashtags,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching YouTube trends:", error);
    res.status(500).json({ error: "Failed to fetch YouTube trends" });
  }
});

// Fetch hashtag data from Twitter
router.get("/twitter/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { count = 100 } = req.query;

    const hashtagData = await twitterService.getHashtagData(
      hashtag,
      parseInt(count)
    );

    if (!hashtagData) {
      return res
        .status(404)
        .json({ error: "No data found for this hashtag on Twitter" });
    }

    // Categorize the hashtag
    hashtagData.category = twitterService.categorizeHashtag(hashtag);

    // Update trending score
    hashtagData.trending_score =
      hashtagData.metrics.engagement_rate * 0.3 +
      hashtagData.metrics.mentions * 0.4 +
      hashtagData.sentiment.overall_score * 0.3;

    res.json(hashtagData);
  } catch (error) {
    console.error("Error fetching Twitter hashtag data:", error);
    res.status(500).json({ error: "Failed to fetch Twitter hashtag data" });
  }
});

// Fetch hashtag data from YouTube
router.get("/youtube/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { maxResults = 50 } = req.query;

    const hashtagData = await youtubeService.getHashtagData(
      hashtag,
      parseInt(maxResults)
    );

    if (!hashtagData) {
      return res
        .status(404)
        .json({ error: "No data found for this hashtag on YouTube" });
    }

    // Categorize the hashtag
    hashtagData.category = youtubeService.categorizeHashtag(hashtag);

    // Update trending score
    hashtagData.trending_score =
      hashtagData.metrics.engagement_rate * 0.3 +
      hashtagData.metrics.mentions * 0.4 +
      hashtagData.sentiment.overall_score * 0.3;

    res.json(hashtagData);
  } catch (error) {
    console.error("Error fetching YouTube hashtag data:", error);
    res.status(500).json({ error: "Failed to fetch YouTube hashtag data" });
  }
});

// Fetch and store hashtag data from all platforms
router.post("/fetch/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;
    const { platforms = ["twitter", "youtube"] } = req.body;

    const results = {};
    const promises = [];

    if (platforms.includes("twitter")) {
      promises.push(
        twitterService
          .getHashtagData(hashtag)
          .then((data) => {
            if (data) {
              data.category = twitterService.categorizeHashtag(hashtag);
              data.trending_score =
                data.metrics.engagement_rate * 0.3 +
                data.metrics.mentions * 0.4 +
                data.sentiment.overall_score * 0.3;
              results.twitter = data;

              // Save to database
              return Hashtag.findOneAndUpdate(
                { hashtag: hashtag.toLowerCase(), platform: "twitter" },
                {
                  ...data,
                  "metadata.last_updated": new Date(),
                },
                { upsert: true, new: true }
              );
            }
          })
          .catch((error) => {
            console.error("Twitter fetch error:", error);
            results.twitter = { error: "Failed to fetch Twitter data" };
          })
      );
    }

    if (platforms.includes("youtube")) {
      promises.push(
        youtubeService
          .getHashtagData(hashtag)
          .then((data) => {
            if (data) {
              data.category = youtubeService.categorizeHashtag(hashtag);
              data.trending_score =
                data.metrics.engagement_rate * 0.3 +
                data.metrics.mentions * 0.4 +
                data.sentiment.overall_score * 0.3;
              results.youtube = data;

              // Save to database
              return Hashtag.findOneAndUpdate(
                { hashtag: hashtag.toLowerCase(), platform: "youtube" },
                {
                  ...data,
                  "metadata.last_updated": new Date(),
                },
                { upsert: true, new: true }
              );
            }
          })
          .catch((error) => {
            console.error("YouTube fetch error:", error);
            results.youtube = { error: "Failed to fetch YouTube data" };
          })
      );
    }

    await Promise.all(promises);

    res.json({
      hashtag: hashtag.toLowerCase(),
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching hashtag data:", error);
    res.status(500).json({ error: "Failed to fetch hashtag data" });
  }
});

// Get platform comparison for a hashtag
router.get("/compare/:hashtag", async (req, res) => {
  try {
    const { hashtag } = req.params;

    const hashtagData = await Hashtag.find({
      hashtag: hashtag.toLowerCase(),
    }).sort({ "metadata.last_updated": -1 });

    if (!hashtagData || hashtagData.length === 0) {
      return res.status(404).json({ error: "Hashtag not found" });
    }

    const comparison = {
      hashtag: hashtag.toLowerCase(),
      platforms: {},
      summary: {
        totalMentions: 0,
        totalEngagement: 0,
        avgSentiment: 0,
        bestPerformingPlatform: null,
      },
    };

    let totalMentions = 0;
    let totalEngagement = 0;
    let totalSentiment = 0;
    let platformCount = 0;

    hashtagData.forEach((data) => {
      comparison.platforms[data.platform] = {
        mentions: data.metrics.mentions,
        engagement:
          data.metrics.likes + data.metrics.shares + data.metrics.comments,
        sentiment: data.sentiment.overall_score,
        trending_score: data.trending_score,
        category: data.category,
        last_updated: data.metadata.last_updated,
      };

      totalMentions += data.metrics.mentions;
      totalEngagement +=
        data.metrics.likes + data.metrics.shares + data.metrics.comments;
      totalSentiment += data.sentiment.overall_score;
      platformCount++;
    });

    comparison.summary.totalMentions = totalMentions;
    comparison.summary.totalEngagement = totalEngagement;
    comparison.summary.avgSentiment =
      platformCount > 0 ? totalSentiment / platformCount : 0;

    // Find best performing platform
    const platforms = Object.entries(comparison.platforms);
    if (platforms.length > 0) {
      comparison.summary.bestPerformingPlatform = platforms.reduce(
        (best, [platform, data]) =>
          data.trending_score > best.trending_score
            ? { platform, ...data }
            : best
      ).platform;
    }

    res.json(comparison);
  } catch (error) {
    console.error("Error comparing hashtag across platforms:", error);
    res.status(500).json({ error: "Failed to compare hashtag data" });
  }
});

module.exports = router;
