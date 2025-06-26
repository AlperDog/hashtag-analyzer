import React from "react";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import {
  TrendingUp,
  Users,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Hash,
  Globe,
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
import { api } from "../services/api";

const Dashboard = () => {
  // Fetch dashboard data
  const { data: stats, isLoading: statsLoading } = useQuery(
    "dashboardStats",
    () => api.get("/api/hashtags/stats/overview")
  );

  const { data: trending, isLoading: trendingLoading } = useQuery(
    "trendingHashtags",
    () => api.get("/api/hashtags/trending?limit=5")
  );

  const { data: categoryStats, isLoading: categoryLoading } = useQuery(
    "categoryStats",
    () => api.get("/api/analytics/categories?days=7")
  );

  // Sample data for charts (replace with real data)
  const trendData = [
    { name: "Mon", mentions: 1200, engagement: 800 },
    { name: "Tue", mentions: 1800, engagement: 1200 },
    { name: "Wed", mentions: 1500, engagement: 1000 },
    { name: "Thu", mentions: 2200, engagement: 1400 },
    { name: "Fri", mentions: 2800, engagement: 1800 },
    { name: "Sat", mentions: 3200, engagement: 2200 },
    { name: "Sun", mentions: 2600, engagement: 1600 },
  ];

  const platformData = [
    { name: "Twitter", value: 45, color: "#1DA1F2" },
    { name: "YouTube", value: 35, color: "#FF0000" },
    { name: "Instagram", value: 20, color: "#E4405F" },
  ];

  const statsCards = [
    {
      title: "Total Hashtags",
      value: stats?.overview?.totalHashtags || "2,847",
      change: "+12.5%",
      changeType: "positive",
      icon: Hash,
      color: "text-blue-400",
      bgColor: "bg-blue-400/10",
    },
    {
      title: "Total Mentions",
      value: stats?.overview?.totalMentions
        ? `${(stats.overview.totalMentions / 1000000).toFixed(1)}M`
        : "1.2M",
      change: "+8.3%",
      changeType: "positive",
      icon: Users,
      color: "text-green-400",
      bgColor: "bg-green-400/10",
    },
    {
      title: "Active Trends",
      value: "156",
      change: "+5.2%",
      changeType: "positive",
      icon: Activity,
      color: "text-purple-400",
      bgColor: "bg-purple-400/10",
    },
    {
      title: "Avg Trending Score",
      value: stats?.overview?.avgTrendingScore
        ? stats.overview.avgTrendingScore.toFixed(1)
        : "7.8",
      change: "+2.1%",
      changeType: "positive",
      icon: TrendingUp,
      color: "text-orange-400",
      bgColor: "bg-orange-400/10",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-400 mt-1">
            Real-time hashtag analytics and insights
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="btn-primary"
        >
          <Globe className="w-4 h-4 mr-2" />
          Refresh Data
        </motion.button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-dark-400">{card.title}</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {card.value}
                </p>
                <div className="flex items-center mt-2">
                  {card.changeType === "positive" ? (
                    <ArrowUpRight className="w-4 h-4 text-green-400 mr-1" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4 text-red-400 mr-1" />
                  )}
                  <span
                    className={`text-sm ${
                      card.changeType === "positive"
                        ? "text-green-400"
                        : "text-red-400"
                    }`}
                  >
                    {card.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${card.bgColor}`}>
                <card.icon className={`w-6 h-6 ${card.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Trend Chart */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Trending Activity
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData}>
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

        {/* Platform Distribution */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-white mb-4">
            Platform Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={platformData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {platformData.map((entry, index) => (
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
            {platformData.map((platform) => (
              <div key={platform.name} className="flex items-center">
                <div
                  className="w-3 h-3 rounded-full mr-2"
                  style={{ backgroundColor: platform.color }}
                ></div>
                <span className="text-sm text-dark-300">{platform.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Trending Hashtags
        </h3>
        {trendingLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {trending?.data?.slice(0, 5).map((hashtag, index) => (
              <div
                key={hashtag.hashtag}
                className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center">
                  <span className="text-sm font-medium text-white mr-3">
                    #{index + 1}
                  </span>
                  <div>
                    <p className="text-white font-medium">#{hashtag.hashtag}</p>
                    <p className="text-sm text-dark-400">{hashtag.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-white">
                    {hashtag.metrics?.mentions || 0} mentions
                  </p>
                  <p className="text-xs text-dark-400">{hashtag.platform}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Dashboard;
