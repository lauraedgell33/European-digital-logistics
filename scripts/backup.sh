#!/usr/bin/env bash
# ============================================================
# Server Backup Script — European Digital Logistics Platform
# Backs up MySQL database and uploaded files
# ============================================================

set -euo pipefail

# ── Configuration ────────────────────────────────────────
BACKUP_DIR="${BACKUP_DIR:-/var/backups/logistics}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
APP_DIR="${APP_DIR:-/var/www/logistics-platform}"

# Database credentials (from environment or .env)
DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-3306}"
DB_NAME="${DB_DATABASE:-logistics}"
DB_USER="${DB_USERNAME:-logistics}"
DB_PASS="${DB_PASSWORD:-}"

# S3 settings (optional)
S3_BUCKET="${S3_BACKUP_BUCKET:-}"
S3_PREFIX="${S3_BACKUP_PREFIX:-backups/}"

# Notification settings (optional)
NOTIFY_WEBHOOK="${NOTIFY_WEBHOOK:-}"
NOTIFY_EMAIL="${NOTIFY_EMAIL:-}"

# ── Logging ──────────────────────────────────────────────
LOG_FILE="${BACKUP_DIR}/backup.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

notify_failure() {
    local message="[BACKUP FAILURE] ${1}"
    log "ERROR: ${message}"

    # Slack/webhook notification
    if [[ -n "$NOTIFY_WEBHOOK" ]]; then
        curl -s -X POST "$NOTIFY_WEBHOOK" \
            -H 'Content-Type: application/json' \
            -d "{\"text\": \"🚨 ${message}\"}" \
            > /dev/null 2>&1 || true
    fi

    # Email notification
    if [[ -n "$NOTIFY_EMAIL" ]]; then
        echo "$message" | mail -s "[Logistics] Backup Failed" "$NOTIFY_EMAIL" 2>/dev/null || true
    fi
}

# ── Setup ────────────────────────────────────────────────
mkdir -p "$BACKUP_DIR"/{database,files}

log "========================================="
log "Starting backup — ${TIMESTAMP}"
log "========================================="

# ── Database Backup ──────────────────────────────────────
DB_BACKUP_FILE="${BACKUP_DIR}/database/db_${DB_NAME}_${TIMESTAMP}.sql.gz"

log "Backing up database: ${DB_NAME}"

if mysqldump \
    --host="$DB_HOST" \
    --port="$DB_PORT" \
    --user="$DB_USER" \
    --password="$DB_PASS" \
    --single-transaction \
    --routines \
    --triggers \
    --quick \
    "$DB_NAME" 2>>"$LOG_FILE" | gzip > "$DB_BACKUP_FILE"; then
    DB_SIZE=$(du -sh "$DB_BACKUP_FILE" | cut -f1)
    log "Database backup complete: ${DB_BACKUP_FILE} (${DB_SIZE})"
else
    notify_failure "mysqldump failed for database '${DB_NAME}'"
    exit 1
fi

# ── Files Backup ─────────────────────────────────────────
FILES_BACKUP_FILE="${BACKUP_DIR}/files/uploads_${TIMESTAMP}.tar.gz"
UPLOAD_DIR="${APP_DIR}/storage/app/public"

if [[ -d "$UPLOAD_DIR" ]]; then
    log "Backing up uploaded files from: ${UPLOAD_DIR}"

    if tar -czf "$FILES_BACKUP_FILE" -C "$(dirname "$UPLOAD_DIR")" "$(basename "$UPLOAD_DIR")" 2>>"$LOG_FILE"; then
        FILES_SIZE=$(du -sh "$FILES_BACKUP_FILE" | cut -f1)
        log "Files backup complete: ${FILES_BACKUP_FILE} (${FILES_SIZE})"
    else
        notify_failure "File backup (tar) failed for '${UPLOAD_DIR}'"
        exit 1
    fi
else
    log "Upload directory not found: ${UPLOAD_DIR} — skipping file backup"
fi

# ── Upload to S3 (optional) ─────────────────────────────
if [[ -n "$S3_BUCKET" ]]; then
    log "Uploading backups to S3: s3://${S3_BUCKET}/${S3_PREFIX}"

    if aws s3 cp "$DB_BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}database/" --quiet 2>>"$LOG_FILE"; then
        log "Database backup uploaded to S3"
    else
        notify_failure "S3 upload failed for database backup"
    fi

    if [[ -f "$FILES_BACKUP_FILE" ]]; then
        if aws s3 cp "$FILES_BACKUP_FILE" "s3://${S3_BUCKET}/${S3_PREFIX}files/" --quiet 2>>"$LOG_FILE"; then
            log "Files backup uploaded to S3"
        else
            notify_failure "S3 upload failed for files backup"
        fi
    fi
fi

# ── Cleanup Old Backups ─────────────────────────────────
log "Cleaning backups older than ${RETENTION_DAYS} days"

find "${BACKUP_DIR}/database" -name "db_*.sql.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null
find "${BACKUP_DIR}/files" -name "uploads_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete 2>/dev/null

REMAINING_DB=$(find "${BACKUP_DIR}/database" -name "db_*.sql.gz" -type f | wc -l)
REMAINING_FILES=$(find "${BACKUP_DIR}/files" -name "uploads_*.tar.gz" -type f | wc -l)

log "Remaining backups — DB: ${REMAINING_DB}, Files: ${REMAINING_FILES}"

# ── Summary ──────────────────────────────────────────────
log "Backup completed successfully"
log "========================================="
