#!/bin/bash

# Variablen
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/home/johann/backups/content-planer-$TIMESTAMP"
PROJECT_DIR="/home/johann/content-planer-app"
DB_NAME="postgres"
DB_USER="postgres"

# Backup-Verzeichnis erstellen
mkdir -p "$BACKUP_DIR"

echo "Starting backup at $(date)"

# 1. Datenbank-Backup
echo "Backing up database..."
pg_dump -U $DB_USER -h localhost -p 5432 $DB_NAME > "$BACKUP_DIR/database.sql"

# 2. Projekt-Dateien
echo "Backing up project files..."
rsync -av --exclude='node_modules' --exclude='.next' --exclude='.git' \
  "$PROJECT_DIR/" "$BACKUP_DIR/project/"

# 3. Environment-Dateien
echo "Backing up environment files..."
cp "$PROJECT_DIR/.env" "$BACKUP_DIR/.env.backup" 2>/dev/null || echo ".env not found"
cp "$PROJECT_DIR/.env.local" "$BACKUP_DIR/.env.local.backup" 2>/dev/null || echo ".env.local not found"

# 4. Package-Listen
echo "Saving package lists..."
cd "$PROJECT_DIR"
npm list --depth=0 > "$BACKUP_DIR/npm-packages.txt"

# 5. Erstelle Info-Datei
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Backup created: $(date)
Project: Content Planer App
Node version: $(node --version)
NPM version: $(npm --version)
Database: PostgreSQL
Current git branch: $(git branch --show-current 2>/dev/null || echo "not a git repo")
Current git commit: $(git rev-parse HEAD 2>/dev/null || echo "not a git repo")
EOF

# 6. Komprimiere das gesamte Backup
echo "Compressing backup..."
cd "$(dirname "$BACKUP_DIR")"
tar -czf "content-planer-$TIMESTAMP.tar.gz" "$(basename "$BACKUP_DIR")"
rm -rf "$BACKUP_DIR"

echo "Backup completed: content-planer-$TIMESTAMP.tar.gz"
