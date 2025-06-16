#!/bin/bash

# Überprüfung der Argumente
if [ "$#" -ne 1 ]; then
    echo "Usage: $0 <backup-file.tar.gz>"
    exit 1
fi

BACKUP_FILE=$1
RESTORE_DIR="/tmp/restore-$$"

# Entpacken
echo "Extracting backup..."
mkdir -p "$RESTORE_DIR"
tar -xzf "$BACKUP_FILE" -C "$RESTORE_DIR"

# Finde das Backup-Verzeichnis
BACKUP_DIR=$(find "$RESTORE_DIR" -maxdepth 1 -type d -name "content-planer-*" | head -1)

if [ -z "$BACKUP_DIR" ]; then
    echo "Error: Backup directory not found in archive"
    exit 1
fi

echo "Found backup directory: $BACKUP_DIR"

# Zeige Backup-Info
cat "$BACKUP_DIR/backup-info.txt"
echo ""
read -p "Do you want to restore this backup? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 1. Restore Database
    echo "Restoring database..."
    psql -U postgres -h localhost -p 5432 postgres < "$BACKUP_DIR/database.sql"
    
    # 2. Restore Project Files
    echo "Restoring project files..."
    rsync -av --delete "$BACKUP_DIR/project/" /home/johann/content-planer-app/
    
    # 3. Restore Environment Files
    echo "Restoring environment files..."
    cp "$BACKUP_DIR/.env.backup" /home/johann/content-planer-app/.env 2>/dev/null
    cp "$BACKUP_DIR/.env.local.backup" /home/johann/content-planer-app/.env.local 2>/dev/null
    
    # 4. Install dependencies
    echo "Installing dependencies..."
    cd /home/johann/content-planer-app
    npm install
    
    # 5. Generate Prisma Client
    echo "Generating Prisma Client..."
    npx prisma generate
    
    echo "Restore completed!"
else
    echo "Restore cancelled"
fi

# Cleanup
rm -rf "$RESTORE_DIR"
