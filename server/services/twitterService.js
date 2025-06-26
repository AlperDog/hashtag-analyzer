const { TwitterApi } = require("twitter-api-v2");
const natural = require("natural");
const compromise = require("compromise");

class TwitterService {
  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY,
      appSecret: process.env.TWITTER_API_SECRET,
      bearerToken: process.env.TWITTER_BEARER_TOKEN,
    });

    this.tokenizer = new natural.WordTokenizer();
    this.sentiment = new natural.SentimentAnalyzer(
      "English",
      natural.PorterStemmer,
      "afinn"
    );
  }

  async getTrendingHashtags(woeid = 1) {
    try {
      // Get trending topics for a specific location (1 = worldwide)
      const trends = await this.client.v2.trendingTopics(woeid);

      if (!trends.data) {
        console.log("No trending topics found");
        return [];
      }

      const hashtags = trends.data
        .filter((trend) => trend.name.startsWith("#"))
        .map((trend) => ({
          hashtag: trend.name.replace("#", "").toLowerCase(),
          tweet_volume: trend.tweet_volume || 0,
          url: trend.url,
        }))
        .filter((hashtag) => hashtag.tweet_volume > 0)
        .sort((a, b) => b.tweet_volume - a.tweet_volume)
        .slice(0, 20);

      return hashtags;
    } catch (error) {
      console.error("Error fetching Twitter trends:", error);
      return [];
    }
  }

  async getHashtagData(hashtag, count = 100) {
    try {
      const query = `#${hashtag} -is:retweet lang:en`;
      const tweets = await this.client.v2.search(query, {
        "tweet.fields": [
          "created_at",
          "public_metrics",
          "author_id",
          "lang",
          "geo",
        ],
        "user.fields": ["username", "location"],
        expansions: ["author_id"],
        max_results: count,
      });

      if (!tweets.data || tweets.data.length === 0) {
        return null;
      }

      const users = tweets.includes?.users || [];
      const userMap = users.reduce((map, user) => {
        map[user.id] = user;
        return map;
      }, {});

      const processedTweets = tweets.data.map((tweet) => {
        const user = userMap[tweet.author_id];
        const sentiment = this.analyzeSentiment(tweet.text);

        return {
          id: tweet.id,
          text: tweet.text,
          author: user ? user.username : "unknown",
          location: user ? user.location : null,
          created_at: tweet.created_at,
          metrics: {
            retweets: tweet.public_metrics.retweet_count,
            likes: tweet.public_metrics.like_count,
            replies: tweet.public_metrics.reply_count,
            quotes: tweet.public_metrics.quote_count,
          },
          sentiment: sentiment,
          language: tweet.lang,
        };
      });

      const totalMentions = processedTweets.length;
      const totalEngagement = processedTweets.reduce(
        (sum, tweet) =>
          sum +
          tweet.metrics.likes +
          tweet.metrics.retweets +
          tweet.metrics.replies,
        0
      );

      const avgSentiment =
        processedTweets.reduce((sum, tweet) => sum + tweet.sentiment.score, 0) /
        totalMentions;

      const locations = processedTweets
        .filter((tweet) => tweet.location)
        .map((tweet) => tweet.location);

      const topPosts = processedTweets
        .sort(
          (a, b) =>
            b.metrics.likes +
            b.metrics.retweets -
            (a.metrics.likes + a.metrics.retweets)
        )
        .slice(0, 5)
        .map((tweet) => ({
          platform: "twitter",
          post_id: tweet.id,
          content: tweet.text,
          author: tweet.author,
          engagement:
            tweet.metrics.likes +
            tweet.metrics.retweets +
            tweet.metrics.replies,
          timestamp: new Date(tweet.created_at),
        }));

      return {
        hashtag: hashtag.toLowerCase(),
        platform: "twitter",
        metrics: {
          mentions: totalMentions,
          likes: processedTweets.reduce((sum, t) => sum + t.metrics.likes, 0),
          shares: processedTweets.reduce(
            (sum, t) => sum + t.metrics.retweets,
            0
          ),
          comments: processedTweets.reduce(
            (sum, t) => sum + t.metrics.replies,
            0
          ),
          engagement_rate:
            totalMentions > 0 ? totalEngagement / totalMentions : 0,
        },
        sentiment: {
          positive: processedTweets.filter((t) => t.sentiment.score > 0).length,
          negative: processedTweets.filter((t) => t.sentiment.score < 0).length,
          neutral: processedTweets.filter((t) => t.sentiment.score === 0)
            .length,
          overall_score: avgSentiment,
        },
        location_data: {
          countries: this.extractCountries(locations),
          cities: this.extractCities(locations),
          languages: [...new Set(processedTweets.map((t) => t.language))],
        },
        top_posts: topPosts,
        time_series: [
          {
            timestamp: new Date(),
            mentions: totalMentions,
            engagement: totalEngagement,
            sentiment_score: avgSentiment,
          },
        ],
      };
    } catch (error) {
      console.error(`Error fetching data for hashtag #${hashtag}:`, error);
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

  extractCountries(locations) {
    const countries = [];
    locations.forEach((location) => {
      if (location) {
        const doc = compromise(location);
        const places = doc.places().out("array");
        countries.push(...places);
      }
    });
    return [...new Set(countries)].slice(0, 10);
  }

  extractCities(locations) {
    const cities = [];
    locations.forEach((location) => {
      if (location) {
        const doc = compromise(location);
        const places = doc.places().out("array");
        cities.push(...places);
      }
    });
    return [...new Set(cities)].slice(0, 10);
  }
}

module.exports = new TwitterService();
