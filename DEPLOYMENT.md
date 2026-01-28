# Deploying IT Ops Dashboard to DigitalOcean

## Prerequisites
- Node.js 18+ on your server
- Access to your DigitalOcean database cluster
- Git installed on your server

## 1. Create Database in Your Cluster

In your DigitalOcean control panel:
1. Go to **Databases** → Select your cluster
2. Click **Users & Databases** tab
3. Create a new database named `it_ops_dashboard`
4. Note your connection string (you'll need it for the next step)

Your connection string will look like:
```
postgresql://username:password@your-cluster-host:25060/it_ops_dashboard?sslmode=require
```

## 2. Clone Repository on Your Server

```bash
ssh your-server

# Clone the repository
git clone https://github.com/ehsh01/it-ops-dashboard.git
cd it-ops-dashboard

# Install dependencies
npm install
```

## 3. Configure Environment Variables

Create a `.env` file on your server:

```bash
cat > .env << 'EOF'
DATABASE_URL=postgresql://username:password@your-cluster-host:25060/it_ops_dashboard?sslmode=require
NODE_ENV=production
PORT=5000
EOF
```

Replace the `DATABASE_URL` with your actual DigitalOcean database connection string.

## 4. Initialize Database Schema

```bash
npm run db:push
```

This will create all the necessary tables in your DigitalOcean database.

## 5. Build and Run

```bash
# Build the application
npm run build

# Start in production mode
npm start
```

## 6. Run with PM2 (Recommended)

For production, use PM2 to keep the app running:

```bash
# Install PM2 globally
npm install -g pm2

# Start the application
pm2 start npm --name "it-ops-dashboard" -- start

# Save the process list
pm2 save

# Set up auto-start on server reboot
pm2 startup
```

## 7. Configure Nginx (Optional)

If you want to serve the app on port 80/443:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NODE_ENV` | Set to `production` for deployment | Yes |
| `PORT` | Server port (default: 5000) | No |

## Updating the App

To pull updates from GitHub:

```bash
cd it-ops-dashboard
git pull origin main
npm install
npm run build
pm2 restart it-ops-dashboard
```
