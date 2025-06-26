import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import {
  Hash,
  TrendingUp,
  Users,
  MessageCircle,
  Heart,
  Share2,
  Eye,
  Calendar,
  Globe,
  BarChart3,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { hashtagAPI, analyticsAPI, socialMediaAPI } from "../services/api";
import toast from "react-hot-toast";

const HashtagDetail = () => {
  const { hashtag } = useParams();
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const { data: hashtagData, isLoading } = useQuery(
    ["hashtagDetail", hashtag, selectedPlatform],
    () =>
      hashtagAPI.getHashtag(
        hashtag,
        selectedPlatform === "all" ? undefined : selectedPlatform
      )
  );

  const { data: timeSeriesData } = useQuery(
    ["hashtagTimeSeries", hashtag, selectedPlatform],
    () =>
      hashtagAPI.getTimeSeries(
        hashtag,
        selectedPlatform === "all" ? undefined : selectedPlatform,
        30
      )
  );

  const { data: trendAnalysis } = useQuery(
    ["hashtagTrends", hashtag, selectedPlatform],
    () =>
      analyticsAPI.getTrends(
        hashtag,
        selectedPlatform === "all" ? undefined : selectedPlatform,
        30
      )
  );

  const { data: predictions } = useQuery(
    ["hashtagPredictions", hashtag, selectedPlatform],
    () =>
      analyticsAPI.getPredictions(
        hashtag,
        selectedPlatform === "all" ? undefined : selectedPlatform
      )
  );

  const { data: platformComparison } = useQuery(
    ["hashtagComparison", hashtag],
    () => socialMediaAPI.comparePlatforms(hashtag)
  );

  const handleFetchData = async () => {
    try {
      toast.loading(`Fetching fresh data for #${hashtag}...`);
      await socialMediaAPI.fetchHashtagData(hashtag);
      toast.success(`Data updated for #${hashtag}`);
    } catch (error) {
      toast.error(`Failed to update data for #${hashtag}`);
    }
  };

  const platforms = [
    { id: "all", name: "All Platforms", color: "bg-gray-500" },
    { id: "twitter", name: "Twitter", color: "bg-blue-500" },
    { id: "youtube", name: "YouTube", color: "bg-red-500" },
    { id: "instagram", name: "Instagram", color: "bg-pink-500" },
  ];

  const categories = [
    { name: "politics", color: "bg-red-600" },
    { name: "sports", color: "bg-green-600" },
    { name: "entertainment", color: "bg-purple-600" },
    { name: "technology", color: "bg-blue-600" },
    { name: "business", color: "bg-yellow-600" },
    { name: "health", color: "bg-pink-600" },
    { name: "education", color: "bg-indigo-600" },
    { name: "lifestyle", color: "bg-orange-600" },
    { name: "news", color: "bg-gray-600" },
    { name: "other", color: "bg-gray-500" },
  ];

  const sentimentData = hashtagData?.data?.[0]?.sentiment
    ? [
        {
          name: "Positive",
          value: hashtagData.data[0].sentiment.positive,
          color: "#10b981",
        },
        {
          name: "Negative",
          value: hashtagData.data[0].sentiment.negative,
          color: "#ef4444",
        },
        {
          name: "Neutral",
          value: hashtagData.data[0].sentiment.neutral,
          color: "#6b7280",
        },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!hashtagData?.data || hashtagData.data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Hash className="w-16 h-16 text-dark-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            Hashtag Not Found
          </h2>
          <p className="text-dark-400 mb-4">No data found for #{hashtag}</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleFetchData}
            className="btn-primary"
          >
            Fetch Data for #{hashtag}
          </motion.button>
        </div>
      </div>
    );
  }

  const currentData = hashtagData.data[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">#{hashtag}</h1>
          <p className="text-dark-400 mt-1">Detailed analysis and insights</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFetchData}
          className="btn-primary"
        >
          <Globe className="w-4 h-4 mr-2" />
          Refresh Data
        </motion.button>
      </div>

      {/* Platform Filter */}
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
        </div>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Total Mentions</p>
              <p className="text-2xl font-bold text-white">
                {currentData.metrics?.mentions || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-400/10">
              <Users className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Trending Score</p>
              <p className="text-2xl font-bold text-white">
                {currentData.trending_score?.toFixed(1) || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-400/10">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Engagement Rate</p>
              <p className="text-2xl font-bold text-white">
                {currentData.metrics?.engagement_rate?.toFixed(2) || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-400/10">
              <Heart className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-dark-400">Category</p>
              <p className="text-2xl font-bold text-white capitalize">
                {currentData.category || "Unknown"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-400/10">
              <BarChart3 className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Time Series Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Performance Over Time
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timeSeriesData?.data?.timeSeries || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis
                dataKey="timestamp"
                stroke="#64748b"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
                labelFormatter={(value) => new Date(value).toLocaleString()}
              />
              <Line
                type="monotone"
                dataKey="mentions"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: "#0ea5e9", strokeWidth: 2, r: 4 }}
              />
              <Line
                type="monotone"
                dataKey="engagement"
                stroke="#d946ef"
                strokeWidth={2}
                dot={{ fill: "#d946ef", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sentiment Analysis */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Sentiment Analysis
          </h3>
          {sentimentData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {sentimentData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#1e293b",
                      border: "1px solid #334155",
                      borderRadius: "8px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center space-x-4 mt-4">
                {sentimentData.map((sentiment) => (
                  <div key={sentiment.name} className="flex items-center">
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: sentiment.color }}
                    ></div>
                    <span className="text-sm text-dark-300">
                      {sentiment.name}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-48">
              <p className="text-dark-400">No sentiment data available</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Trend Analysis */}
      {trendAnalysis?.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Trend Analysis
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400">Trend Direction</p>
              <p className="text-lg font-semibold text-white capitalize">
                {trendAnalysis.data.analysis?.trend || "stable"}
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400">Growth Rate</p>
              <p className="text-lg font-semibold text-white">
                {trendAnalysis.data.analysis?.growthRate || 0}%
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400">Peak Mentions</p>
              <p className="text-lg font-semibold text-white">
                {trendAnalysis.data.analysis?.peak || 0}
              </p>
            </div>
            <div className="p-4 bg-dark-700 rounded-lg">
              <p className="text-sm text-dark-400">Average Mentions</p>
              <p className="text-lg font-semibold text-white">
                {trendAnalysis.data.analysis?.average || 0}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Predictions */}
      {predictions?.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Predictions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-dark-700 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">
                Next 24 Hours
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-400">Predicted Mentions:</span>
                  <span className="text-white font-semibold">
                    {predictions.data.predictions?.next_24h
                      ?.mentions_prediction || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Confidence:</span>
                  <span className="text-white font-semibold">
                    {(
                      (predictions.data.predictions?.next_24h?.confidence ||
                        0) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
            <div className="p-6 bg-dark-700 rounded-lg">
              <h4 className="text-lg font-semibold text-white mb-2">
                Next Week
              </h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-dark-400">Predicted Mentions:</span>
                  <span className="text-white font-semibold">
                    {predictions.data.predictions?.next_week
                      ?.mentions_prediction || 0}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">Confidence:</span>
                  <span className="text-white font-semibold">
                    {(
                      (predictions.data.predictions?.next_week?.confidence ||
                        0) * 100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Platform Comparison */}
      {platformComparison?.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Cross-Platform Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(platformComparison.data.platforms || {}).map(
              ([platform, data]) => (
                <div key={platform} className="p-4 bg-dark-700 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-semibold capitalize">
                      {platform}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs ${
                        platforms.find((p) => p.id === platform)?.color ||
                        "bg-gray-500"
                      } text-white`}
                    >
                      {platform}
                    </span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-dark-400">Mentions:</span>
                      <span className="text-white">{data.mentions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Engagement:</span>
                      <span className="text-white">{data.engagement}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-dark-400">Score:</span>
                      <span className="text-white">
                        {data.trending_score?.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </motion.div>
      )}

      {/* Top Posts */}
      {currentData.top_posts && currentData.top_posts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">Top Posts</h3>
          <div className="space-y-3">
            {currentData.top_posts.slice(0, 5).map((post, index) => (
              <div key={post.post_id} className="p-4 bg-dark-700 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      #{index + 1}
                    </span>
                    <span className="text-white font-medium">
                      {post.author}
                    </span>
                  </div>
                  <span className="text-sm text-dark-400">
                    {new Date(post.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-dark-300 text-sm mb-2">{post.content}</p>
                <div className="flex items-center space-x-4 text-sm">
                  <span className="text-dark-400">
                    Engagement: {post.engagement}
                  </span>
                  <span className="text-dark-400 capitalize">
                    {post.platform}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default HashtagDetail;
