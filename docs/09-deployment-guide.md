# Phase 14 — Production Deployment Guide

This guide provides end-to-end instructions for deploying DeskShare to production environments.

---

## 1. Production Architecture Overview

DeskShare deploys as a containerized stack designed for reliability, isolation, and security:

```
                            ┌──────────────────────────────────────────────┐
                            │                 Client Browser               │
                            └──────────────────────┬───────────────────────┘
                                                   │ HTTPS / HTTP
                                                   ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ Docker Host / Private Network (`deskshare-network`)                                    │
│                                                                                        │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Nginx (Reverse Proxy & Static Asset Server) — Port 80                          │   │
│   │                                                                                │   │
│   │  • Static files & SPA routing: /usr/share/nginx/html                           │   │
│   │  • Gzip compression & immutable asset caching                                  │   │
│   │  • Security headers (X-Frame-Options, X-Content-Type-Options)                   │   │
│   │  • Proxy /api/v1/  ───────► http://backend:8080/api/v1/                        │   │
│   │  • Proxy /actuator/ ──────► http://backend:8080/actuator/                      │   │
│   └───────────────────────┬────────────────────────────────────────────────────────┘   │
│                           │ Internal HTTP                                              │
│                           ▼                                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ Spring Boot 3.5.7 API (Eclipse Temurin 21 JRE) — Port 8080                     │   │
│   │                                                                                │   │
│   │  • Unprivileged non-root user `deskshare` (UID 1001)                           │   │
│   │  • Container-aware JVM memory limits (-XX:MaxRAMPercentage=75.0)               │   │
│   │  • Stateless JWT authentication                                                │   │
│   │  • Actuator healthcheck: /actuator/health                                      │   │
│   └───────────────────────┬────────────────────────────────────────────────────────┘   │
│                           │ MongoDB Driver (Replica Set transactions)                  │
│                           ▼                                                            │
│   ┌────────────────────────────────────────────────────────────────────────────────┐   │
│   │ MongoDB 8.0 Replica Set (`rs0`) — Port 27017                                   │   │
│   │                                                                                │   │
│   │  • Persistent Docker volume: `deskshare-mongo-prod-data`                       │   │
│   │  • Multi-document atomic transactions enabled                                  │   │
│   └────────────────────────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Quick Start: Deploying with Docker Compose

### Prerequisites
- Docker Engine 24+ and Docker Compose v2+
- Open port 80 (and optionally 443 for TLS)

### Step 1: Configure Environment Variables
Create or verify your production `.env` file in the project root:

```bash
# Generate a strong 256-bit secret for JWT signing
JWT_SECRET=$(openssl rand -hex 32)
echo "JWT_SECRET=${JWT_SECRET}" > .env
echo "SPRING_PROFILES_ACTIVE=prod" >> .env
```

### Step 2: Build and Launch the Stack
Execute the production Compose configuration:

```bash
docker compose -f docker-compose.prod.yml up --build -d
```

### Step 3: Verify Container Health
Check container statuses and healthchecks:

```bash
docker compose -f docker-compose.prod.yml ps
```

All services (`deskshare-mongo-prod`, `deskshare-mongo-init-prod`, `deskshare-backend-prod`, `deskshare-frontend-prod`) should report `healthy` or `exited (0)` for the one-shot initializer.

### Step 4: Validate Endpoints
```bash
# Frontend & Nginx health
curl -I http://localhost/health

# Spring Boot API health (through reverse proxy)
curl -s http://localhost/actuator/health

# Public API health check
curl -s http://localhost/api/v1/health
```

---

## 3. Environment Variables Reference

| Variable | Target Component | Default Value | Production Recommendation |
|---|---|---|---|
| `MONGODB_URI` | Backend | `mongodb://mongo:27017/deskshare?replicaSet=rs0` | Use internal Docker service name or external MongoDB Atlas connection URI with TLS. |
| `SERVER_PORT` | Backend | `8080` | Keep internal `8080`; Nginx maps public traffic. |
| `JWT_SECRET` | Backend | Built-in fallback string | **Must be overridden** with a secure string generated via `openssl rand -hex 32`. |
| `JWT_EXPIRATION_MS` | Backend | `3600000` (1 hour) | Adjust based on security policy (e.g. 1 hour to 24 hours). |
| `SPRING_PROFILES_ACTIVE` | Backend | `prod` | `prod` disables noisy debug logs and configures production settings. |
| `CORS_ALLOWED_ORIGINS` | Backend | `http://localhost,http://localhost:80` | Set to your public domain (e.g. `https://deskshare.yourdomain.com`). |

---

## 4. Production Hardening Features

1. **Non-Root Container Execution:**
   The backend container creates a dedicated system user `deskshare` and drops root privileges before executing Java.
