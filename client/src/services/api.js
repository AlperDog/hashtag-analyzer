import axios from "axios";
import toast from "react-hot-toast";

// Create axios instance
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://localhost:5000",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add loading indicator for long requests
    if (config.timeout > 5000) {
      toast.loading("Loading data...", { id: "loading" });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Dismiss loading toast
    toast.dismiss("loading");
    return response;
  },
  (error) => {
    // Dismiss loading toast
    toast.dismiss("loading");

    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      switch (status) {
        case 400:
          toast.error(data.error || "Bad request");
          break;
        case 401:
          toast.error("Unauthorized access");
          break;
        case 403:
          toast.error("Access forbidden");
          break;
        case 404:
          toast.error(data.error || "Resource not found");
          break;
        case 429:
          toast.error("Too many requests. Please try again later.");
          break;
        case 500:
          toast.error("Server error. Please try again later.");
          break;
        default:
          toast.error(data.error || "An error occurred");
      }
    } else if (error.request) {
      // Network error
      toast.error("Network error. Please check your connection.");
    } else {
      // Other error
      toast.error("An unexpected error occurred");
    }

    return Promise.reject(error);
  }
);

// API methods
export const hashtagAPI = {
  // Get all hashtags
  getHashtags: (params = {}) => api.get("/api/hashtags", { params }),

  // Get trending hashtags
  getTrending: (platform, limit = 20) =>
    api.get("/api/hashtags/trending", { params: { platform, limit } }),

  // Get hashtag by category
  getByCategory: (category, platform) =>
    api.get(`/api/hashtags/category/${category}`, { params: { platform } }),

  // Get specific hashtag
  getHashtag: (hashtag, platform) =>
    api.get(`/api/hashtags/${hashtag}`, { params: { platform } }),

  // Get hashtag time series
  getTimeSeries: (hashtag, platform, days = 7) =>
    api.get(`/api/hashtags/${hashtag}/timeseries`, {
      params: { platform, days },
    }),

  // Search hashtags
  search: (query, platform, limit = 20) =>
    api.get(`/api/hashtags/search/${query}`, { params: { platform, limit } }),

  // Get statistics
  getStats: () => api.get("/api/hashtags/stats/overview"),
};

export const socialMediaAPI = {
  // Get Twitter trending
  getTwitterTrending: (woeid = 1) =>
    api.get("/api/social-media/twitter/trending", { params: { woeid } }),

  // Get YouTube trending
  getYouTubeTrending: (regionCode = "US", maxResults = 50) =>
    api.get("/api/social-media/youtube/trending", {
      params: { regionCode, maxResults },
    }),

  // Get Twitter hashtag data
  getTwitterData: (hashtag, count = 100) =>
    api.get(`/api/social-media/twitter/${hashtag}`, { params: { count } }),

  // Get YouTube hashtag data
  getYouTubeData: (hashtag, maxResults = 50) =>
    api.get(`/api/social-media/youtube/${hashtag}`, { params: { maxResults } }),

  // Fetch and store hashtag data
  fetchHashtagData: (hashtag, platforms = ["twitter", "youtube"]) =>
    api.post(`/api/social-media/fetch/${hashtag}`, { platforms }),

  // Compare hashtag across platforms
  comparePlatforms: (hashtag) =>
    api.get(`/api/social-media/compare/${hashtag}`),
};

export const analyticsAPI = {
  // Get trend analysis
  getTrends: (hashtag, platform, days = 30) =>
    api.get(`/api/analytics/trends/${hashtag}`, { params: { platform, days } }),

  // Get predictions
  getPredictions: (hashtag, platform) =>
    api.get(`/api/analytics/predictions/${hashtag}`, { params: { platform } }),

  // Get category analysis
  getCategories: (platform, days = 7) =>
    api.get("/api/analytics/categories", { params: { platform, days } }),

  // Get platform comparison
  getPlatformComparison: (days = 7) =>
    api.get("/api/analytics/platforms/comparison", { params: { days } }),

  // Get sentiment analysis
  getSentiment: (platform, category, days = 7) =>
    api.get("/api/analytics/sentiment", {
      params: { platform, category, days },
    }),

  // Get growth analysis
  getGrowth: (platform, category, days = 30) =>
    api.get("/api/analytics/growth", { params: { platform, category, days } }),
};

// Health check
export const healthCheck = () => api.get("/api/health");

export { api };
