# Quick Start Guide - RideShare Application

## What You Need

### 1. API Keys & Credentials

Get these before starting:

**Mapbox (for maps)**
- Sign up at: https://www.mapbox.com/
- Get your access token from: https://account.mapbox.com/access-tokens/
- Add to `.env` as: `NEXT_PUBLIC_MAPBOX_TOKEN=pk.your_token_here`

**Stripe (for payments)**
- Sign up at: https://stripe.com/
- Get test keys from: https://dashboard.stripe.com/test/apikeys
- You'll need:
  - Secret Key (starts with `sk_test_`)
  - Publishable Key (starts with `pk_test_`)
  - Webhook Secret (create webhook endpoint first)

**Alternative: Google Maps**
- If you prefer Google Maps over Mapbox:
- Go to: https://console.cloud.google.com/
- Enable Maps JavaScript API and Geocoding API
- Create credentials and get API key
- Add to `.env` as: `NEXT_PUBLIC_GOOGLE_MAPS_KEY=your_key_here`

### 2. Generate Secrets

Run these commands to generate secure secrets:

```bash
# For JWT_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For NEXTAUTH_SECRET
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Installation (2 Minutes)

### Option 1: Docker (Recommended)

```bash
# 1. Copy environment file
cp .env.example .env

# 2. Edit .env with your API keys
nano .env

# 3. Start everything
docker-compose up -d

# 4. Initialize database
docker-compose exec backend npx prisma migrate deploy
docker-compose exec backend npx prisma db seed

# 5. Open http://localhost:3000
```

### Option 2: Local Development

```bash
# 1. Install dependencies
npm install

# 2. Copy environment files
cp .env.example .env

# 3. Edit .env with your values
nano .env

# 4. Start PostgreSQL and Redis (or use Docker)
docker run --name postgres -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15-alpine
docker run --name redis -p 6379:6379 -d redis:7-alpine

# 5. Setup database
cd backend
npx prisma migrate dev
npx prisma db seed
cd ..

# 6. Start development servers
npm run dev

# 7. Open http://localhost:3000
```

## Login Credentials

After seeding the database, use these credentials:

```
Admin Dashboard:
Email: admin@ridehailing.com
Password: admin123
URL: http://localhost:3000 → Auto-redirects to /admin/dashboard

Rider Account:
Email: rider@example.com
Password: rider123
URL: http://localhost:3000 → Auto-redirects to /rider/dashboard

Driver Account:
Email: driver1@example.com
Password: driver123
URL: http://localhost:3000 → Auto-redirects to /driver/dashboard
```

## Environment Variables Checklist

Minimum required for basic functionality:

### Backend (.env)
```bash
✅ DATABASE_URL="postgresql://postgres:password@localhost:5432/ridehailing"
✅ JWT_SECRET="your-generated-secret"
✅ STRIPE_SECRET_KEY="sk_test_your_key"
✅ REDIS_URL="redis://localhost:6379"
```

### Frontend (.env)
```bash
✅ NEXT_PUBLIC_API_URL="http://localhost:4000"
✅ NEXT_PUBLIC_WS_URL="ws://localhost:4000"
✅ NEXT_PUBLIC_MAPBOX_TOKEN="pk.your_mapbox_token"
✅ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_your_key"
✅ NEXTAUTH_URL="http://localhost:3000"
✅ NEXTAUTH_SECRET="your-generated-secret"
✅ BACKEND_URL="http://localhost:4000"
```

## Testing the Application

### As a Rider:
1. Login as rider@example.com
2. Click on map to select pickup location
3. Click on map to select dropoff location
4. See fare estimate
5. Request ride
6. Wait for driver to accept (if you have a driver online)

### As a Driver:
1. Login as driver1@example.com
2. Click "Go Online"
3. Allow location access in browser
4. Wait for ride requests
5. Accept a ride when notified
6. Update ride status: "I've Arrived" → "Start Trip" → "Complete Trip"

### As Admin:
1. Login as admin@ridehailing.com
2. View dashboard statistics
3. Manage drivers (verify new drivers)
4. View all rides
5. Update system settings

## Common Issues

### "Database connection failed"
- Make sure PostgreSQL is running: `docker ps | grep postgres`
- Check DATABASE_URL in .env
- Try: `docker-compose restart postgres`

### "Maps not loading"
- Verify NEXT_PUBLIC_MAPBOX_TOKEN is set correctly
- Check browser console for errors
- Make sure token has proper permissions

### "WebSocket connection failed"
- Check NEXT_PUBLIC_WS_URL is correct
- Ensure backend is running: `curl http://localhost:4000/health`
- Look for CORS errors in browser console

### "Payment fails"
- Verify Stripe keys are test keys (sk_test_, pk_test_)
- Check Stripe dashboard for errors
- Use test card: 4242 4242 4242 4242

## Next Steps

1. **Customize Pricing**: Go to Admin Dashboard → Settings
2. **Add More Drivers**: Register as driver and complete profile
3. **Test Payments**: Use Stripe test cards from https://stripe.com/docs/testing
4. **Setup Webhooks**:
   - In Stripe dashboard, add webhook: `http://localhost:4000/api/payments/webhook`
   - Copy webhook secret to STRIPE_WEBHOOK_SECRET
5. **Read Full Docs**: Check README.md and DEPLOYMENT.md

## Architecture Overview

```
User's Browser (localhost:3000)
         ↓
    Next.js Frontend
         ↓
    Express Backend (localhost:4000)
         ↓
    PostgreSQL Database (localhost:5432)
    Redis Cache (localhost:6379)
```

## File Structure Reference

```
ridehailing/
├── backend/                    # API & WebSocket server
│   ├── src/routes/            # API endpoints
│   ├── src/websocket/         # Real-time logic
│   ├── prisma/schema.prisma   # Database models
│   └── prisma/seed.ts         # Initial data
│
├── frontend/                   # Next.js app
│   ├── src/app/               # Pages
│   ├── src/components/        # UI components
│   └── src/lib/               # API & utilities
│
├── .env.example               # Template
├── docker-compose.yml         # Docker setup
└── README.md                  # Full documentation
```

## Support

- Read the full README.md for detailed information
- Check DEPLOYMENT.md for production deployment
- Review code comments for implementation details

## Tips for Development

1. **Hot Reload**: Both frontend and backend support hot reload
2. **Database Changes**: Run `npx prisma migrate dev` after schema changes
3. **View Database**: Run `npx prisma studio` to browse data
4. **Check Logs**:
   - Backend: Check terminal running `npm run dev:backend`
   - Frontend: Check browser console
   - Docker: `docker-compose logs -f`

5. **Reset Database**:
   ```bash
   cd backend
   npx prisma migrate reset
   npx prisma db seed
   ```

## Production Deployment

When ready to deploy:

1. Change all secrets in .env to production values
2. Use production Stripe keys (sk_live_, pk_live_)
3. Setup SSL certificate
4. Configure domain name
5. Follow DEPLOYMENT.md guide

---

Happy coding! 🚀
