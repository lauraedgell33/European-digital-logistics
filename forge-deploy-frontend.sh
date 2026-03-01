#!/bin/bash
# LogiMarket Frontend Deploy Script (Laravel Forge)
# This script is executed after Forge pulls the latest code

cd /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/logistics-frontend

# Install Node.js dependencies
npm ci

# Build Next.js application
npm run build

# Copy static files to Nginx root (Nginx serves directly, not via proxy)
mkdir -p /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public
cp public/robots.txt /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public/robots.txt 2>/dev/null || true
cp public/sw.js /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public/sw.js 2>/dev/null || true
cp public/manifest.json /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/public/manifest.json 2>/dev/null || true

# Copy public directory to standalone output (Next.js standalone doesn't include public/)
if [ -d ".next/standalone" ]; then
  cp -r public .next/standalone/public 2>/dev/null || true
fi

# Restart PM2 process
pm2 restart logistics-frontend
