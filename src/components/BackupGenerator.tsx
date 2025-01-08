import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function BackupGenerator() {
  const [backupDir, setBackupDir] = useState("/var/backups");
  const [sourceDir, setSourceDir] = useState("/var/www");
  const [retention, setRetention] = useState("7");
  const [environment, setEnvironment] = useState("development");
  const [useS3, setUseS3] = useState(false);
  const [useCompression, setUseCompression] = useState(true);
  const [backupDatabase, setBackupDatabase] = useState(false);
  const [backupType, setBackupType] = useState("full");
  const [dbType, setDbType] = useState("postgresql");
  const [dbName, setDbName] = useState("myapp");
  const [dbUser, setDbUser] = useState("dbuser");
  const [dbHost, setDbHost] = useState("localhost");
  const [dbPort, setDbPort] = useState("5432");

  const generateBackupScript = () => {
    const dbCommands = {
      postgresql: `pg_dump -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME > "$BACKUP_DIR/\${BACKUP_NAME}_db.sql"`,
      mysql: `mysqldump -u $DB_USER -h $DB_HOST -P $DB_PORT $DB_NAME > "$BACKUP_DIR/\${BACKUP_NAME}_db.sql"`,
      mongodb: `mongodump --host $DB_HOST --port $DB_PORT --db $DB_NAME --out "$BACKUP_DIR/\${BACKUP_NAME}_db"`,
      redis: `redis-cli -h $DB_HOST -p $DB_PORT --rdb "$BACKUP_DIR/\${BACKUP_NAME}_db.rdb"`
    };

    return `#!/bin/bash

# Environment configuration
ENV="${environment}"
BACKUP_DIR="${backupDir}"
SOURCE_DIR="${sourceDir}"
RETENTION_DAYS=${retention}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_\${ENV}_\${DATE}"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

${useS3 ? `# AWS S3 configuration
S3_BUCKET="my-backup-bucket"
AWS_PROFILE="default"` : ""}

${backupDatabase ? `# Database configuration
DB_USER="${dbUser}"
DB_NAME="${dbName}"
DB_HOST="${dbHost}"
DB_PORT="${dbPort}"` : ""}

# Logging function
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" >> "$BACKUP_DIR/backup.log"
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "Starting backup process for $ENV environment"

${backupType === "incremental" ? `# Check for previous backup for incremental
LAST_BACKUP=$(ls -t $BACKUP_DIR/backup_${environment}_* 2>/dev/null | head -n1)
INCREMENTAL_OPT=""
if [ ! -z "$LAST_BACKUP" ]; then
    INCREMENTAL_OPT="--link-dest=$LAST_BACKUP"
fi` : ""}

# Create backup
${useCompression ? `tar -czf "$BACKUP_DIR/\${BACKUP_NAME}.tar.gz" "$SOURCE_DIR"` : 
  backupType === "incremental" ? 
  `rsync -az --progress $INCREMENTAL_OPT "$SOURCE_DIR" "$BACKUP_DIR/\${BACKUP_NAME}"` :
  `cp -r "$SOURCE_DIR" "$BACKUP_DIR/\${BACKUP_NAME}"`}

${backupDatabase ? `# Backup database
${dbCommands[dbType]}
${useCompression && dbType !== 'mongodb' ? `gzip "$BACKUP_DIR/\${BACKUP_NAME}_db.sql"` : ""}` : ""}

${useS3 ? `# Upload to S3
log "Uploading backup to S3"
aws s3 cp "$BACKUP_DIR/\${BACKUP_NAME}.tar.gz" "s3://$S3_BUCKET/${environment}/" --profile $AWS_PROFILE` : ""}

# Cleanup old backups
find $BACKUP_DIR -name "backup_${environment}_*.tar.gz" -mtime +$RETENTION_DAYS -delete
${backupDatabase ? `find $BACKUP_DIR -name "backup_${environment}_*_db.*" -mtime +$RETENTION_DAYS -delete` : ""}

log "Backup completed: \${BACKUP_NAME}"

# Check backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR/\${BACKUP_NAME}"* | cut -f1)
log "Backup size: $BACKUP_SIZE"

${environment === "production" ? `# Send notification
if command -v curl &> /dev/null; then
    curl -X POST -H "Content-Type: application/json" \\
         -d "{\\"text\\":\\"Backup completed for ${environment}. Size: $BACKUP_SIZE\\"}" \\
         "https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
fi` : ""}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select 
            value={environment} 
            onValueChange={setEnvironment}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select environment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="test">Test</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backupType">Backup Type</Label>
          <Select 
            value={backupType} 
            onValueChange={setBackupType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select backup type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full</SelectItem>
              <SelectItem value="incremental">Incremental</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="backupDir">Backup Directory</Label>
          <Input
            id="backupDir"
            value={backupDir}
            onChange={(e) => setBackupDir(e.target.value)}
            placeholder="/var/backups"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceDir">Source Directory</Label>
          <Input
            id="sourceDir"
            value={sourceDir}
            onChange={(e) => setSourceDir(e.target.value)}
            placeholder="/var/www"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="retention">Retention Days</Label>
          <Input
            id="retention"
            value={retention}
            onChange={(e) => setRetention(e.target.value)}
            placeholder="7"
          />
        </div>

        {backupDatabase && (
          <>
            <div className="space-y-2">
              <Label htmlFor="dbType">Database Type</Label>
              <Select 
                value={dbType} 
                onValueChange={setDbType}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select database type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="postgresql">PostgreSQL</SelectItem>
                  <SelectItem value="mysql">MySQL</SelectItem>
                  <SelectItem value="mongodb">MongoDB</SelectItem>
                  <SelectItem value="redis">Redis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbName">Database Name</Label>
              <Input
                id="dbName"
                value={dbName}
                onChange={(e) => setDbName(e.target.value)}
                placeholder="myapp"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbUser">Database User</Label>
              <Input
                id="dbUser"
                value={dbUser}
                onChange={(e) => setDbUser(e.target.value)}
                placeholder="dbuser"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbHost">Database Host</Label>
              <Input
                id="dbHost"
                value={dbHost}
                onChange={(e) => setDbHost(e.target.value)}
                placeholder="localhost"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dbPort">Database Port</Label>
              <Input
                id="dbPort"
                value={dbPort}
                onChange={(e) => setDbPort(e.target.value)}
                placeholder="5432"
              />
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <Switch
            checked={useS3}
            onCheckedChange={setUseS3}
          />
          <Label>Use S3 Backup</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useCompression}
            onCheckedChange={setUseCompression}
          />
          <Label>Use Compression</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={backupDatabase}
            onCheckedChange={setBackupDatabase}
          />
          <Label>Backup Database</Label>
        </div>
      </div>
      <CodeEditor code={generateBackupScript()} language="bash" />
    </div>
  );
}