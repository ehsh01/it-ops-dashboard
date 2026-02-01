# IT Ops Dashboard

## Overview
An IT Operations Console for University of Michigan healthcare IT administrators. The dashboard consolidates action items from multiple sources (ServiceNow tickets, Outlook emails, Microsoft Teams messages) into a unified "Focus Mode" feed with intelligent prioritization.

## Recent Changes (Feb 2026)
- Added username/password authentication with session management
- Protected all API routes requiring login
- Added login/register pages with secure password hashing (bcrypt)
- PostgreSQL session storage via connect-pg-simple

## Project Architecture

### Tech Stack
- **Frontend**: React + Vite + TypeScript
- **Backend**: Express.js
- **Database**: PostgreSQL with Drizzle ORM
- **Styling**: Tailwind CSS + shadcn/ui

### Key Files
- `server/index.ts` - Express server with session middleware
- `server/routes.ts` - API routes (all protected with requireAuth)
- `server/auth.ts` - Authentication utilities (hash, verify, middleware)
- `server/storage.ts` - Database operations
- `shared/schema.ts` - Drizzle schema (users, sessions, actionItems, eodTasks)
- `client/src/App.tsx` - Router with auth protection
- `client/src/pages/Login.tsx` - Login/Register page

### Authentication Flow
1. User visits any page → check `/api/user` endpoint
2. If 401, redirect to `/login`
3. Login with username/password → creates session in PostgreSQL
4. Session cookie (`connect.sid`) stored in browser
5. All API requests include credentials

### Database Tables
- `users` - User accounts (id, username, password hash, displayName)
- `session` - Express sessions (managed by connect-pg-simple)
- `action_items` - Task items from various sources
- `eod_tasks` - End of day checklist items

## Deployment (DigitalOcean)

### Production Setup
- Server: 129.212.182.125
- Domain: itopsconsole.com
- App directory: /var/www/it-ops-dashboard
- Process manager: PM2 (it-ops-dashboard)
- Port: 5003 (Nginx proxies 80/443 → 5003)

### Deployment Steps
```bash
ssh root@129.212.182.125
cd /var/www/it-ops-dashboard
git fetch origin && git reset --hard origin/main
npm install
npm run build
pm2 restart it-ops-dashboard
```

### Environment Variables (Production .env)
- DATABASE_URL - PostgreSQL connection string (with sslmode=no-verify)
- SESSION_SECRET - Secret for session encryption
- NODE_ENV=production

## Design Guidelines
- Primary color: Orange (#F47321)
- Green for "All Clear" status
- Orange for "Action Required" status

## User Preferences
- Healthcare IT administrator context
- Familiar with ServiceNow work orders
- Values decision-support with impact context
