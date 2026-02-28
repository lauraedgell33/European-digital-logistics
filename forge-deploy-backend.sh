#!/bin/bash
# LogiMarket Backend Deploy Script (Laravel Forge)
# This script is executed after Forge pulls the latest code

cd /home/forge/european-digital-logistics-6ssyuep3.on-forge.com/current/logistics-platform

# Install PHP dependencies
composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

# Run database migrations
php artisan migrate --force

# Ensure permanent admin user exists
php artisan admin:ensure

# Cache configuration, routes, and views
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Create storage symlink if not exists
php artisan storage:link 2>/dev/null || true

# Ensure Nginx root symlink exists
cd /home/forge/european-digital-logistics-6ssyuep3.on-forge.com/current
ln -sfn logistics-platform/public public

# Restart queue worker
pm2 restart logistics-queue-worker 2>/dev/null || true

# Reload PHP-FPM
sudo -n /usr/sbin/service php8.4-fpm reload
