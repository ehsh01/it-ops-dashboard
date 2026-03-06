# Deployment Workflow: Local → GitHub → DigitalOcean

## Quick Reference

| Step | Where | Command |
|------|-------|---------|
| 1. Make changes | Local (Cursor) | Edit code |
| 2. Build & verify | Local | `npm run build` |
| 3. Commit & push | Local | `git add -A && git commit -m "..." && git push` |
| 4. Deploy staging | DigitalOcean | `git pull && npm run build && pm2 restart itops-staging --update-env` |
| 5. Test staging | Browser | Open `https://staging.itopsconsole.com` |
| 6. Deploy production | DigitalOcean | `pm2 restart itops-api --update-env` |

---

## Initial Server Setup (One-Time)

### 1. App Already on Server

The app is already cloned and running on the server. You just need to add staging.

### 2. Create Staging Database

In your DigitalOcean database cluster control panel:
1. Go to **Databases** → Select your cluster
2. Click **Users & Databases** tab
3. Create a new database: `it_ops_staging_db`

(Production database `it_ops_dashboard` already exists.)

### 3. Create Environment Files

**Production** (`.env`) — update existing or create:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://user:password@your-cluster:25060/it_ops_dashboard?sslmode=require
SESSION_SECRET=your-random-production-secret-at-least-32-chars
PORT=5003
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=IT Ops Console <noreply@itopsconsole.com>
APP_URL=https://itopsconsole.com
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
EOF
```

**Staging** (`.env.staging`) — new file:

```bash
cat > .env.staging << 'EOF'
DATABASE_URL=postgresql://user:password@your-cluster:25060/it_ops_staging_db?sslmode=require
SESSION_SECRET=your-random-staging-secret-different-from-prod
PORT=5006
RESEND_API_KEY=your-resend-key
RESEND_FROM_EMAIL=IT Ops Console <noreply@itopsconsole.com>
APP_URL=https://staging.itopsconsole.com
MICROSOFT_CLIENT_ID=your-client-id
MICROSOFT_CLIENT_SECRET=your-client-secret
MICROSOFT_TENANT_ID=your-tenant-id
EOF
```

### 4. Initialize Database Schema

```bash
# Push schema to production database
npm run db:push

# Push schema to staging database
DATABASE_URL="postgresql://...staging_db..." npm run db:push
```

### 5. Migrate to ecosystem.config.cjs

The existing `it-ops-dashboard` PM2 process was started manually. Replace it with the ecosystem config:

```bash
# Stop and remove the old process
pm2 delete it-ops-dashboard

# Build and start both prod + staging via ecosystem config
npm run build
pm2 start ecosystem.config.cjs

# Save process list
pm2 save
```

### 6. Configure Nginx

Add server blocks for both domains:

```nginx
# Production: itopsconsole.com
server {
    listen 80;
    server_name itopsconsole.com;

    location / {
        proxy_pass http://localhost:5003;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}

# Staging: staging.itopsconsole.com
server {
    listen 80;
    server_name staging.itopsconsole.com;

    location / {
        proxy_pass http://localhost:5006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Then enable and get SSL:

```bash
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d itopsconsole.com -d staging.itopsconsole.com
```

---

## Day-to-Day Deploy Workflow

### Push Code (from Cursor / local)

```bash
git add -A
git status          # review changes
git commit -m "Your change description"
git push origin main
```

### Deploy to Staging (SSH into server)

```bash
cd /var/www/it-ops-dashboard
git pull
npm install         # if package.json changed
npm run build
pm2 restart itops-staging --update-env
```

### Test Staging

Open `https://staging.itopsconsole.com` and verify everything works.

### Deploy to Production

If staging looks good:

```bash
pm2 restart itops-api --update-env
```

---

## Environment Variable Changes

PM2 `restart` does **NOT** re-read `.env` files — it reuses stored env. When `.env` or `.env.staging` changes:

```bash
# Staging
pm2 delete itops-staging && pm2 start ecosystem.config.cjs --only itops-staging

# Production
pm2 delete itops-api && pm2 start ecosystem.config.cjs --only itops-api
```

---

## Useful PM2 Commands

```bash
pm2 list                    # List all apps
pm2 logs itops-staging      # View staging logs
pm2 logs itops-api          # View production logs
pm2 restart itops-staging   # Restart staging
pm2 restart itops-api       # Restart production
pm2 stop itops-staging      # Stop staging when not needed
pm2 monit                   # Real-time monitoring
```

---

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | **Yes** | PostgreSQL connection string |
| `SESSION_SECRET` | **Yes** | Session signing key (min 32 chars, unique per env) |
| `PORT` | **Yes** | Server port (prod: 5003, staging: 5006) |
| `APP_URL` | No | Base URL for email links |
| `RESEND_API_KEY` | No | Resend API key for sending invitation emails |
| `RESEND_FROM_EMAIL` | No | From address for emails |
| `MICROSOFT_CLIENT_ID` | No | Microsoft 365 OAuth app client ID |
| `MICROSOFT_CLIENT_SECRET` | No | Microsoft 365 OAuth app client secret |
| `MICROSOFT_TENANT_ID` | No | Microsoft tenant ID (defaults to "common") |
