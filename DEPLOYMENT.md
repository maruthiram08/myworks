# Deployment Guide - RideShare Application

This guide covers deploying the full-stack ride-hailing application to various platforms.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Variables](#environment-variables)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [Database Setup](#database-setup)
- [SSL/HTTPS Configuration](#sslhttps-configuration)
- [Monitoring](#monitoring)

## Prerequisites

- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+
- Redis 7+
- Domain name (for production)
- Third-party API keys:
  - Mapbox or Google Maps API key
  - Stripe account (Secret key, Publishable key, Webhook secret)

## Environment Variables

### Backend (.env in /backend or set in your deployment platform)

```bash
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/ridehailing?schema=public"

# Server
BACKEND_PORT=4000
NODE_ENV=production

# Authentication
JWT_SECRET="your-secure-jwt-secret-min-32-chars"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"

# Redis
REDIS_URL="redis://localhost:6379"

# Admin (for initial seed)
ADMIN_EMAIL="admin@yourdomain.com"
ADMIN_PASSWORD="secure-admin-password"

# Email (optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
```

### Frontend (.env in /frontend or set in your deployment platform)

```bash
# API URLs
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_WS_URL="wss://api.yourdomain.com"

# Maps (choose one)
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token"
NEXT_PUBLIC_GOOGLE_MAPS_KEY="your_google_maps_key"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"

# Auth.js
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secure-nextauth-secret-min-32-chars"

# Backend URL (for server-side calls)
BACKEND_URL="http://backend:4000"  # Docker internal
# BACKEND_URL="http://localhost:4000"  # Local dev
```

### Docker Environment (.env in root directory)

```bash
# PostgreSQL
POSTGRES_PASSWORD="secure-postgres-password"

# JWT & Auth
JWT_SECRET="your-secure-jwt-secret-min-32-chars"
NEXTAUTH_SECRET="your-secure-nextauth-secret-min-32-chars"

# Stripe
STRIPE_SECRET_KEY="sk_live_your_stripe_secret_key"
STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"
STRIPE_WEBHOOK_SECRET="whsec_your_webhook_secret"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_your_stripe_publishable_key"

# Maps
NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token"

# URLs (for production)
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"
NEXT_PUBLIC_WS_URL="wss://api.yourdomain.com"
NEXTAUTH_URL="https://yourdomain.com"
```

## Local Development

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Setup Database

```bash
# Start PostgreSQL (or use Docker)
docker run --name ridehailing-postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine

# Start Redis
docker run --name ridehailing-redis -p 6379:6379 -d redis:7-alpine

# Navigate to backend
cd backend

# Run migrations
npx prisma migrate dev

# Seed database
npx prisma db seed
```

### 3. Start Development Servers

```bash
# From root directory
npm run dev

# Or start individually:
# Backend: npm run dev:backend
# Frontend: npm run dev:frontend
```

Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- API Health: http://localhost:4000/health

## Docker Deployment

### 1. Configure Environment

```bash
# Copy example env file
cp .env.example .env

# Edit .env with your values
nano .env
```

### 2. Build and Start

```bash
# Build images
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Seed database
docker-compose exec backend npx prisma db seed
```

### 4. Manage Services

```bash
# Stop services
docker-compose down

# Restart specific service
docker-compose restart backend

# View logs for specific service
docker-compose logs -f frontend

# Remove volumes (WARNING: deletes data)
docker-compose down -v
```

## Cloud Deployment

### AWS (ECS/Fargate)

1. **Setup ECR Repositories**
```bash
aws ecr create-repository --repository-name ridehailing-backend
aws ecr create-repository --repository-name ridehailing-frontend
```

2. **Build and Push Images**
```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build and tag
docker build -t ridehailing-backend ./backend
docker tag ridehailing-backend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ridehailing-backend:latest

docker build -t ridehailing-frontend ./frontend
docker tag ridehailing-frontend:latest YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ridehailing-frontend:latest

# Push
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ridehailing-backend:latest
docker push YOUR_AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/ridehailing-frontend:latest
```

3. **Setup RDS PostgreSQL**
   - Create RDS PostgreSQL instance
   - Note down the connection URL
   - Update DATABASE_URL in environment variables

4. **Setup ElastiCache Redis**
   - Create Redis cluster
   - Note down the connection URL
   - Update REDIS_URL in environment variables

5. **Create ECS Task Definitions and Services**
   - Use AWS Console or CloudFormation
   - Set environment variables
   - Configure load balancers

### DigitalOcean App Platform

1. **Create App**
```bash
doctl apps create --spec .do/app.yaml
```

2. **Example app.yaml**
```yaml
name: ridehailing
services:
  - name: backend
    github:
      repo: your-username/ridehailing
      branch: main
      deploy_on_push: true
    dockerfile_path: backend/Dockerfile
    envs:
      - key: DATABASE_URL
        value: ${db.DATABASE_URL}
      - key: REDIS_URL
        value: ${redis.REDIS_URL}
    http_port: 4000

  - name: frontend
    github:
      repo: your-username/ridehailing
      branch: main
      deploy_on_push: true
    dockerfile_path: frontend/Dockerfile
    envs:
      - key: NEXT_PUBLIC_API_URL
        value: https://backend-xxxxx.ondigitalocean.app
    http_port: 3000

databases:
  - name: db
    engine: PG
    version: "15"

  - name: redis
    engine: REDIS
    version: "7"
```

### Vercel (Frontend Only)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod

# Set environment variables in Vercel dashboard
```

### Heroku

```bash
# Create apps
heroku create ridehailing-backend
heroku create ridehailing-frontend

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev -a ridehailing-backend

# Add Redis
heroku addons:create heroku-redis:hobby-dev -a ridehailing-backend

# Deploy backend
cd backend
git push heroku main

# Deploy frontend
cd ../frontend
git push heroku main

# Set environment variables
heroku config:set STRIPE_SECRET_KEY=sk_live_xxx -a ridehailing-backend
```

## Database Setup

### Running Migrations

```bash
# Development
npx prisma migrate dev

# Production
npx prisma migrate deploy
```

### Seed Initial Data

```bash
# Seed database with admin user and settings
npx prisma db seed
```

### Backup Database

```bash
# PostgreSQL backup
pg_dump -U postgres ridehailing > backup.sql

# Restore
psql -U postgres ridehailing < backup.sql

# Docker
docker-compose exec postgres pg_dump -U postgres ridehailing > backup.sql
```

## SSL/HTTPS Configuration

### Using Let's Encrypt with Nginx

1. **Install Certbot**
```bash
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain Certificate**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

3. **Auto-renewal**
```bash
sudo certbot renew --dry-run
```

### Using Cloudflare

1. Add your domain to Cloudflare
2. Update nameservers
3. Enable "Full (strict)" SSL mode
4. Configure origin certificates

## Stripe Webhook Configuration

1. **Go to Stripe Dashboard** → Developers → Webhooks
2. **Add endpoint**: `https://api.yourdomain.com/api/payments/webhook`
3. **Select events**:
   - payment_intent.succeeded
   - payment_intent.payment_failed
4. **Copy webhook secret** and add to STRIPE_WEBHOOK_SECRET

## Monitoring

### Health Checks

- Backend: `https://api.yourdomain.com/health`
- Frontend: `https://yourdomain.com`

### Logging

```bash
# Docker logs
docker-compose logs -f --tail=100

# Specific service
docker-compose logs -f backend

# Application logs (implement Winston or similar)
tail -f logs/app.log
```

### Recommended Monitoring Tools

- **Sentry**: Error tracking
- **LogRocket**: Session replay and monitoring
- **DataDog**: Infrastructure monitoring
- **Grafana + Prometheus**: Metrics and dashboards
- **Uptime Robot**: Uptime monitoring

## Performance Optimization

### Frontend
- Enable Next.js Image Optimization
- Implement caching strategies
- Use CDN for static assets
- Enable compression

### Backend
- Implement database connection pooling
- Use Redis for caching
- Enable GZIP compression
- Implement rate limiting (already configured in Nginx)

### Database
- Add appropriate indexes
- Regular VACUUM operations
- Monitor query performance
- Implement read replicas for scaling

## Security Checklist

- [ ] Use HTTPS/TLS for all connections
- [ ] Set strong JWT_SECRET and NEXTAUTH_SECRET
- [ ] Enable CORS with specific origins only
- [ ] Implement rate limiting
- [ ] Sanitize user inputs
- [ ] Use environment variables for secrets
- [ ] Enable database connection encryption
- [ ] Implement CSP headers
- [ ] Regular security updates
- [ ] Enable database backups
- [ ] Implement API authentication
- [ ] Use prepared statements (Prisma does this)
- [ ] Validate file uploads
- [ ] Implement request timeouts

## Scaling Considerations

### Horizontal Scaling
- Use load balancers (AWS ALB, Nginx)
- Run multiple backend instances
- Use Redis for session storage
- Implement database read replicas

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Implement caching strategies
- Use CDN for static content

## Troubleshooting

### Common Issues

**Database Connection Failed**
- Check DATABASE_URL format
- Verify network connectivity
- Check firewall rules
- Ensure database is running

**WebSocket Not Connecting**
- Check CORS configuration
- Verify WS URL (ws:// or wss://)
- Check firewall/proxy settings
- Ensure backend is running

**Stripe Webhook Failing**
- Verify webhook secret
- Check endpoint URL
- Review Stripe dashboard logs
- Ensure HTTPS for production

**Maps Not Loading**
- Verify API key is valid
- Check domain restrictions
- Review browser console errors
- Ensure API is enabled

## Support

For issues and questions:
- Check GitHub Issues
- Review documentation
- Contact support team
