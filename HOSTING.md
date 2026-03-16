# Hosting Guide for Teacher Feedback Collection System

## Deploy to Vercel (Recommended)

This project is configured for Vercel deployment — **backend** as a serverless function and **frontend** as a static site, deployed as two separate Vercel projects.

### Prerequisites
- [Vercel account](https://vercel.com/signup)
- [Vercel CLI](https://vercel.com/docs/cli): `npm i -g vercel`
- GitHub repo with your code pushed
- A hosted PostgreSQL database (pick one):
  - **Vercel Postgres** (built-in, easiest)
  - **Neon** (free tier: https://neon.tech)
  - **Supabase** (free tier: https://supabase.com)

---

### Step 1: Create a PostgreSQL Database

#### Option A — Vercel Postgres
1. Go to https://vercel.com/dashboard → **Storage** → **Create Database** → **Postgres**
2. Copy the `DATABASE_URL` connection string

#### Option B — Neon (Free)
1. Sign up at https://neon.tech
2. Create a project → copy the connection string

#### Option C — Supabase (Free)
1. Sign up at https://supabase.com
2. Create a project → **Settings** → **Database** → copy the connection string

---

### Step 2: Deploy Backend

```powershell
cd backend

# Login to Vercel
vercel login

# Deploy (follow prompts — set as new project)
vercel

# Set environment variables
vercel env add DATABASE_URL        # paste your PostgreSQL connection string
vercel env add JWT_SECRET          # use a strong random string
vercel env add NODE_ENV            # set to: production
vercel env add FRONTEND_URL        # set after deploying frontend (e.g. https://feedback-frontend.vercel.app)

# Deploy to production
vercel --prod
```

After deploying, note the backend URL (e.g. `https://feedback-backend.vercel.app`).

#### Run Prisma Migrations
After your first deploy, push the database schema:
```powershell
# Set DATABASE_URL locally to your hosted PostgreSQL
$env:DATABASE_URL = "postgresql://user:pass@host:5432/dbname"
npx prisma db push
```

---

### Step 3: Deploy Frontend

```powershell
cd frontend

# Deploy (follow prompts — set as new project)
vercel

# Set environment variable
vercel env add VITE_API_URL        # set to: https://feedback-backend.vercel.app/api

# Redeploy with the env variable
vercel --prod
```

---

### Step 4: Connect Frontend URL to Backend CORS

Go back to your backend Vercel project and update:
```powershell
cd backend
vercel env add FRONTEND_URL        # set to: https://feedback-frontend.vercel.app
vercel --prod
```

---

### Step 5: Create Admin User

```powershell
cd backend
$env:DATABASE_URL = "postgresql://user:pass@host:5432/dbname"
node createAdmin.js
```

---

### Vercel Environment Variables Summary

| Project | Variable | Example Value |
|---------|----------|--------------|
| Backend | `DATABASE_URL` | `postgresql://user:pass@host:5432/feedback_db` |
| Backend | `JWT_SECRET` | `your-secure-random-string-here` |
| Backend | `NODE_ENV` | `production` |
| Backend | `FRONTEND_URL` | `https://feedback-frontend.vercel.app` |
| Frontend | `VITE_API_URL` | `https://feedback-backend.vercel.app/api` |

---

### One-Click Deploy (Alternative)

Push to GitHub, then import both folders as separate projects on [vercel.com/new](https://vercel.com/new):

1. **Backend**: Set root directory to `backend`, framework to "Other"
2. **Frontend**: Set root directory to `frontend`, framework to "Vite"
3. Add the environment variables listed above in each project's settings

---

## Quick Start (Local Development)

### Prerequisites
- Node.js 18+ 
- Docker & Docker Compose
- PostgreSQL (via Docker)

### 1. Start Database
```powershell
docker-compose up -d
```
This starts PostgreSQL on `localhost:5432`

### 2. Setup & Run Backend
```powershell
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5001`

### 3. Setup & Run Frontend (new terminal)
```powershell
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:5173` (Vite default)

### 4. Initialize Database
```powershell
cd backend
npx prisma migrate dev
# Or reset database:
npx prisma db push
```

### 5. Create Admin User
```powershell
node createAdmin.js
```

---

## Deployment Options

### Option A: Docker Full Stack Deployment

1. **Update docker-compose.yml** to include backend and frontend services:

```yaml
version: '3.8'
services:
  db:
    image: postgres:15
    restart: always
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: feedback_db
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build: ./backend
    restart: always
    ports:
      - "5001:5001"
    environment:
      PORT: 5001
      DATABASE_URL: "postgresql://postgres:postgres@db:5432/feedback_db"
      JWT_SECRET: "your-secure-secret-key"
      NODE_ENV: "production"
    depends_on:
      - db

  frontend:
    build: ./frontend
    restart: always
    ports:
      - "80:3000"
    environment:
      VITE_API_URL: "http://your-domain:5001/api"
    depends_on:
      - backend

volumes:
  pgdata:
```

2. **Create Dockerfile for backend** (`backend/Dockerfile`):
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --only=production
COPY . .
RUN npx prisma generate
EXPOSE 5001
CMD ["node", "server.js"]
```

3. **Create Dockerfile for frontend** (`frontend/Dockerfile`):
```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
RUN npm install -g serve
COPY --from=build /app/dist ./dist
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
```

4. **Deploy**:
```powershell
docker-compose -f docker-compose.yml up -d
```

---

### Option B: Cloud Platforms

#### **Render.com** (Free Tier Available)
1. Create PostgreSQL database on Render
2. Deploy backend as Web Service (Node.js)
3. Deploy frontend as Static Site
4. Set environment variables in dashboard

#### **Railway.app**
1. Connect GitHub repo
2. Auto-detect Node.js backend
3. Add PostgreSQL from Railway plugins
4. Deploy with one click

#### **Vercel** (Frontend) + Any Backend Host
1. Deploy frontend to Vercel
2. Deploy backend to Render/Railway/AWS
3. Update `VITE_API_URL` environment variable

#### **AWS/Azure/DigitalOcean**
- Use EC2/App Service/Droplet
- Install Node.js & PostgreSQL
- Use PM2 for process management

---

### Option C: VPS Hosting (AWS/DigitalOcean/Linode)

```bash
# On your VPS
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo apt install docker-compose

# Clone repo
git clone <your-repo> 
cd feedback

# Update docker-compose.yml with production settings
docker-compose up -d

# Setup SSL (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot certonly --standalone -d yourdomain.com
```

---

## Environment Variables

### Backend (.env)
```
PORT=5001
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="use-a-secure-random-string"
NODE_ENV="production"
SMTP_HOST="smtp.gmail.com"  # Optional: for email
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="app-password"
```

### Frontend (.env)
```
VITE_API_URL="https://api.yourdomain.com"
```

---

## Pre-Deployment Checklist

- [ ] Database configured & migrated
- [ ] Admin user created
- [ ] JWT_SECRET changed to secure value
- [ ] API CORS properly configured
- [ ] Database backups configured
- [ ] SSL certificate installed (HTTPS)
- [ ] Environment variables set
- [ ] Frontend built for production
- [ ] API URLs point to correct domain
- [ ] Database connection string verified

---

## Troubleshooting

**Backend won't connect to DB**
- Check `DATABASE_URL` format
- Verify PostgreSQL is running
- Test: `psql postgresql://user:pass@host:5432/dbname`

**Frontend API calls fail**
- Check `VITE_API_URL` environment variable
- Verify CORS settings in `server.js`
- Check network tab in browser DevTools

**Port already in use**
- Change PORT in .env
- Or kill process: `lsof -ti:5001 | xargs kill -9`

**Database schema issues**
```powershell
npx prisma migrate reset  # WARNING: Deletes data
npx prisma migrate dev    # Create migration
npx prisma db push       # Apply schema
```
