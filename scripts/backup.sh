#!/bin/bash

# Backup-Script für Content-Planer App
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$HOME/backups/content-planer/$BACKUP_DATE"

echo "==================================="
echo "Content-Planer Backup Script"
echo "==================================="
echo "Starting backup at $(date)"
echo "Backup directory: $BACKUP_DIR"
echo ""

# Erstelle Backup-Verzeichnis
mkdir -p "$BACKUP_DIR"

# 1. Git Status
echo "1. Saving git status..."
cd "$HOME/content-planer-app"
git status > "$BACKUP_DIR/git-status.txt"
git log --oneline -20 > "$BACKUP_DIR/git-log.txt"
echo "   ✓ Git status saved"

# 2. Datenbank Backup
echo "2. Backing up database..."
# Verwende die Datenbank-Verbindung aus .env
pg_dump -U postgres -h localhost -d postgres > "$BACKUP_DIR/database.sql" 2>/dev/null
if [ $? -eq 0 ]; then
    gzip "$BACKUP_DIR/database.sql"
    echo "   ✓ Database backed up and compressed"
else
    echo "   ⚠ Database backup failed - check connection"
fi

# 3. Projekt-Dateien
echo "3. Backing up project files..."
tar --exclude='node_modules' --exclude='.next' --exclude='.git' \
    -czf "$BACKUP_DIR/project-files.tar.gz" \
    -C "$HOME" content-planer-app/
echo "   ✓ Project files backed up"

# 4. Environment Files
echo "4. Backing up environment files..."
cp "$HOME/content-planer-app/.env" "$BACKUP_DIR/" 2>/dev/null || true
cp "$HOME/content-planer-app/.env.local" "$BACKUP_DIR/" 2>/dev/null || true
cp "$HOME/content-planer-app/.env.production" "$BACKUP_DIR/" 2>/dev/null || true
cp "$HOME/content-planer-app/prisma/schema.prisma" "$BACKUP_DIR/"
echo "   ✓ Environment files backed up"

# 5. Package Information
echo "5. Saving package information..."
cp "$HOME/content-planer-app/package.json" "$BACKUP_DIR/"
cp "$HOME/content-planer-app/package-lock.json" "$BACKUP_DIR/"
echo "   ✓ Package files backed up"

# 6. Erstelle Backup-Info
echo "6. Creating backup info..."
cat > "$BACKUP_DIR/backup-info.txt" << EOF
Backup Information
==================
Backup created: $(date)
Backup directory: $BACKUP_DIR

Git Information:
- Branch: $(git branch --show-current)
- Commit: $(git rev-parse HEAD)
- Status: See git-status.txt

System Information:
- Node version: $(node --version)
- NPM version: $(npm --version)
- User: $(whoami)
- Hostname: $(hostname)

Database: postgres (PostgreSQL)

Files included:
- Database dump (compressed)
- Project files (excluding node_modules, .next, .git)
- Environment files (.env*)
- Prisma schema
- Package files (package.json, package-lock.json)
EOF
echo "   ✓ Backup info created"

# 7. Erstelle Restore-Script
echo "7. Creating restore script..."
cat > "$BACKUP_DIR/restore.sh" << 'RESTORE_EOF'
#!/bin/bash
echo "==================================="
echo "Content-Planer Restore Script"
echo "==================================="
echo "This script will restore from backup"
echo "WARNING: This will overwrite existing data!"
echo ""
read -p "Do you want to continue? (y/N) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo "1. Restoring database..."
    gunzip -c database.sql.gz | psql -U postgres -h localhost -d postgres
    if [ $? -eq 0 ]; then
        echo "   ✓ Database restored"
    else
        echo "   ✗ Database restore failed"
    fi
    
    echo ""
    echo "2. To restore project files, run:"
    echo "   tar -xzf project-files.tar.gz -C $HOME"
    echo ""
    echo "3. To restore environment files:"
    echo "   cp .env* ~/content-planer-app/"
    echo ""
    echo "4. After restoring files, run:"
    echo "   cd ~/content-planer-app"
    echo "   npm install"
    echo "   npx prisma generate"
else
    echo "Restore cancelled."
fi
RESTORE_EOF
chmod +x "$BACKUP_DIR/restore.sh"
echo "   ✓ Restore script created"

# 8. Abschlussbericht
echo ""
echo "==================================="
echo "Backup completed successfully!"
echo "==================================="
echo "Location: $BACKUP_DIR"
echo ""
echo "Backup contents:"
ls -lah "$BACKUP_DIR"
echo ""
echo "Total backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"
echo ""
echo "To restore from this backup, run:"
echo "  $BACKUP_DIR/restore.sh"
echo "==================================="
