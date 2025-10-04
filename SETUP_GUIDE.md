# 🚀 Beacon Compliance Intelligence Platform - Setup Guide

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ 
- **npm** or **yarn**
- **Git**
- **Clerk Account** (for authentication)

## 🔧 Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/archdtech/newscomp.git
cd newscomp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Configuration

The platform requires several environment variables to function properly. Copy the example environment file:

```bash
cp .env.example .env
```

#### Required Environment Variables

**🔐 Authentication (Clerk)**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
CLERK_SECRET_KEY=sk_test_your_secret_key
```

*Get these keys from your [Clerk Dashboard](https://dashboard.clerk.com)*

**🗄️ Database**
```env
DATABASE_URL="file:./dev.db"
```

*For development, SQLite is used. For production, update to PostgreSQL.*

**🤖 AI Services**
```env
Z_AI_API_KEY=your-z-ai-api-key
GOOGLE_AI_API_KEY=your-google-ai-api-key
```

*Get Z-AI key from your Z.ai dashboard, Google AI key from Google Cloud Console.*

**📧 Email Services**
```env
RESEND_API_KEY=your-resend-api-key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

*Get Resend key from [Resend Dashboard](https://resend.com)*

**📰 News Scraper**
```env
NEWS_SCRAPER_API_KEY=your-news-scraper-api-key
NEWS_SCRAPER_ENDPOINT=http://localhost:3001/api/news/process
```

### 4. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Push database schema
npm run db:push

# Seed database with sample data
npm run db:seed
```

### 5. Start the Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the application.

## 🔑 API Keys Setup

### Clerk Authentication

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new application or use existing one
3. Navigate to **API Keys** section
4. Copy the **Publishable key** and **Secret key**
5. Add them to your `.env` file

### Z-AI Integration

1. Log in to your Z.ai account
2. Navigate to API settings
3. Generate a new API key
4. Add it to your `.env` file

### Google AI

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Generative AI API
3. Create an API key
4. Add it to your `.env` file

### Resend Email

1. Sign up at [Resend](https://resend.com)
2. Verify your domain
3. Generate an API key
4. Add it to your `.env` file

## 🗄️ Database Configuration

### Development (SQLite)

The platform uses SQLite for development by default:

```env
DATABASE_URL="file:./dev.db"
```

### Production (PostgreSQL)

For production, update to PostgreSQL:

```env
DATABASE_URL="postgresql://username:password@localhost:5432/beacon_db"
```

Then run:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
```

## 📰 News Scraper Setup

The news scraper runs as a separate Python service:

```bash
cd news-scraper
pip install -r requirements.txt
python simple_scraper.py
```

Make sure the `NEWS_SCRAPER_ENDPOINT` in your `.env` matches the scraper URL.

## 🚀 Running the Application

### Development Mode

```bash
# Start Next.js application
npm run dev

# In another terminal, start news scraper
cd news-scraper
python simple_scraper.py
```

### Production Mode

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# For production
docker-compose -f docker-compose.prod.yml up -d
```

## 🔍 Verification Steps

### 1. Check Application Health

Visit [http://localhost:3000/api/health](http://localhost:3000/api/health)

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-XXTXX:XX:XX.XXXZ"
}
```

### 2. Test Authentication

1. Navigate to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up" to create an account
3. Verify email confirmation works
4. Test sign in/sign out functionality

### 3. Check Database

```bash
# Check database connection
npm run db:check

# View database contents
sqlite3 dev.db ".tables"
```

### 4. Test AI Features

1. Navigate to the AI Alerts page
2. Try generating an AI analysis
3. Verify the response is properly formatted

## 🛠️ Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill existing processes
pkill -f "next|node"

# Or use a different port
PORT=3001 npm run dev
```

**Database connection errors**
```bash
# Reset database
npm run db:reset

# Check database file permissions
ls -la dev.db
```

**Clerk authentication not working**
- Verify your Clerk keys are correct
- Check that `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` starts with `pk_test_`
- Ensure `CLERK_SECRET_KEY` starts with `sk_test_`

**AI services not responding**
- Verify API keys are correct
- Check network connectivity
- Review API quota limits

**Email not sending**
- Verify Resend API key
- Check domain verification in Resend
- Review email templates

### Debug Mode

Enable debug logging:

```env
NODE_ENV=development
DEBUG=beacon:*
```

### Logs

Check application logs:

```bash
# Development logs
npm run dev 2>&1 | tee dev.log

# Production logs
npm start 2>&1 | tee prod.log
```

## 📚 Additional Resources

- [Clerk Documentation](https://clerk.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Z-AI Documentation](https://docs.z.ai)
- [Resend Documentation](https://resend.com/docs)

## 🆘 Support

If you encounter issues:

1. Check the [Error Logs Guide](./ERROR_LOGS_AND_BUG_REPORTS.md)
2. Review [Troubleshooting Section](./HOW_TO_RUN.md)
3. Create an issue on [GitHub](https://github.com/archdtech/newscomp/issues)
4. Contact support at support@beacon.com

---

**🎉 Congratulations! Your Beacon Compliance Intelligence Platform is now ready to use!**