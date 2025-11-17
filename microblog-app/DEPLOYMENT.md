# Deployment Guide

This document provides instructions for deploying the Microblog application to various platforms.

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL database
- Pusher account (for real-time features)
- OAuth credentials (optional, for social login)

## Environment Variables

Create a `.env` file based on `.env.example` with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/microblog?schema=public"

# Auth.js (NextAuth)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"

# OAuth Providers (optional)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GITHUB_CLIENT_ID="your-github-client-id"
GITHUB_CLIENT_SECRET="your-github-client-secret"

# Pusher for real-time features
NEXT_PUBLIC_PUSHER_APP_KEY="your-pusher-app-key"
PUSHER_APP_ID="your-pusher-app-id"
PUSHER_SECRET="your-pusher-secret"
NEXT_PUBLIC_PUSHER_CLUSTER="your-pusher-cluster"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Deployment Options

### 1. Docker Deployment (Recommended)

The easiest way to deploy the application is using Docker and Docker Compose.

#### Prerequisites
- Docker and Docker Compose installed

#### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd microblog-app
```

2. Update environment variables in `docker-compose.yml`

3. Build and start the containers:
```bash
docker-compose up -d
```

4. The application will be available at `http://localhost:3000`

5. To stop the containers:
```bash
docker-compose down
```

6. To view logs:
```bash
docker-compose logs -f app
```

### 2. Vercel Deployment

Vercel is the recommended platform for Next.js applications.

#### Prerequisites
- Vercel account
- PostgreSQL database (Supabase, Neon, or Railway recommended)

#### Steps

1. Push your code to a Git repository (GitHub, GitLab, or Bitbucket)

2. Import your repository on [Vercel](https://vercel.com/new)

3. Configure environment variables in Vercel dashboard:
   - Go to Settings > Environment Variables
   - Add all variables from `.env.example`

4. Deploy the application

5. Run database migrations:
```bash
# Install Vercel CLI
npm i -g vercel

# Run migrations
vercel env pull .env.local
npx prisma migrate deploy
```

### 3. Railway Deployment

Railway provides an easy way to deploy with built-in PostgreSQL.

#### Steps

1. Create a new project on [Railway](https://railway.app)

2. Add PostgreSQL database:
   - Click "New" > "Database" > "PostgreSQL"
   - Copy the connection string

3. Add your application:
   - Click "New" > "GitHub Repo"
   - Select your repository

4. Configure environment variables:
   - Add all variables from `.env.example`
   - Use the PostgreSQL connection string from step 2

5. Deploy

### 4. Manual Deployment (VPS/Server)

For deployment on a VPS or dedicated server.

#### Prerequisites
- Ubuntu 22.04+ or similar Linux distribution
- Node.js 20+ installed
- PostgreSQL installed
- Nginx (for reverse proxy)
- PM2 (for process management)

#### Steps

1. Clone the repository:
```bash
git clone <repository-url>
cd microblog-app
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file with production values

4. Build the application:
```bash
npm run build
```

5. Run database migrations:
```bash
npx prisma migrate deploy
```

6. Start with PM2:
```bash
npm install -g pm2
pm2 start npm --name "microblog" -- start
pm2 save
pm2 startup
```

7. Configure Nginx as reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

8. Enable SSL with Certbot:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## Database Migrations

### Creating a new migration
```bash
npx prisma migrate dev --name migration_name
```

### Applying migrations in production
```bash
npx prisma migrate deploy
```

### Resetting the database (development only)
```bash
npx prisma migrate reset
```

## Monitoring and Maintenance

### Health Checks

The application includes health check endpoints:
- `/api/health` - Basic health check
- `/api/health/db` - Database connectivity check

### Logs

#### Docker
```bash
docker-compose logs -f app
```

#### PM2
```bash
pm2 logs microblog
```

### Backup Database

#### PostgreSQL backup
```bash
pg_dump -U username -d microblog > backup.sql
```

#### Restore from backup
```bash
psql -U username -d microblog < backup.sql
```

## Scaling Considerations

1. **Database Connection Pooling**: Consider using PgBouncer for connection pooling
2. **Caching**: Implement Redis for caching frequently accessed data
3. **CDN**: Use a CDN for static assets and images
4. **Load Balancing**: Use multiple application instances behind a load balancer
5. **Database Replication**: Set up read replicas for read-heavy operations

## Troubleshooting

### Issue: Database connection failed
- Check DATABASE_URL is correct
- Ensure database server is running
- Verify network connectivity

### Issue: OAuth login not working
- Verify OAuth credentials are correct
- Check callback URLs are configured in OAuth provider
- Ensure NEXTAUTH_URL matches your domain

### Issue: Real-time features not working
- Verify Pusher credentials
- Check Pusher cluster is correct
- Ensure WebSocket connections are not blocked

## Security Checklist

- [ ] Change NEXTAUTH_SECRET to a strong random value
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS in production
- [ ] Set up rate limiting
- [ ] Configure CORS properly
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Keep dependencies updated
- [ ] Use strong database passwords
- [ ] Implement proper error handling

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review common deployment issues
