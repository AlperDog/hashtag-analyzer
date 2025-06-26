const { google } = require("googleapis");
const natural = require("natural");

class YouTubeService {
  constructor() {
    this.youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    this.tokenizer = new natural.WordTokenizer();
    this.sentiment = new natural.SentimentAnalyzer(
      "English",
      natural.PorterStemmer,
      "afinn"
    );
  }

  async getTrendingVideos(regionCode = "US", maxResults = 50) {
    try {
      const response = await this.youtube.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        chart: "mostPopular",
        regionCode: regionCode,
        maxResults: maxResults,
        videoCategoryId: "0", // All categories
      });

      if (!response.data.items) {
        return [];
      }

      const hashtags = new Map();

      response.data.items.forEach((video) => {
        const description = video.snippet.description || "";
        const title = video.snippet.title || "";
        const tags = video.snippet.tags || [];

        // Extract hashtags from title, description, and tags
        const allText = `${title} ${description} ${tags.join(" ")}`;
        const hashtagMatches = allText.match(/#\w+/g) || [];

        hashtagMatches.forEach((hashtag) => {
          const cleanHashtag = hashtag.replace("#", "").toLowerCase();
          if (cleanHashtag.length > 2) {
            // Filter out very short hashtags
            if (!hashtags.has(cleanHashtag)) {
              hashtags.set(cleanHashtag, {
                hashtag: cleanHashtag,
                videos: [],
                total_views: 0,
                total_likes: 0,
                total_comments: 0,
              });
            }

            const stats = hashtags.get(cleanHashtag);
            const viewCount = parseInt(video.statistics.viewCount) || 0;
            const likeCount = parseInt(video.statistics.likeCount) || 0;
            const commentCount = parseInt(video.statistics.commentCount) || 0;

            stats.videos.push({
              id: video.id,
              title: video.snippet.title,
              channel: video.snippet.channelTitle,
              views: viewCount,
              likes: likeCount,
              comments: commentCount,
              publishedAt: video.snippet.publishedAt,
            });

            stats.total_views += viewCount;
            stats.total_likes += likeCount;
            stats.total_comments += commentCount;
          }
        });
      });

      return Array.from(hashtags.values())
        .filter((hashtag) => hashtag.videos.length > 0)
        .sort((a, b) => b.total_views - a.total_views)
        .slice(0, 20);
    } catch (error) {
      console.error("Error fetching YouTube trending videos:", error);
      return [];
    }
  }

  async getHashtagData(hashtag, maxResults = 50) {
    try {
      const response = await this.youtube.search.list({
        part: ["snippet"],
        q: `#${hashtag}`,
        type: "video",
        order: "relevance",
        maxResults: maxResults,
        publishedAfter: new Date(
          Date.now() - 7 * 24 * 60 * 60 * 1000
        ).toISOString(), // Last 7 days
      });

      if (!response.data.items || response.data.items.length === 0) {
        return null;
      }

      const videoIds = response.data.items.map((item) => item.id.videoId);

      // Get detailed video statistics
      const videoDetails = await this.youtube.videos.list({
        part: ["snippet", "statistics", "contentDetails"],
        id: videoIds,
      });

      if (!videoDetails.data.items) {
        return null;
      }

      const processedVideos = videoDetails.data.items.map((video) => {
        const sentiment = this.analyzeSentiment(
          video.snippet.title + " " + video.snippet.description
        );

        return {
          id: video.id,
          title: video.snippet.title,
          description: video.snippet.description,
          channel: video.snippet.channelTitle,
          publishedAt: video.snippet.publishedAt,
          metrics: {
            views: parseInt(video.statistics.viewCount) || 0,
            likes: parseInt(video.statistics.likeCount) || 0,
            comments: parseInt(video.statistics.commentCount) || 0,
          },
          sentiment: sentiment,
          duration: video.contentDetails.duration,
        };
      });

      const totalMentions = processedVideos.length;
      const totalViews = processedVideos.reduce(
        (sum, video) => sum + video.metrics.views,
        0
      );
      const totalLikes = processedVideos.reduce(
        (sum, video) => sum + video.metrics.likes,
        0
      );
      const totalComments = processedVideos.reduce(
        (sum, video) => sum + video.metrics.comments,
        0
      );

      const avgSentiment =
        processedVideos.reduce((sum, video) => sum + video.sentiment.score, 0) /
        totalMentions;

      const topPosts = processedVideos
        .sort(
          (a, b) =>
            b.metrics.views +
            b.metrics.likes -
            (a.metrics.views + a.metrics.likes)
        )
        .slice(0, 5)
        .map((video) => ({
          platform: "youtube",
          post_id: video.id,
          content: video.title,
          author: video.channel,
          engagement:
            video.metrics.views + video.metrics.likes + video.metrics.comments,
          timestamp: new Date(video.publishedAt),
        }));

      return {
        hashtag: hashtag.toLowerCase(),
        platform: "youtube",
        metrics: {
          mentions: totalMentions,
          views: totalViews,
          likes: totalLikes,
          comments: totalComments,
          engagement_rate:
            totalMentions > 0
              ? (totalLikes + totalComments) / totalMentions
              : 0,
        },
        sentiment: {
          positive: processedVideos.filter((v) => v.sentiment.score > 0).length,
          negative: processedVideos.filter((v) => v.sentiment.score < 0).length,
          neutral: processedVideos.filter((v) => v.sentiment.score === 0)
            .length,
          overall_score: avgSentiment,
        },
        top_posts: topPosts,
        time_series: [
          {
            timestamp: new Date(),
            mentions: totalMentions,
            engagement: totalViews + totalLikes + totalComments,
            sentiment_score: avgSentiment,
          },
        ],
      };
    } catch (error) {
      console.error(
        `Error fetching YouTube data for hashtag #${hashtag}:`,
        error
      );
      return null;
    }
  }

  analyzeSentiment(text) {
    try {
      const tokens = this.tokenizer.tokenize(text.toLowerCase());
      const score = this.sentiment.getSentiment(tokens);

      return {
        score: score,
        comparative: score / tokens.length,
        tokens: tokens.length,
      };
    } catch (error) {
      return { score: 0, comparative: 0, tokens: 0 };
    }
  }

  categorizeHashtag(hashtag, text = "") {
    const keywords = {
      politics: [
        "politics",
        "election",
        "vote",
        "government",
        "president",
        "congress",
        "democrat",
        "republican",
      ],
      sports: [
        "sports",
        "football",
        "basketball",
        "soccer",
        "baseball",
        "tennis",
        "olympics",
        "championship",
      ],
      entertainment: [
        "movie",
        "music",
        "celebrity",
        "actor",
        "singer",
        "film",
        "tv",
        "show",
        "award",
      ],
      technology: [
        "tech",
        "ai",
        "software",
        "app",
        "startup",
        "coding",
        "programming",
        "innovation",
      ],
      business: [
        "business",
        "economy",
        "stock",
        "market",
        "finance",
        "investment",
        "company",
      ],
      health: [
        "health",
        "medical",
        "covid",
        "vaccine",
        "doctor",
        "hospital",
        "wellness",
      ],
      education: [
        "education",
        "school",
        "university",
        "student",
        "learning",
        "academic",
      ],
      lifestyle: [
        "fashion",
        "food",
        "travel",
        "fitness",
        "beauty",
        "lifestyle",
        "wellness",
      ],
      news: ["news", "breaking", "update", "report", "announcement"],
    };

    const combinedText = `${hashtag} ${text}`.toLowerCase();

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some((word) => combinedText.includes(word))) {
        return category;
      }
    }

    return "other";
  }
}

module.exports = new YouTubeService();
