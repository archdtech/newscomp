# Environment Setup Guide

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Core Application
```bash
NODE_ENV=production
DATABASE_URL="postgresql://username:password@localhost:5432/beacon_compliance"
NEXTAUTH_SECRET="your-nextauth-secret-key-here"
NEXTAUTH_URL="https://your-domain.com"
```

### Authentication (Clerk)
```bash
CLERK_SECRET_KEY="sk_test_your_clerk_secret_key"
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_your_clerk_publishable_key"
```

### Email Service (Resend)
```bash
RESEND_API_KEY="re_your_resend_api_key"
```

### AI Service (Google AI)
```bash
GOOGLE_AI_API_KEY="AIzaSyB7BWGSIc5PbGnJiyR0IgldRRc74b-tBhM"
```

### Cron Jobs
```bash
CRON_SECRET="your-secure-cron-secret"
```

### Database (PostgreSQL)
```bash
POSTGRES_USER="beacon_user"
POSTGRES_PASSWORD="secure_password_here"
POSTGRES_DB="beacon_compliance"
```

## Setup Instructions

### 1. Get API Keys

#### Clerk Authentication
1. Go to [clerk.com](https://clerk.com)
2. Create a new application
3. Copy the publishable key and secret key from the dashboard

#### Resend Email Service
1. Go to [resend.com](https://resend.com)
2. Sign up and verify your account
3. Create an API key in the dashboard
4. Add your domain for email sending

#### Google AI
- API key is already provided: `AIzaSyB7BWGSIc5PbGnJiyR0IgldRRc74b-tBhM`

### 2. Database Setup

#### Local Development (SQLite)
- No additional setup required
- Database file will be created automatically

#### Production (PostgreSQL)
```bash
# Install PostgreSQL
sudo apt update
sudo apt install postgresql postgresql-contrib

# Create database and user
sudo -u postgres psql
CREATE DATABASE beacon_compliance;
CREATE USER beacon_user WITH PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE beacon_compliance TO beacon_user;
\q

# Update DATABASE_URL in .env
DATABASE_URL="postgresql://beacon_user:secure_password_here@localhost:5432/beacon_compliance"
```

### 3. Email Configuration

#### Domain Setup for Resend
1. Add your domain in Resend dashboard
2. Configure DNS records as instructed
3. Verify domain ownership
4. Update email templates with your domain

### 4. Deployment Options

#### Option 1: Docker Compose (Recommended)
```bash
# Copy environment file
cp ENVIRONMENT_SETUP.md .env
# Edit .env with your actual values

# Start production services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f
```

#### Option 2: Manual Deployment
```bash
# Install dependencies
npm install

# Build application
npm run build

# Run database migrations
npx prisma migrate deploy
npx prisma generate

# Start application
npm start
```

#### Option 3: Vercel Deployment
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### 5. Scheduled Jobs Setup

#### Using cron (Linux/Mac)
```bash
# Edit crontab
crontab -e

# Add daily digest job (7:00 AM)
0 7 * * * curl -X POST -H "Authorization: Bearer your-cron-secret" https://your-domain.com/api/cron/daily-digest

# Add vendor monitoring (every 5 minutes)
*/5 * * * * curl -X POST -H "Authorization: Bearer your-cron-secret" https://your-domain.com/api/cron/vendor-monitor
```

#### Using Vercel Cron
Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-digest",
      "schedule": "0 7 * * *"
    },
    {
      "path": "/api/cron/vendor-monitor", 
      "schedule": "*/5 * * * *"
    }
  ]
}
```

### 6. Health Checks

Test your deployment:
```bash
# Check application health
curl https://your-domain.com/api/health

# Test email digest
curl -X POST https://your-domain.com/api/email/digest \
  -H "Content-Type: application/json" \
  -d '{"action": "send-to-user"}'

# Test AI generation
curl -X POST https://your-domain.com/api/alerts/ai-generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Test compliance alert"}'
```

### 7. Monitoring

#### Application Logs
```bash
# Docker logs
docker-compose logs -f app

# PM2 logs (if using PM2)
pm2 logs beacon-app
```

#### Database Monitoring
```bash
# Check database connection
psql $DATABASE_URL -c "SELECT COUNT(*) FROM compliance_alerts;"

# Monitor email deliveries
psql $DATABASE_URL -c "SELECT * FROM email_deliveries ORDER BY created_at DESC LIMIT 10;"
```

## Security Considerations

1. **Environment Variables**: Never commit `.env` files to version control
2. **API Keys**: Rotate API keys regularly
3. **Database**: Use strong passwords and limit access
4. **HTTPS**: Always use HTTPS in production
5. **Cron Secret**: Use a strong, unique secret for cron jobs

## Troubleshooting

### Common Issues

#### Email Not Sending
- Check Resend API key is valid
- Verify domain is configured and verified
- Check email delivery logs in database

#### AI Generation Failing
- Verify Google AI API key is correct
- Check API quota and billing
- Review application logs for errors

#### Database Connection Issues
- Verify DATABASE_URL format
- Check database server is running
- Ensure user has proper permissions

#### Cron Jobs Not Running
- Verify cron secret matches
- Check cron job syntax
- Review server logs for errors

For additional support, check the application logs and monitoring dashboard.
