# Deployment Guide

This guide covers multiple deployment options for the Vacation Rental Platform.

## Prerequisites

Before deploying, ensure you have:

1. A PostgreSQL database (can be hosted on Railway, Supabase, Neon, etc.)
2. Google OAuth credentials
3. Stripe account and API keys
4. Cloudflare R2 or AWS S3 bucket for images
5. Mapbox API token
6. Email service credentials (optional, for magic link auth)

## Deployment Options

### Option 1: Vercel (Recommended for Next.js)

#### Step 1: Prepare Your Repository
```bash
git push origin main
```

#### Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your GitHub repository
4. Configure environment variables (see Environment Variables section below)
5. Deploy!

#### Step 3: Set Up Database

```bash
# Run migrations
npx prisma migrate deploy

# Seed the database (optional)
npx prisma db seed
```

#### Step 4: Configure Webhooks

Add your Vercel URL to:
- Stripe webhook endpoint: `https://your-domain.vercel.app/api/stripe/webhook`
- Google OAuth authorized redirect URIs

### Option 2: Railway

#### Step 1: Create a New Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your repository

#### Step 2: Add PostgreSQL Database

1. Click "New" → "Database" → "PostgreSQL"
2. Railway will automatically create a database and provide the connection string

#### Step 3: Configure Environment Variables

Add all environment variables from `.env.example` in the Railway dashboard.

Railway will automatically use `DATABASE_URL` from the PostgreSQL service.

#### Step 4: Deploy

Railway will automatically:
1. Install dependencies
2. Generate Prisma client
3. Run migrations
4. Start the application

### Option 3: Docker (Self-Hosted)

#### Step 1: Clone and Configure

```bash
git clone <your-repo>
cd vacation-rental-platform
cp .env.example .env
# Edit .env with your values
```

#### Step 2: Build and Run with Docker Compose

```bash
docker-compose up -d
```

This will:
- Start PostgreSQL database
- Build and run the Next.js application
- Run database migrations
- Seed the database (optional)

#### Step 3: Access the Application

Open `http://localhost:3000` in your browser.

#### Management Commands

```bash
# View logs
docker-compose logs -f app

# Stop services
docker-compose down

# Rebuild after changes
docker-compose up -d --build

# Run migrations manually
docker-compose exec app npx prisma migrate deploy

# Access database
docker-compose exec postgres psql -U postgres -d vacation_rental
```

### Option 4: Manual VPS Deployment

#### Step 1: Set Up Server

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install PM2 for process management
sudo npm install -g pm2
```

#### Step 2: Deploy Application

```bash
# Clone repository
git clone <your-repo>
cd vacation-rental-platform

# Install dependencies
npm install

# Set up environment
cp .env.example .env
nano .env  # Edit with your values

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Build application
npm run build

# Start with PM2
pm2 start npm --name "vacation-rental" -- start
pm2 save
pm2 startup
```

#### Step 3: Set Up Nginx (Reverse Proxy)

```bash
sudo apt install -y nginx

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/vacation-rental
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com;

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

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/vacation-rental /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Set up SSL with Let's Encrypt
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Environment Variables

### Required Variables

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/database"

# NextAuth
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="generated-secret-key"

# OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."
STRIPE_SECRET_KEY="sk_live_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Cloudflare R2 or AWS S3
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="vacation-rentals"
R2_PUBLIC_URL="https://your-bucket.r2.dev"

# Mapbox
NEXT_PUBLIC_MAPBOX_TOKEN="your-mapbox-token"

# App URL
NEXT_PUBLIC_APP_URL="https://your-domain.com"
```

### Optional Variables

```env
# Email (for magic link authentication)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="noreply@your-domain.com"

# Platform Configuration
PLATFORM_FEE_PERCENTAGE=10
```

## Post-Deployment Checklist

- [ ] Verify database connection
- [ ] Test authentication (Google OAuth and Email)
- [ ] Configure Stripe webhook endpoint
- [ ] Test payment processing
- [ ] Upload test images to verify S3/R2 integration
- [ ] Test Mapbox integration
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy for database
- [ ] Set up SSL certificate
- [ ] Test all user flows (booking, hosting, reviews)

## Troubleshooting

### Database Connection Issues

```bash
# Test database connection
npx prisma db push

# View database
npx prisma studio
```

### Build Errors

```bash
# Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Environment Variable Issues

Ensure all required environment variables are set. Use:
```bash
node -e "console.log(process.env.DATABASE_URL)"
```

## Monitoring

### Set Up Health Check Endpoint

The application includes a health check at `/api/health` (you'll need to create this).

### Logging

- **Vercel**: Check the Vercel dashboard
- **Railway**: Check the Railway logs
- **Docker**: `docker-compose logs -f`
- **PM2**: `pm2 logs vacation-rental`

## Scaling Considerations

1. **Database**: Use connection pooling (PgBouncer) for high traffic
2. **Images**: Use CDN for image delivery
3. **Caching**: Implement Redis for session storage and caching
4. **Rate Limiting**: Add rate limiting to API routes
5. **Load Balancing**: Use multiple instances behind a load balancer

## Security Best Practices

1. Always use HTTPS in production
2. Keep dependencies updated
3. Use strong secrets for NEXTAUTH_SECRET
4. Enable Stripe webhook signature verification
5. Implement rate limiting
6. Regular security audits
7. Database backups

## Support

For issues or questions:
- Check the GitHub Issues
- Review the documentation
- Contact support team
