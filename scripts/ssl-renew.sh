#!/usr/bin/env bash
# ============================================================
# SSL Certificate Renewal Script — European Digital Logistics
# Renews certificates via certbot and reloads nginx
# ============================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────
LOG_FILE="${LOG_FILE:-/var/log/ssl-renew.log}"
NGINX_CONTAINER="${NGINX_CONTAINER:-logistics-nginx}"
USE_DOCKER="${USE_DOCKER:-false}"

# ── Logging ──────────────────────────────────────────────
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

log "========================================="
log "Starting SSL certificate renewal"
log "========================================="

# ── Renew Certificates ──────────────────────────────────
log "Running certbot renew..."

if certbot renew --non-interactive --quiet 2>>"$LOG_FILE"; then
    log "Certificate renewal completed successfully"
else
    CERTBOT_EXIT=$?
    if [[ $CERTBOT_EXIT -eq 0 ]]; then
        log "No certificates due for renewal"
    else
        log "ERROR: certbot renew failed with exit code ${CERTBOT_EXIT}"
        exit 1
    fi
fi

# ── Reload Nginx ─────────────────────────────────────────
log "Reloading nginx to apply new certificates..."

if [[ "$USE_DOCKER" == "true" ]]; then
    # Docker-based nginx
    if docker exec "$NGINX_CONTAINER" nginx -t 2>>"$LOG_FILE"; then
        docker exec "$NGINX_CONTAINER" nginx -s reload
        log "Nginx (Docker: ${NGINX_CONTAINER}) reloaded successfully"
    else
        log "ERROR: Nginx configuration test failed — not reloading"
        exit 1
    fi
else
    # System nginx
    if nginx -t 2>>"$LOG_FILE"; then
        systemctl reload nginx
        log "Nginx reloaded successfully"
    else
        log "ERROR: Nginx configuration test failed — not reloading"
        exit 1
    fi
fi

# ── Verify Certificate ──────────────────────────────────
DOMAINS=$(certbot certificates 2>/dev/null | grep "Domains:" | head -5 || true)
EXPIRY=$(certbot certificates 2>/dev/null | grep "Expiry Date:" | head -5 || true)

if [[ -n "$DOMAINS" ]]; then
    log "Active certificates:"
    log "  ${DOMAINS}"
    log "  ${EXPIRY}"
fi

log "SSL renewal process complete"
log "========================================="
