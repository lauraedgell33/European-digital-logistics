#!/bin/bash
# LogiMarket Frontend Deploy Script (Laravel Forge)
# This script is executed after Forge pulls the latest code

cd /home/forge/european-digital-logistics-oujbb00j.on-forge.com/current/logistics-frontend

# Install Node.js dependencies
npm ci

# Build Next.js application
npm run build

# Restart PM2 process
pm2 restart logistics-frontend
