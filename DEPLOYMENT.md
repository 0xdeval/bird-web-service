# Deployment Guide

Quick deployment instructions for popular platforms.

## Table of Contents

- [Railway (Recommended)](#railway-recommended)
- [Render](#render)
- [Fly.io](#flyio)
- [Docker](#docker)
- [Heroku](#heroku)
- [AWS](#aws)
- [Google Cloud Run](#google-cloud-run)
- [DigitalOcean](#digitalocean)

---

## Railway (Recommended)

Railway is the easiest option for most users.

### 1. Prepare Your Repository

```bash
git clone https://github.com/your-username/bird-api.git
cd bird-api
git remote set-url origin https://github.com/your-username/bird-api.git
git push -u origin main
```

### 2. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Sign up/log in with GitHub
3. Click **New Project**
4. Select **Deploy from GitHub Repo**
5. Authorize GitHub and select your `bird-api` repository
6. Click **Deploy**

### 3. Add Environment Variables

In Railway dashboard:
1. Open your **bird-api** service
2. Click **Variables**
3. Add:
   - `AUTH_TOKEN`: Your X auth token
   - `CT0`: Your X ct0 cookie
   - `API_SECRET`: Your API secret key
   - `PORT`: `3000`

4. Click **Save** (auto-redeploys)

### 4. Get Public URL

In the **Domains** section, copy your public URL.

Test it:
```bash
curl "https://your-railway-url.up.railway.app/health"
```

---

## Render

### 1. Push Code to GitHub

Same as Railway above.

### 2. Create Service on Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click **New** → **Web Service**
4. Select your `bird-api` repository
5. Configure:
   - **Name**: bird-api
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free or Paid

6. Click **Create Web Service**

### 3. Add Environment Variables

In Render dashboard:
1. Go to your service
2. Click **Environment**
3. Add your variables (same as Railway)
4. Click **Save**

Service auto-deploys and gives you a public URL.

### Limitations

- Free tier: auto-sleeps after 15 minutes of inactivity
- Paid tier: always-on

---

## Fly.io

### 1. Install flyctl

```bash
# macOS
brew install flyctl

# Linux / other
curl -L https://fly.io/install.sh | sh
```

### 2. Deploy from Local Directory

```bash
flyctl auth login

cd bird-api

flyctl launch
# Follow prompts; choose a region (e.g., us-west1)
```

### 3. Set Secrets

```bash
flyctl secrets set \
  AUTH_TOKEN="your_auth_token" \
  CT0="your_ct0" \
  API_SECRET="your_secret"
```

### 4. Deploy

```bash
flyctl deploy
```

### 5. Get Public URL

```bash
flyctl info
# Shows your public URL, e.g., bird-api-xxxx.fly.dev
```

---

## Docker

For custom deployments (own server, Kubernetes, etc.).

### 1. Build Locally

```bash
docker build -t bird-api .
docker run -p 3000:3000 \
  -e AUTH_TOKEN="your_token" \
  -e CT0="your_ct0" \
  -e API_SECRET="your_secret" \
  bird-api
```

### 2. Push to Docker Registry

```bash
# Docker Hub
docker tag bird-api your-dockerhub-username/bird-api
docker push your-dockerhub-username/bird-api

# Or private registry (e.g., ECR, GCR)
docker tag bird-api your-registry/bird-api
docker push your-registry/bird-api
```

### 3. Deploy Using Docker Compose

```bash
docker-compose up -d
```

See `docker-compose.yml` for configuration.

---

## Heroku

⚠️ **Note**: Heroku removed free tier. Paid dynos start at ~$7/month.

```bash
# Login
heroku login

# Create app
heroku create bird-api

# Add secrets
heroku config:set \
  AUTH_TOKEN="your_token" \
  CT0="your_ct0" \
  API_SECRET="your_secret"

# Deploy
git push heroku main
```

---

## AWS

### Option 1: ECS (Elastic Container Service)

1. Push Docker image to ECR (Elastic Container Registry)
2. Create ECS cluster
3. Create task definition pointing to your image
4. Create service from task definition
5. Set environment variables in task definition
6. Assign security group and load balancer

### Option 2: Elastic Beanstalk

```bash
# Install EB CLI
pip install awsebcli

# Initialize
eb init -p docker bird-api

# Create environment
eb create bird-api-env

# Set environment variables
eb setenv AUTH_TOKEN="..." CT0="..." API_SECRET="..."

# Deploy
git push origin main  # Auto-deploys via CI/CD
```

### Option 3: Lambda (Serverless)

Requires significant changes to `server.js` to work with API Gateway.

See AWS documentation for Lambda + API Gateway setup.

---

## Google Cloud Run

### 1. Push Image to Container Registry

```bash
# Build and push
gcloud builds submit --tag gcr.io/YOUR_PROJECT/bird-api

# Or manually
docker tag bird-api gcr.io/YOUR_PROJECT/bird-api
docker push gcr.io/YOUR_PROJECT/bird-api
```

### 2. Deploy

```bash
gcloud run deploy bird-api \
  --image gcr.io/YOUR_PROJECT/bird-api \
  --platform managed \
  --region us-central1 \
  --set-env-vars AUTH_TOKEN="...",CT0="...",API_SECRET="..."
```

### 3. Get Public URL

```bash
gcloud run services describe bird-api --platform managed
# Shows your public URL
```

---

## DigitalOcean

### Option 1: App Platform

1. Go to [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Click **Create** → **App**
3. Connect GitHub repository
4. Choose `bird-api`
5. Configure:
   - **Build command**: `npm install`
   - **Run command**: `npm start`
6. Add environment variables
7. Deploy

### Option 2: Droplet (VPS)

```bash
# SSH into your droplet
ssh root@YOUR_DROPLET_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repo
git clone https://github.com/your-username/bird-api.git
cd bird-api

# Install dependencies
npm install

# Set environment variables
export AUTH_TOKEN="..."
export CT0="..."
export API_SECRET="..."

# Start (background)
nohup npm start > app.log 2>&1 &

# Or use PM2
npm install -g pm2
pm2 start server.js --name "bird-api"
pm2 startup
pm2 save
```

### Option 3: Docker on Droplet

```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone repo, build, run
git clone https://github.com/your-username/bird-api.git
cd bird-api
docker build -t bird-api .
docker run -d -p 3000:3000 \
  -e AUTH_TOKEN="..." \
  -e CT0="..." \
  -e API_SECRET="..." \
  bird-api
```

---

## General Deployment Checklist

Before deploying:

- [ ] Have you extracted X credentials? (See SETUP.md)
- [ ] Have you generated a unique `API_SECRET`?
- [ ] Have you updated `package.json` with your project info?
- [ ] Have you tested locally: `npm start` + `curl /health`?
- [ ] Have you added `node_modules/` and `.env` to `.gitignore`?

After deploying:

- [ ] Can you access `/health` endpoint?
- [ ] Can you authenticate with `x-api-key` header?
- [ ] Can you test `/whoami` to verify credentials?
- [ ] Can you test `/search?q=test&n=1`?
- [ ] Are you monitoring logs for errors?

---

## Monitoring & Logs

### Railway

```bash
# View logs
railway logs

# In Dashboard: Services → bird-api → Logs
```

### Render

```bash
# In Dashboard: Services → bird-api → Logs
```

### Fly.io

```bash
flyctl logs
```

### Docker / Local

```bash
docker logs bird-api
# Or check stdout/stderr
```

---

## Updating Credentials

Your X credentials expire every 2-4 weeks.

### Update on Railway

1. Go to Railway dashboard
2. Open bird-api service
3. Click **Variables**
4. Update `AUTH_TOKEN` and `CT0`
5. Click **Save** (auto-redeploys)

### Update on Render

1. Go to Render dashboard
2. Open bird-api service
3. Click **Environment**
4. Update variables
5. Click **Save** (auto-redeploys)

### Update on Fly.io

```bash
flyctl secrets set AUTH_TOKEN="..." CT0="..."
# Auto-deploys
```

### Update on Docker

```bash
docker run -e AUTH_TOKEN="..." -e CT0="..." ...
# Or update docker-compose.yml and restart
```

---

## Troubleshooting Deployments

### "bird: command not found"

Make sure the Dockerfile correctly installs the bird CLI:
```dockerfile
RUN git clone https://github.com/jawond/bird.git /opt/bird \
    && cd /opt/bird \
    && npm install \
    && npm link
```

### "Port already in use"

Ensure the container is using port 3000 correctly. Check `PORT` environment variable.

### "Memory exceeded"

Running out of memory? Try:
- Reducing the `n` parameter (fewer results)
- Increasing server RAM (upgrade plan)
- Restarting service regularly (cron job)

### "Timeout errors"

X is rate-limiting or slow. Try:
- Reducing request frequency
- Adding delays between requests
- Waiting 15+ minutes before retrying

---

## Need Help?

- See **[SETUP.md](SETUP.md)** for detailed credential setup
- See **[USAGE.md](USAGE.md)** for integration examples
- Open an issue on GitHub
- Check the [bird CLI docs](https://github.com/jawond/bird)
