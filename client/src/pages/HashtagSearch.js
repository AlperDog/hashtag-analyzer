import React, { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "react-query";
import { Search, Hash, TrendingUp, Users, MessageCircle } from "lucide-react";
import { hashtagAPI, socialMediaAPI } from "../services/api";
import toast from "react-hot-toast";

const HashtagSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("all");
  const [isSearching, setIsSearching] = useState(false);

  const { data: searchResults, refetch: refetchSearch } = useQuery(
    ["hashtagSearch", searchQuery, selectedPlatform],
    () =>
      hashtagAPI.search(
        searchQuery,
        selectedPlatform === "all" ? undefined : selectedPlatform
      ),
    {
      enabled: false,
      retry: false,
    }
  );

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a hashtag to search");
      return;
    }

    setIsSearching(true);
    try {
      await refetchSearch();
      toast.success(
        `Found ${searchResults?.data?.length || 0} results for #${searchQuery}`
      );
    } catch (error) {
      toast.error("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleFetchData = async (hashtag) => {
    try {
      toast.loading(`Fetching data for #${hashtag}...`);
      await socialMediaAPI.fetchHashtagData(hashtag);
      toast.success(`Data fetched successfully for #${hashtag}`);
      refetchSearch();
    } catch (error) {
      toast.error(`Failed to fetch data for #${hashtag}`);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Search Hashtags</h1>
        <p className="text-dark-400 mt-1">
          Find and analyze hashtags across all platforms
        </p>
      </div>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-dark-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Enter hashtag (e.g., tech, sports, politics)"
                value={searchQuery}
                onChange={(e) =>
                  setSearchQuery(e.target.value.replace("#", ""))
                }
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="input-field pl-10 w-full"
              />
            </div>
          </div>

          <div className="flex gap-2">
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

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSearch}
              disabled={isSearching}
              className="btn-primary"
            >
              {isSearching ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Search className="w-4 h-4 mr-2" />
                  Search
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Search Results */}
      {searchResults?.data && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results ({searchResults.data.length})
            </h2>
            <p className="text-sm text-dark-400">
              Showing results for #{searchQuery}
            </p>
          </div>

          <div className="grid gap-4">
            {searchResults.data.map((hashtag, index) => (
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
                          categories.find((c) => c.name === hashtag.category)
                            ?.color || "bg-gray-500"
                        } text-white`}
                      >
                        {hashtag.category}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
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

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleFetchData(hashtag.hashtag)}
                      className="btn-secondary text-sm"
                    >
                      Refresh Data
                    </motion.button>
                  </div>
                </div>

                {hashtag.sentiment && (
                  <div className="mt-3 pt-3 border-t border-dark-600">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-400">Sentiment:</span>
                      <div className="flex items-center space-x-2">
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
                        <span className="text-white">
                          ({hashtag.sentiment.overall_score?.toFixed(2) || 0})
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* No Results */}
      {searchResults?.data?.length === 0 && searchQuery && !isSearching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card text-center py-12"
        >
          <Hash className="w-12 h-12 text-dark-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            No results found
          </h3>
          <p className="text-dark-400 mb-4">
            No hashtags found for #{searchQuery} on{" "}
            {selectedPlatform === "all" ? "any platform" : selectedPlatform}
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleFetchData(searchQuery)}
            className="btn-primary"
          >
            Fetch Data for #{searchQuery}
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

export default HashtagSearch;