2. **Nginx Security Headers:**
   - `X-Frame-Options: SAMEORIGIN` (mitigates clickjacking)
   - `X-Content-Type-Options: nosniff` (mitigates MIME-type sniffing)
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`
3. **Static File Optimization:**
   Hashed JavaScript, CSS, and media bundles are served with `Cache-Control: public, max-age=31536000, immutable`, while `index.html` is served with `Cache-Control: no-cache` to ensure instant updates upon new deployments.
4. **Gzip Compression:**
   Text, JSON, CSS, JS, and SVG files are dynamically compressed to reduce bandwidth and initial page load times.
5. **Multi-Stage Builds:**
   Build tools (Maven, JDK, npm, Node.js) and source code are excluded from final runtime images, drastically reducing attack surface and image size.

---

## 5. Cloud Hosting Options

### Option A: Cloud VM (DigitalOcean Droplet, AWS EC2, Hetzner, Linode)
1. Install Docker and Docker Compose on Ubuntu 22.04 LTS / 24.04 LTS:
   ```bash
   sudo apt update && sudo apt install -y docker.io docker-compose-v2
   ```
2. Clone repository and run `docker-compose.prod.yml`.
3. Put Certbot / Let's Encrypt in front of Nginx or use Cloudflare for automatic SSL/TLS termination.

### Option B: Render.com (Recommended Free Cloud Hosting)

DeskShare provides first-class support for [Render.com](https://render.com) using a free Web Service (backend), free Static Site (frontend), and MongoDB Atlas (database):

#### Method 1: Render Blueprint (One-Click)
1. Commit and push the project including `render.yaml` to your GitHub repository.
2. In the [Render Dashboard](https://dashboard.render.com), click **New +** > **Blueprint**.
3. Connect your GitHub repository. Render will automatically parse `render.yaml` and configure:
   - `deskshare-api`: Docker Web Service
   - `deskshare-ui`: Static Site with SPA redirect rules
4. In the setup screen, fill in:
   - `MONGODB_URI`: Your MongoDB Atlas connection URI (e.g., `mongodb+srv://user:pass@cluster.mongodb.net/deskshare?retryWrites=true&w=majority`).
   - `CORS_ALLOWED_ORIGINS`: Your frontend Render URL (e.g. `https://deskshare-ui.onrender.com`).
   - `BACKEND_URL`: Your backend Render URL (e.g. `https://deskshare-api.onrender.com`).
5. Click **Apply**.

#### Method 2: Manual Setup on Render
1. **Database:** Create a free M0 cluster on [MongoDB Atlas](https://cloud.mongodb.com) and copy the connection string.
2. **Backend Service:**
   - **Type:** Web Service
   - **Runtime:** Docker (`backend/Dockerfile`, Root Directory: `backend`)
   - **Environment Variables:**
     - `MONGODB_URI`: your MongoDB Atlas URI
     - `JWT_SECRET`: 64-char hex string (`openssl rand -hex 32`)
     - `CORS_ALLOWED_ORIGINS`: `https://your-frontend.onrender.com`
     - `SPRING_PROFILES_ACTIVE`: `prod`
   - **Health Check Path:** `/actuator/health`
3. **Frontend Static Site:**
   - **Type:** Static Site
   - **Root Directory:** `frontend`
   - **Build Command:** `chmod +x render-build.sh && ./render-build.sh`
   - **Publish Directory:** `dist/frontend/browser`
   - **Environment Variables:**
     - `BACKEND_URL`: `https://your-backend.onrender.com`
   - **Redirects/Rewrites:**
     - Source: `/*`
     - Destination: `/index.html`
     - Action: `Rewrite`

---

## 6. Maintenance and Operations

### Inspecting Logs
```bash
# View backend application logs
docker compose -f docker-compose.prod.yml logs -f backend

# View frontend access/proxy logs
docker compose -f docker-compose.prod.yml logs -f frontend

# View MongoDB replica set logs
docker compose -f docker-compose.prod.yml logs -f mongo
```

### Database Backups (mongodump)
```bash
# Create timestamped dump
docker exec -t deskshare-mongo-prod mongodump --db deskshare --archive=/data/db/deskshare_$(date +%Y%m%d).archive

# Copy backup to host
docker cp deskshare-mongo-prod:/data/db/deskshare_$(date +%Y%m%d).archive ./backups/
```

### Database Restore (mongorestore)
```bash
docker exec -i deskshare-mongo-prod mongorestore --nsInclude="deskshare.*" --archive < ./backups/deskshare_backup.archive
```

### Rolling Upgrades
```bash
git pull origin main
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d --no-deps backend frontend
```
