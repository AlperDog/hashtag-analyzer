# Social Media Hashtag Trend Analyzer

A fullstack web application that analyzes trending hashtags across multiple social media platforms (Twitter, YouTube, Instagram) in real-time. Built with Node.js, Express, MongoDB, React, and modern web technologies.

## 🚀 Features

### Real-time Data Collection

- **Twitter Integration**: Fetches trending hashtags and post data using Twitter API v2
- **YouTube Integration**: Analyzes trending videos and extracts hashtags from titles/descriptions
- **Instagram Integration**: Ready for Instagram API integration
- **Real-time Updates**: Automatic data refresh and trend monitoring

### Advanced Analytics

- **Trend Analysis**: Track hashtag performance over time with detailed metrics
- **Sentiment Analysis**: Analyze public sentiment using natural language processing
- **Predictions**: AI-powered predictions for hashtag performance (24h and 1 week)
- **Category Classification**: Automatic categorization (politics, sports, entertainment, etc.)
- **Cross-platform Comparison**: Compare hashtag performance across different platforms

### Data Visualization

- **Interactive Charts**: Line charts, pie charts, and bar charts using Recharts
- **Real-time Dashboards**: Live updates with trending hashtags and metrics
- **Time Series Analysis**: Historical data visualization and trend patterns
- **Platform Distribution**: Visual breakdown of hashtag distribution across platforms

### Modern UI/UX

- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Dark Theme**: Modern dark interface with smooth animations
- **Real-time Updates**: Live data refresh with loading states
- **Search & Filter**: Advanced search and filtering capabilities

## 🛠️ Tech Stack

### Backend

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **Twitter API v2** - Twitter data integration
- **YouTube Data API** - YouTube data integration
- **Natural** - Natural language processing
- **Compromise** - Text analysis and entity extraction

### Frontend

- **React 18** - UI library
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **Axios** - HTTP client

### DevOps & Tools

- **MongoDB Atlas** - Cloud database
- **Concurrently** - Run multiple commands
- **Nodemon** - Development server
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Rate Limiting** - API protection

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- MongoDB Atlas account
- Twitter API credentials
- YouTube Data API key

### 1. Clone the Repository

```bash
git clone <repository-url>
cd hashtag-analyzer
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Backend (.env file in server directory)

```env
MONGODB_URI=mongodb+srv://dogramacialper98:<db_password>@cluster0.rqiiydc.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
PORT=5000
NODE_ENV=development

# Twitter API Keys (Required)
TWITTER_BEARER_TOKEN=your_twitter_bearer_token_here
TWITTER_API_KEY=your_twitter_api_key_here
TWITTER_API_SECRET=your_twitter_api_secret_here

# YouTube API Key (Required)
YOUTUBE_API_KEY=your_youtube_api_key_here

# Instagram API Keys (Optional)
INSTAGRAM_ACCESS_TOKEN=your_instagram_access_token_here

# Rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

#### Frontend (.env file in client directory)

```env
REACT_APP_API_URL=http://localhost:5000
```

### 4. API Keys Setup

#### Twitter API

1. Go to [Twitter Developer Portal](https://developer.twitter.com/)
2. Create a new app
3. Get your API keys and bearer token
4. Add them to the `.env` file

#### YouTube Data API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Add the API key to the `.env` file

### 5. Run the Application

#### Development Mode

```bash
# From the root directory
npm run dev
```

This will start both the backend (port 5000) and frontend (port 3000) servers.

#### Production Mode

```bash
# Build the frontend
cd client
npm run build

# Start the backend
cd ../server
npm start
```

## 📊 API Documentation

### Hashtag Endpoints

#### Get All Hashtags

```
GET /api/hashtags
Query Parameters:
- page: Page number (default: 1)
- limit: Items per page (default: 20)
- platform: Filter by platform (twitter, youtube, instagram)
- category: Filter by category
- sortBy: Sort field (default: trending_score)
- sortOrder: Sort order (asc, desc)
```

#### Get Trending Hashtags

```
GET /api/hashtags/trending
Query Parameters:
- platform: Filter by platform
- limit: Number of results (default: 20)
```

#### Get Hashtag Details

```
GET /api/hashtags/:hashtag
Query Parameters:
- platform: Filter by platform
```

#### Search Hashtags

```
GET /api/hashtags/search/:query
Query Parameters:
- platform: Filter by platform
- limit: Number of results (default: 20)
```

### Social Media Endpoints

#### Fetch Twitter Trending

```
GET /api/social-media/twitter/trending
Query Parameters:
- woeid: Location ID (default: 1 for worldwide)
```

#### Fetch YouTube Trending

```
GET /api/social-media/youtube/trending
Query Parameters:
- regionCode: Country code (default: US)
- maxResults: Number of results (default: 50)
```

#### Fetch Hashtag Data

```
POST /api/social-media/fetch/:hashtag
Body:
{
  "platforms": ["twitter", "youtube"]
}
```

### Analytics Endpoints

#### Get Trend Analysis

```
GET /api/analytics/trends/:hashtag
Query Parameters:
- platform: Filter by platform
- days: Time period in days (default: 30)
```

#### Get Predictions

```
GET /api/analytics/predictions/:hashtag
Query Parameters:
- platform: Filter by platform
```

#### Get Category Analysis

```
GET /api/analytics/categories
Query Parameters:
- platform: Filter by platform
- days: Time period in days (default: 7)
```

## 🎯 Usage

### 1. Dashboard

- View real-time statistics and trending hashtags
- Monitor platform performance and engagement metrics
- Access quick insights and overview data

### 2. Search Hashtags

- Search for specific hashtags across all platforms
- View detailed analytics and performance metrics
- Compare hashtag performance over time

### 3. Trending

- Browse currently trending hashtags
- Filter by platform and category
- View real-time trend data

### 4. Analytics

- Deep dive into hashtag performance
- View sentiment analysis and predictions
- Compare performance across platforms

## 🔧 Configuration

### Database Configuration

The application uses MongoDB Atlas. Update the `MONGODB_URI` in your `.env` file to connect to your database.

### Rate Limiting

Adjust rate limiting settings in the `.env` file:

- `RATE_LIMIT_WINDOW_MS`: Time window in milliseconds
- `RATE_LIMIT_MAX_REQUESTS`: Maximum requests per window

### CORS Configuration

Update CORS settings in `server/index.js` for production deployment.

## 🚀 Deployment

### Backend Deployment

1. Set up a Node.js hosting service (Heroku, Vercel, Railway, etc.)
2. Configure environment variables
3. Deploy the server directory

### Frontend Deployment

1. Build the React app: `npm run build`
2. Deploy the build folder to a static hosting service
3. Update the API URL in production

### Database

- Use MongoDB Atlas for cloud database hosting
- Configure network access and security settings
- Set up automated backups

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Twitter API for social media data
- YouTube Data API for video analytics
- MongoDB Atlas for database hosting
- Open source community for amazing libraries

## 📞 Support

For support and questions:

- Create an issue in the repository
- Contact: dogramacialper98@gmail.com
- Portfolio: https://alperdog.github.io/portfolio/

---

**Built with ❤️ by Alper Dogramaci**

## Troubleshooting

**If you see `Server error. Please try again later.` when opening the project:**

- Make sure you have set up your API keys and other required environment variables in the `.env` file for both the backend and frontend (if needed).
- Check the `.env.example` or project documentation for the required variables.
- Restart your servers after updating the `.env` file.
