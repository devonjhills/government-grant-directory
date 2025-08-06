# Government Grant & Procurement Directory - Production Deployment Guide

This guide provides comprehensive instructions for deploying the Government Grant & Procurement Directory to production, including all required API keys, configurations, and optimizations.

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [API Keys and External Services](#api-keys-and-external-services)
4. [Environment Configuration](#environment-configuration)
5. [Database Setup](#database-setup)
6. [Deployment Steps](#deployment-steps)
7. [Post-Deployment Configuration](#post-deployment-configuration)
8. [Monitoring and Performance](#monitoring-and-performance)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

## Overview

The Government Grant & Procurement Directory aggregates data from multiple government APIs to provide a comprehensive view of funding and procurement opportunities. The system requires several external API keys and services to function fully in production.

## Prerequisites

- Node.js 18.x or later
- npm or yarn package manager
- Domain name and SSL certificate
- CDN (recommended: Cloudflare or AWS CloudFront)
- Email service (for notifications and alerts)
- Analytics service (optional: Google Analytics 4)

## API Keys and External Services

### Required API Keys


#### 1. USAspending.gov API (NO KEY REQUIRED)

**What it provides:** Historical federal spending data, contract awards

**API Documentation:** [USAspending.gov API](https://api.usaspending.gov/)
**Cost:** Free
**Rate limits:** No explicit limits, but use reasonable request patterns
**Environment variable:** None required

#### 2. Grants.gov API (NO KEY REQUIRED for search)

**What it provides:** Federal grant opportunities

**API Documentation:** [Grants.gov API Guide](https://grants.gov/api/api-guide)
**Cost:** Free for search endpoints
**Rate limits:** No explicit limits for search
**Environment variable:** None required for basic search

### Optional API Keys

#### 3. Google Analytics 4 (Optional)

**Purpose:** Web analytics and user tracking

**How to obtain:**
1. Visit [Google Analytics](https://analytics.google.com/)
2. Create new GA4 property
3. Get Measurement ID (format: G-XXXXXXXXXX)

**Environment variable:** `NEXT_PUBLIC_GA_MEASUREMENT_ID`

#### 4. Email Service (Recommended for production)

Choose one of the following services:

**SendGrid (Recommended)**
- Sign up at [sendgrid.com](https://sendgrid.com)
- Create API key in Settings → API Keys
- Verify your domain for better deliverability
- Environment variable: `SENDGRID_API_KEY`

**AWS SES**
- Set up AWS SES in your AWS account
- Verify email domain
- Create IAM user with SES send permissions
- Environment variables: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`

**Resend (Alternative)**
- Sign up at [resend.com](https://resend.com)
- Create API key
- Environment variable: `RESEND_API_KEY`

#### 5. Database (Required for production features)

The application supports SQLite for development and PostgreSQL for production.

**PostgreSQL (Recommended for production)**
- Use managed services like:
  - Vercel Postgres
  - AWS RDS
  - Digital Ocean Managed Databases
  - Supabase
- Environment variable: `DATABASE_URL`

## Environment Configuration

Create a `.env.local` file with the following variables:

```bash
# Site Configuration
NEXT_PUBLIC_BASE_URL=https://your-domain.com
NEXT_PUBLIC_SITE_NAME="Government Grant & Procurement Directory"

# API Keys (none required for current setup)

# Database (choose one)
DATABASE_URL=postgresql://user:password@host:port/database
# OR for development
DATABASE_URL=file:./database.sqlite

# Email Service (choose one)
SENDGRID_API_KEY=your_sendgrid_api_key
# OR
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=us-east-1
# OR
RESEND_API_KEY=your_resend_api_key

# Optional Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Performance & Caching
ENABLE_PERFORMANCE_MONITORING=true
CACHE_TTL_SECONDS=3600

# Security
NEXTAUTH_SECRET=your_very_long_random_secret_here
NEXTAUTH_URL=https://your-domain.com

# Subscription/Payment (if using Stripe)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Feature Flags
ENABLE_SUBSCRIPTIONS=true
ENABLE_ADVANCED_SEARCH=true
ENABLE_ALERTS=true
```

## Database Setup

### PostgreSQL Production Setup

1. **Create database:**
```sql
CREATE DATABASE grant_directory;
CREATE USER grant_user WITH ENCRYPTED PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE grant_directory TO grant_user;
```

2. **Run migrations:**
```bash
npm run db:migrate
```

3. **Seed initial data (optional):**
```bash
npm run db:seed
```

### Database Schema

The application will create the following tables:

- `users` - User accounts and profiles
- `subscriptions` - Subscription tiers and billing
- `saved_opportunities` - User saved opportunities  
- `search_alerts` - Email alert configurations
- `usage_metrics` - API usage tracking
- `opportunity_cache` - Cached opportunity data

## Deployment Steps

### Option 1: Vercel (Recommended)

1. **Connect GitHub repository to Vercel:**
   - Visit [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Configure environment variables in Vercel dashboard

2. **Configure build settings:**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": ".next",
     "installCommand": "npm ci"
   }
   ```

3. **Deploy:**
   - Push to main branch triggers automatic deployment
   - Vercel handles SSL certificates automatically

### Option 2: Docker Deployment

1. **Build Docker image:**
```bash
docker build -t grant-directory .
```

2. **Run container:**
```bash
docker run -d \
  --name grant-directory \
  -p 3000:3000 \
  --env-file .env.production \
  grant-directory
```

3. **Use docker-compose for full stack:**
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_DB: grant_directory
      POSTGRES_USER: grant_user
      POSTGRES_PASSWORD: your_password
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### Option 3: AWS/Cloud Deployment

**Using AWS App Runner:**
1. Create `apprunner.yaml`:
```yaml
version: 1.0
runtime: nodejs18
build:
  commands:
    build:
      - npm ci
      - npm run build
run:
  runtime-version: 18
  command: npm start
  network:
    port: 3000
  env:
    NODE_ENV: production
```

2. Deploy via AWS Console or CLI

## Post-Deployment Configuration

### 1. Domain and SSL Setup

**Custom Domain:**
1. Point your domain to deployment platform
2. Configure DNS records (A/CNAME)
3. Enable SSL certificate (automatic with most platforms)

**CDN Configuration (Optional but recommended):**
```javascript
// next.config.mjs
const nextConfig = {
  images: {
    loader: 'cloudinary', // or 'custom'
    domains: ['your-cdn-domain.com'],
  },
  // Add CDN for static assets
  assetPrefix: process.env.NODE_ENV === 'production' 
    ? 'https://your-cdn-domain.com' 
    : '',
};
```

### 2. Email Templates Setup

Create email templates for:
- Welcome emails
- Alert notifications  
- Password resets
- Subscription updates

### 3. Monitoring Setup

**Application Monitoring:**
```bash
# Install monitoring packages
npm install @vercel/analytics @opentelemetry/api @opentelemetry/auto-instrumentations-node
```

**Error Tracking:**
```javascript
// Add to your Next.js app
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 1.0,
});
```

### 4. Caching Configuration

**Redis Setup (Optional for advanced caching):**
```bash
# Environment variable
REDIS_URL=redis://your-redis-url
```

```javascript
// lib/redis.ts
import Redis from 'ioredis';

export const redis = new Redis(process.env.REDIS_URL);
```

## Monitoring and Performance

### Performance Metrics to Monitor

1. **API Response Times:**
   - Grants.gov API: Target < 2 seconds
   - USAspending.gov API: Target < 4 seconds

2. **Database Performance:**
   - Query response times < 100ms for cached data
   - Query response times < 1 second for fresh data

3. **User Experience:**
   - Core Web Vitals (LCP, FID, CLS)
   - Page load times < 3 seconds
   - Time to Interactive < 2 seconds

### Logging Setup

```javascript
// lib/logger.ts
import winston from 'winston';

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
  ],
});
```

### Health Check Endpoints

The application includes health check endpoints:

- `/api/health` - Basic application health
- `/api/health/detailed` - Detailed system status including API connectivity

## Security Considerations

### 1. API Key Security

- Never commit API keys to version control
- Use environment variables for all sensitive data
- Rotate API keys regularly (quarterly recommended)
- Monitor API key usage for anomalies

### 2. Rate Limiting

```javascript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';

export const ratelimit = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(100, '1 h'),
});
```

### 3. Content Security Policy

Add CSP headers in `next.config.mjs`:

```javascript
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com;
      style-src 'self' 'unsafe-inline';
      connect-src 'self' https://api.grants.gov https://api.usaspending.gov;
      img-src 'self' data: https:;
      frame-src 'none';
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

### 4. HTTPS Enforcement

Ensure all production traffic uses HTTPS:
- Configure your hosting platform to redirect HTTP to HTTPS
- Use HSTS headers
- Regular SSL certificate monitoring

## Troubleshooting

### Common Issues

**1. API Connection Issues:**
```bash
# Test USAspending API
curl "https://api.usaspending.gov/api/v2/search/spending_by_award/"

# Test Grants.gov API  
curl "https://api.grants.gov/v1/api/search2?keyword=health"
```

**2. Database Connection Issues:**
```bash
# Test database connection
npm run db:test-connection
```

**3. Build Failures:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**4. Memory Issues:**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max_old_space_size=4096" npm start
```

### Performance Optimization Checklist

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database connection pooling
- [ ] Enable Redis caching (if applicable)
- [ ] Configure image optimization
- [ ] Set proper cache headers
- [ ] Enable service worker
- [ ] Monitor and optimize bundle size

### Monitoring Checklist

- [ ] Set up error tracking (Sentry)
- [ ] Configure uptime monitoring
- [ ] Set up performance monitoring
- [ ] Configure log aggregation
- [ ] Set up alert notifications
- [ ] Monitor API usage and limits
- [ ] Track user engagement metrics

## Support and Maintenance

### Regular Tasks

**Weekly:**
- Review error logs
- Monitor API usage
- Check system performance metrics

**Monthly:**  
- Update dependencies
- Review security settings
- Analyze user feedback
- Update content and data sources

**Quarterly:**
- Rotate API keys
- Security audit
- Performance optimization review
- Backup verification

### Contact Information

For deployment issues or questions:
- Check GitHub Issues for common problems
- Review API documentation for external services
- Monitor service status pages for outages

## Conclusion

This deployment guide covers all aspects of taking the Government Grant & Procurement Directory from development to production. Follow the checklists and monitoring guidelines to ensure a stable, performant, and secure deployment.

Remember to:
1. Test thoroughly in a staging environment
2. Monitor closely after initial deployment  
3. Have a rollback plan ready
4. Keep all dependencies updated
5. Regular security reviews

The application is designed to be highly performant and scalable, capable of handling significant traffic loads while providing real-time access to government funding opportunities.