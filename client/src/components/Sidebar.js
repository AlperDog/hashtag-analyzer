import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  TrendingUp,
  BarChart3,
  Hash,
  Activity,
  Users,
  Globe,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Search Hashtags", href: "/search", icon: Search },
    { name: "Trending", href: "/trending", icon: TrendingUp },
    { name: "Analytics", href: "/analytics", icon: BarChart3 },
  ];

  const quickStats = [
    {
      name: "Total Hashtags",
      value: "2,847",
      icon: Hash,
      color: "text-blue-400",
    },
    {
      name: "Active Trends",
      value: "156",
      icon: Activity,
      color: "text-green-400",
    },
    {
      name: "Total Mentions",
      value: "1.2M",
      icon: Users,
      color: "text-purple-400",
    },
    { name: "Platforms", value: "3", icon: Globe, color: "text-orange-400" },
  ];

  return (
    <div className="fixed left-0 top-16 h-full w-64 bg-dark-800 border-r border-dark-700 overflow-y-auto">
      <div className="p-6">
        {/* Navigation */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">
            Navigation
          </h3>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive
                      ? "bg-primary-600 text-white"
                      : "text-dark-300 hover:text-white hover:bg-dark-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Quick Stats */}
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">
            Quick Stats
          </h3>
          <div className="space-y-3">
            {quickStats.map((stat) => (
              <motion.div
                key={stat.name}
                whileHover={{ scale: 1.02 }}
                className="flex items-center justify-between p-3 bg-dark-700 rounded-lg"
              >
                <div className="flex items-center">
                  <stat.icon className={`w-5 h-5 mr-3 ${stat.color}`} />
                  <span className="text-sm text-dark-300">{stat.name}</span>
                </div>
                <span className="text-sm font-semibold text-white">
                  {stat.value}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Platform Status */}
        <div>
          <h3 className="text-sm font-semibold text-dark-400 uppercase tracking-wider mb-4">
            Platform Status
          </h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-dark-300">Twitter</span>
              </div>
              <span className="text-xs text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                <span className="text-sm text-dark-300">YouTube</span>
              </div>
              <span className="text-xs text-green-400">Online</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-yellow-400 rounded-full mr-2"></div>
                <span className="text-sm text-dark-300">Instagram</span>
              </div>
              <span className="text-xs text-yellow-400">Limited</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
