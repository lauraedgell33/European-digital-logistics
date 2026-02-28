#!/bin/bash
# LogiMarket Frontend Deploy Script (Laravel Forge)
# This script is executed after Forge pulls the latest code

cd /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/logistics-frontend

# Install Node.js dependencies
npm ci

# Build Next.js application
npm run build

# Copy robots.txt to Nginx root (Nginx serves it directly, not via proxy)
mkdir -p /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public
cp public/robots.txt /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public/robots.txt 2>/dev/null || true

# Restart PM2 process
pm2 restart logistics-frontend
