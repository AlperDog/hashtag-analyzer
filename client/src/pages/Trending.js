import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import {
  TrendingUp,
  Hash,
  Users,
  MessageCircle,
  RefreshCw,
} from "lucide-react";
import { hashtagAPI, socialMediaAPI } from "../services/api";
import toast from "react-hot-toast";

const Trending = () => {
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const {
    data: trendingData,
    isLoading,
    refetch,
  } = useQuery(
    ["trending", selectedPlatform],
    () =>
      hashtagAPI.getTrending(
        selectedPlatform === "all" ? undefined : selectedPlatform,
        20
      ),
    {
      refetchInterval: 300000, // Refetch every 5 minutes
    }
  );

  const { data: twitterTrending } = useQuery(
    "twitterTrending",
    () => socialMediaAPI.getTwitterTrending(),
    {
      refetchInterval: 600000, // Refetch every 10 minutes
    }
  );

  const { data: youtubeTrending } = useQuery(
    "youtubeTrending",
    () => socialMediaAPI.getYouTubeTrending(),
    {
      refetchInterval: 600000, // Refetch every 10 minutes
    }
  );

  const handleRefresh = async () => {
    try {
      await refetch();
      toast.success("Trending data refreshed!");
    } catch (error) {
      toast.error("Failed to refresh data");
    }
  };

  const platforms = [
    { id: "all", name: "All Platforms", color: "bg-gray-500" },
    { id: "twitter", name: "Twitter", color: "bg-blue-500" },
    { id: "youtube", name: "YouTube", color: "bg-red-500" },
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
  ];

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "politics", name: "Politics", color: "bg-red-600" },
    { id: "sports", name: "Sports", color: "bg-green-600" },
    { id: "entertainment", name: "Entertainment", color: "bg-purple-600" },
    { id: "technology", name: "Technology", color: "bg-blue-600" },
    { id: "business", name: "Business", color: "bg-yellow-600" },
    { id: "health", name: "Health", color: "bg-pink-600" },
    { id: "education", name: "Education", color: "bg-indigo-600" },
    { id: "lifestyle", name: "Lifestyle", color: "bg-orange-600" },
    { id: "news", name: "News", color: "bg-gray-600" },
  ];

  const filteredData =
    trendingData?.data?.filter((hashtag) => {
      if (selectedCategory !== "all" && hashtag.category !== selectedCategory) {
        return false;
      }
      return true;
    }) || [];

  const getTrendIcon = (trendingScore) => {
    if (trendingScore > 8) return "🔥";
    if (trendingScore > 6) return "⚡";
    if (trendingScore > 4) return "📈";
    return "📊";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trending Hashtags</h1>
          <p className="text-dark-400 mt-1">
            Real-time trending hashtags across all platforms
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleRefresh}
          disabled={isLoading}
          className="btn-primary"
        >
          <RefreshCw
            className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
          />
          Refresh
        </motion.button>
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-field"
            >
              {platforms.map((platform) => (
                <option key={platform.id} value={platform.id}>
                  {platform.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Category
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="input-field"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </motion.div>

      {/* Trending Hashtags */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Trending Now ({filteredData.length})
          </h2>
          <p className="text-sm text-dark-400">
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </div>

        {isLoading ? (
          <div className="card text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-dark-400">Loading trending hashtags...</p>
          </div>
        ) : filteredData.length > 0 ? (
          <div className="grid gap-4">
            {filteredData.map((hashtag, index) => (
              <motion.div
                key={`${hashtag.hashtag}-${hashtag.platform}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="card hover:bg-dark-700 transition-colors duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl">
                        {getTrendIcon(hashtag.trending_score)}
                      </span>
                      <span className="text-sm font-medium text-white bg-primary-600 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Hash className="w-5 h-5 text-primary-400" />
                      <span className="text-lg font-semibold text-white">
                        #{hashtag.hashtag}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          platforms.find((p) => p.id === hashtag.platform)
                            ?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {hashtag.platform}
                      </span>

                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          categories.find((c) => c.id === hashtag.category)
                            ?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {hashtag.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white">
                            {hashtag.metrics?.mentions || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4 text-green-400" />
                          <span className="text-white">
                            {hashtag.trending_score?.toFixed(1) || 0}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4 text-purple-400" />
                          <span className="text-white">
                            {hashtag.metrics?.comments || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {hashtag.sentiment && (
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">Sentiment Analysis:</span>
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <span className="text-green-400">
                            Positive: {hashtag.sentiment.positive}
                          </span>
                          <span className="text-red-400">
                            Negative: {hashtag.sentiment.negative}
                          </span>
                          <span className="text-gray-400">
                            Neutral: {hashtag.sentiment.neutral}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            hashtag.sentiment.overall_score > 0
                              ? "bg-green-600"
                              : hashtag.sentiment.overall_score < 0
                              ? "bg-red-600"
                              : "bg-gray-600"
                          }`}
                        >
                          {hashtag.sentiment.overall_score > 0
                            ? "Positive"
                            : hashtag.sentiment.overall_score < 0
                            ? "Negative"
                            : "Neutral"}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="card text-center py-12"
          >
            <TrendingUp className="w-12 h-12 text-dark-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              No trending hashtags found
            </h3>
            <p className="text-dark-400">
              No trending hashtags match your current filters
            </p>
          </motion.div>
        )}
      </div>

      {/* Platform-specific trending */}
      {(selectedPlatform === "all" || selectedPlatform === "twitter") &&
        twitterTrending?.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              Twitter Trending
            </h3>
            <div className="grid gap-2">
              {twitterTrending.data.hashtags
                ?.slice(0, 5)
                .map((hashtag, index) => (
                  <div
                    key={hashtag.hashtag}
                    className="flex items-center justify-between p-2 bg-dark-700 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        #{index + 1}
                      </span>
                      <span className="text-white">#{hashtag.hashtag}</span>
                    </div>
                    <span className="text-sm text-dark-400">
                      {hashtag.tweet_volume} tweets
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}

      {(selectedPlatform === "all" || selectedPlatform === "youtube") &&
        youtubeTrending?.data && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">
              YouTube Trending
            </h3>
            <div className="grid gap-2">
              {youtubeTrending.data.hashtags
                ?.slice(0, 5)
                .map((hashtag, index) => (
                  <div
                    key={hashtag.hashtag}
                    className="flex items-center justify-between p-2 bg-dark-700 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-white">
                        #{index + 1}
                      </span>
                      <span className="text-white">#{hashtag.hashtag}</span>
                    </div>
                    <span className="text-sm text-dark-400">
                      {hashtag.total_views} views
                    </span>
                  </div>
                ))}
            </div>
          </motion.div>
        )}
    </div>
  );
};

export default Trending;
