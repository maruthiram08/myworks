# Deployment Guide

This guide covers various deployment options for the Twitter Clone application.

## Table of Contents
- [Docker Deployment](#docker-deployment)
- [Vercel Deployment](#vercel-deployment)
- [Railway Deployment](#railway-deployment)
- [DigitalOcean App Platform](#digitalocean-app-platform)
- [AWS Deployment](#aws-deployment)

## Docker Deployment

### Using Docker Compose (Recommended for Production)

1. **Clone the repository**
```bash
git clone <repository-url>
cd twitter-clone
```

2. **Set up environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your production values.

3. **Build and start services**
```bash
docker-compose up -d
```

4. **Run database migrations**
```bash
docker-compose exec app npx prisma migrate deploy
```

5. **View logs**
```bash
docker-compose logs -f app
```

### Using Docker Only

1. **Build the Docker image**
```bash
docker build -t twitter-clone:latest .
```

2. **Run PostgreSQL container**
```bash
docker run -d \
  --name twitter-db \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=twitter_clone \
  -p 5432:5432 \
  -v postgres_data:/var/lib/postgresql/data \
  postgres:15-alpine
```

3. **Run the application**
```bash
docker run -d \
  --name twitter-app \
  -p 3000:3000 \
  --link twitter-db:postgres \
  --env-file .env \
  twitter-clone:latest
```

## Vercel Deployment

Vercel is the easiest way to deploy Next.js applications.

### Prerequisites
- Vercel account
- External PostgreSQL database (e.g., Supabase, Neon, Railway)

### Steps

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-repo>
git push -u origin main
```

2. **Import to Vercel**
- Go to [Vercel](https://vercel.com)
- Click "New Project"
- Import your GitHub repository

3. **Configure Environment Variables**
Add all environment variables from `.env.example`:
- `DATABASE_URL`
- `NEXTAUTH_URL` (your Vercel domain)
- `NEXTAUTH_SECRET`
- All Pusher credentials
- OAuth credentials (optional)

4. **Deploy**
Vercel will automatically deploy on every push to main.

### Database Setup
Use one of these PostgreSQL providers:
- **Supabase** - Free tier available, easy setup
- **Neon** - Serverless PostgreSQL
- **Railway** - Simple deployment
- **PlanetScale** - MySQL alternative

## Railway Deployment

Railway offers simple deployment with integrated PostgreSQL.

### Steps

1. **Install Railway CLI**
```bash
npm install -g @railway/cli
```

2. **Login to Railway**
```bash
railway login
```

3. **Initialize project**
```bash
railway init
```

4. **Add PostgreSQL**
```bash
railway add --plugin postgresql
```

5. **Set environment variables**
```bash
railway variables set NEXTAUTH_URL=https://your-app.railway.app
railway variables set NEXTAUTH_SECRET=your-secret
# Add other variables...
```

6. **Deploy**
```bash
railway up
```

7. **Run migrations**
```bash
railway run npx prisma migrate deploy
```

## DigitalOcean App Platform

### Prerequisites
- DigitalOcean account
- Docker Hub account (for custom Docker image)

### Steps

1. **Create PostgreSQL Database**
- Go to DigitalOcean Databases
- Create a PostgreSQL cluster
- Note the connection string

2. **Create App**
- Go to App Platform
- Create new app from GitHub repo
- Choose Dockerfile option

3. **Configure**
- Add environment variables
- Set up database connection
- Configure build settings

4. **Deploy**
DigitalOcean will build and deploy automatically.

## AWS Deployment

### Using AWS Elastic Beanstalk

1. **Install EB CLI**
```bash
pip install awsebcli
```

2. **Initialize**
```bash
eb init -p docker twitter-clone
```

3. **Create environment**
```bash
eb create twitter-clone-env
```

4. **Set environment variables**
```bash
eb setenv DATABASE_URL=your-db-url \
  NEXTAUTH_URL=your-app-url \
  NEXTAUTH_SECRET=your-secret
```

5. **Deploy**
```bash
eb deploy
```

### Using AWS ECS (Elastic Container Service)

1. **Push Docker image to ECR**
```bash
aws ecr create-repository --repository-name twitter-clone
docker tag twitter-clone:latest <ecr-url>/twitter-clone:latest
docker push <ecr-url>/twitter-clone:latest
```

2. **Create RDS PostgreSQL instance**
- Go to RDS console
- Create PostgreSQL database
- Note connection details

3. **Create ECS Task Definition**
- Define container with your ECR image
- Set environment variables
- Configure resources

4. **Create ECS Service**
- Choose Fargate or EC2 launch type
- Configure load balancer
- Set desired task count

## Environment Variables for Production

### Required
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<generate-secure-random-string>
NEXT_PUBLIC_PUSHER_APP_KEY=your-pusher-key
PUSHER_APP_ID=your-pusher-app-id
PUSHER_SECRET=your-pusher-secret
NEXT_PUBLIC_PUSHER_CLUSTER=your-cluster
```

### Optional (for OAuth)
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Database Migration in Production

Always run migrations before deploying new code:

```bash
# If using Docker
docker-compose exec app npx prisma migrate deploy

# If using CLI access
npx prisma migrate deploy

# Generate Prisma Client if needed
npx prisma generate
```

## Health Checks

Add a health check endpoint for monitoring:

Create `app/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ status: "healthy" })
  } catch (error) {
    return NextResponse.json(
      { status: "unhealthy", error: "Database connection failed" },
      { status: 503 }
    )
  }
}
```

## Performance Optimization

### 1. Enable caching
```typescript
// In next.config.mjs
const nextConfig = {
  // ... other config
  experimental: {
    optimizeCss: true,
  },
}
```

### 2. Use CDN for static assets
Configure your deployment to use a CDN for:
- Images
- CSS/JS bundles
- Fonts

### 3. Database connection pooling
Use connection pooling for better performance:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?pgbouncer=true&connection_limit=10"
```

### 4. Enable Vercel Analytics (if using Vercel)
```bash
npm install @vercel/analytics
```

## Monitoring

### Application Monitoring
- **Sentry** - Error tracking
- **LogRocket** - Session replay
- **Datadog** - APM and logging

### Database Monitoring
- Use your provider's built-in monitoring
- Set up alerts for high CPU/memory usage
- Monitor slow queries

## Security Checklist

- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (automatic on most platforms)
- [ ] Set up CORS properly
- [ ] Configure Content Security Policy
- [ ] Enable rate limiting
- [ ] Regular security updates
- [ ] Database backups enabled
- [ ] Set up SSL for database connections

## Scaling

### Horizontal Scaling
- Increase number of containers/instances
- Use load balancer
- Ensure stateless application design

### Database Scaling
- Use read replicas for read-heavy workloads
- Enable connection pooling
- Consider caching frequently accessed data

### Caching Strategy
- Use Redis for session storage
- Cache API responses
- Implement CDN for static assets

## Backup Strategy

### Database Backups
```bash
# Manual backup
pg_dump $DATABASE_URL > backup.sql

# Restore
psql $DATABASE_URL < backup.sql
```

### Automated Backups
Most cloud providers offer automated backups:
- Vercel Postgres: Automatic daily backups
- Railway: Point-in-time recovery
- AWS RDS: Automated backups with retention
- DigitalOcean: Daily backups

## Troubleshooting Deployment Issues

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies are in package.json
- Check for TypeScript errors

### Database Connection Issues
- Verify DATABASE_URL format
- Check firewall/security group settings
- Ensure database is accessible from app

### Real-time Features Not Working
- Verify Pusher credentials
- Check CORS settings
- Ensure WebSocket connections are allowed

## Cost Optimization

### Free Tier Options
- **Vercel**: Free for hobby projects
- **Railway**: $5 credit per month
- **Supabase**: Free PostgreSQL database
- **Pusher**: Free tier (200k messages/day)

### Production Cost Estimates
- Small app: $15-30/month
- Medium app: $50-100/month
- Large app: $200+/month

Includes:
- Database hosting
- Application hosting
- Real-time service
- CDN/bandwidth

## Support

For deployment issues:
1. Check deployment provider's documentation
2. Review application logs
3. Check database connection
4. Verify environment variables
5. Test locally with production build

```bash
# Test production build locally
npm run build
npm start
```
