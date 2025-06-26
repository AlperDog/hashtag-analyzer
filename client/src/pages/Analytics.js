import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import {
  BarChart3,
  TrendingUp,
  Users,
  MessageCircle,
  PieChart as PieChartIcon,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { analyticsAPI } from "../services/api";

const Analytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState("7");
  const [selectedPlatform, setSelectedPlatform] = useState("all");

  const { data: categoryStats } = useQuery(
    ["categoryStats", selectedPlatform, selectedPeriod],
    () =>
      analyticsAPI.getCategories(
        selectedPlatform === "all" ? undefined : selectedPlatform,
        parseInt(selectedPeriod)
      )
  );

  const { data: platformComparison } = useQuery(
    ["platformComparison", selectedPeriod],
    () => analyticsAPI.getPlatformComparison(parseInt(selectedPeriod))
  );

  const { data: sentimentStats } = useQuery(
    ["sentimentStats", selectedPlatform, selectedPeriod],
    () =>
      analyticsAPI.getSentiment(
        selectedPlatform === "all" ? undefined : selectedPlatform,
        undefined,
        parseInt(selectedPeriod)
      )
  );

  const { data: growthStats } = useQuery(
    ["growthStats", selectedPlatform, selectedPeriod],
    () =>
      analyticsAPI.getGrowth(
        selectedPlatform === "all" ? undefined : selectedPlatform,
        undefined,
        parseInt(selectedPeriod)
      )
  );

  // Sample data for charts (replace with real data)
  const trendData = [
    { name: "Mon", mentions: 1200, engagement: 800, sentiment: 0.6 },
    { name: "Tue", mentions: 1800, engagement: 1200, sentiment: 0.8 },
    { name: "Wed", mentions: 1500, engagement: 1000, sentiment: 0.4 },
    { name: "Thu", mentions: 2200, engagement: 1400, sentiment: 0.9 },
    { name: "Fri", mentions: 2800, engagement: 1800, sentiment: 0.7 },
    { name: "Sat", mentions: 3200, engagement: 2200, sentiment: 0.8 },
    { name: "Sun", mentions: 2600, engagement: 1600, sentiment: 0.6 },
  ];

  const categoryData =
    categoryStats?.categories?.map((cat) => ({
      name: cat._id,
      value: cat.count,
      mentions: cat.totalMentions,
      avgScore: cat.avgTrendingScore,
    })) || [];

  const platformData =
    platformComparison?.platformStats?.map((platform) => ({
      name: platform._id,
      hashtags: platform.hashtagCount,
      mentions: platform.totalMentions,
      engagement: platform.totalEngagement,
      avgScore: platform.avgTrendingScore,
    })) || [];

  const sentimentData =
    sentimentStats?.byCategory?.map((cat) => ({
      name: cat._id,
      positive: cat.positiveCount,
      negative: cat.negativeCount,
      neutral: cat.neutralCount,
      avgScore: cat.avgSentimentScore,
    })) || [];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#8884D8",
    "#82CA9D",
    "#FFC658",
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Analytics</h1>
        <p className="text-dark-400 mt-1">Deep insights and trend analysis</p>
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
              Time Period
            </label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="input-field"
            >
              <option value="1">Last 24 hours</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-dark-400 mb-2">
              Platform
            </label>
            <select
              value={selectedPlatform}
              onChange={(e) => setSelectedPlatform(e.target.value)}
              className="input-field"
            >
              <option value="all">All Platforms</option>
              <option value="twitter">Twitter</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Instagram</option>
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
              <p className="text-sm text-dark-400">Total Hashtags</p>
              <p className="text-2xl font-bold text-white">
                {categoryStats?.categories?.reduce(
                  (sum, cat) => sum + cat.count,
                  0
                ) || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-blue-400/10">
              <BarChart3 className="w-6 h-6 text-blue-400" />
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
              <p className="text-sm text-dark-400">Total Mentions</p>
              <p className="text-2xl font-bold text-white">
                {categoryStats?.categories?.reduce(
                  (sum, cat) => sum + cat.totalMentions,
                  0
                ) || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-400/10">
              <Users className="w-6 h-6 text-green-400" />
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
              <p className="text-sm text-dark-400">Avg Trending Score</p>
              <p className="text-2xl font-bold text-white">
                {categoryStats?.categories?.length > 0
                  ? (
                      categoryStats.categories.reduce(
                        (sum, cat) => sum + cat.avgTrendingScore,
                        0
                      ) / categoryStats.categories.length
                    ).toFixed(1)
                  : "0.0"}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-purple-400/10">
              <TrendingUp className="w-6 h-6 text-purple-400" />
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
              <p className="text-sm text-dark-400">Active Categories</p>
              <p className="text-2xl font-bold text-white">
                {categoryStats?.categories?.length || 0}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-orange-400/10">
              <Activity className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Analysis */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Trend Analysis
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1e293b",
                  border: "1px solid #334155",
                  borderRadius: "8px",
                }}
              />
              <Area
                type="monotone"
                dataKey="mentions"
                stackId="1"
                stroke="#0ea5e9"
                fill="#0ea5e9"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="engagement"
                stackId="2"
                stroke="#d946ef"
                fill="#d946ef"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Category Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
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
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {categoryData.map((category, index) => (
              <div key={category.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span className="text-sm text-dark-300 capitalize">
                  {category.name}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Platform Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Platform Performance
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={platformData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="hashtags" fill="#0ea5e9" />
            <Bar dataKey="mentions" fill="#d946ef" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Sentiment Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Sentiment Analysis by Category
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={sentimentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
            <XAxis dataKey="name" stroke="#64748b" />
            <YAxis stroke="#64748b" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "8px",
              }}
            />
            <Bar dataKey="positive" fill="#10b981" />
            <Bar dataKey="negative" fill="#ef4444" />
            <Bar dataKey="neutral" fill="#6b7280" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Growth Analysis */}
      {growthStats?.fastestGrowing && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Fastest Growing Hashtags
            </h3>
            <div className="space-y-3">
              {growthStats.fastestGrowing.slice(0, 5).map((hashtag, index) => (
                <div
                  key={hashtag.hashtag}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      #{index + 1}
                    </span>
                    <span className="text-white">#{hashtag.hashtag}</span>
                  </div>
                  <span className="text-sm text-green-400">
                    +{hashtag.growthRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-white mb-4">
              Declining Hashtags
            </h3>
            <div className="space-y-3">
              {growthStats.declining.slice(0, 5).map((hashtag, index) => (
                <div
                  key={hashtag.hashtag}
                  className="flex items-center justify-between p-3 bg-dark-700 rounded"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-white">
                      #{index + 1}
                    </span>
                    <span className="text-white">#{hashtag.hashtag}</span>
                  </div>
                  <span className="text-sm text-red-400">
                    {hashtag.growthRate}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default Analytics;
