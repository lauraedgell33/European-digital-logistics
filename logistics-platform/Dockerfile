# ============================================================
# Production Dockerfile — Laravel 11 (PHP 8.3 FPM Alpine)
# ============================================================

FROM php:8.3-fpm-alpine AS base

# ── System dependencies ─────────────────────────────────────
RUN apk add --no-cache \
    curl \
    git \
    icu-dev \
    icu-libs \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libwebp-dev \
    libzip-dev \
    oniguruma-dev \
    zip \
    unzip \
    shadow \
    linux-headers \
    $PHPIZE_DEPS

# ── PHP extensions ──────────────────────────────────────────
RUN docker-php-ext-configure gd \
        --with-freetype \
        --with-jpeg \
        --with-webp \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        bcmath \
        gd \
        intl \
        zip \
        opcache \
        pcntl \
        exif \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del $PHPIZE_DEPS linux-headers

# ── OPcache production config ──────────────────────────────
RUN { \
    echo 'opcache.enable=1'; \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=64'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.jit=1255'; \
    echo 'opcache.jit_buffer_size=128M'; \
    echo 'opcache.save_comments=1'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# ── PHP production config ──────────────────────────────────
RUN { \
    echo 'memory_limit=256M'; \
    echo 'upload_max_filesize=64M'; \
    echo 'post_max_size=64M'; \
    echo 'max_execution_time=60'; \
    echo 'expose_php=Off'; \
    echo 'display_errors=Off'; \
    echo 'log_errors=On'; \
    echo 'error_log=/var/log/php-errors.log'; \
} > /usr/local/etc/php/conf.d/production.ini

# ── Composer ────────────────────────────────────────────────
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# ── Working directory ───────────────────────────────────────
WORKDIR /var/www/html

# ── Install dependencies (cached layer) ────────────────────
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --optimize-autoloader

# ── Copy application code ──────────────────────────────────
COPY . .

# ── Post-install optimisations ─────────────────────────────
RUN composer dump-autoload --optimize --classmap-authoritative \
    && php artisan config:cache \
    && php artisan route:cache \
    && php artisan view:cache \
    && php artisan event:cache

# ── Permissions ─────────────────────────────────────────────
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 775 storage bootstrap/cache \
    && mkdir -p storage/logs storage/framework/{cache,sessions,views} \
    && chown -R www-data:www-data storage bootstrap/cache

# ── PHP-FPM tuning ─────────────────────────────────────────
RUN { \
    echo '[www]'; \
    echo 'pm = dynamic'; \
    echo 'pm.max_children = 50'; \
    echo 'pm.start_servers = 10'; \
    echo 'pm.min_spare_servers = 5'; \
    echo 'pm.max_spare_servers = 20'; \
    echo 'pm.max_requests = 1000'; \
} > /usr/local/etc/php-fpm.d/zz-production.conf

EXPOSE 9000

USER www-data

CMD ["php-fpm"]
