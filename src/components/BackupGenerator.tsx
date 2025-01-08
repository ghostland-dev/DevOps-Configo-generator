import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";

export function BackupGenerator() {
  const [backupDir, setBackupDir] = useState("/var/backups");
  const [sourceDir, setSourceDir] = useState("/var/www");
  const [retention, setRetention] = useState("7");

  const generateBackupScript = () => {
    return `#!/bin/bash

# Backup configuration
BACKUP_DIR="${backupDir}"
SOURCE_DIR="${sourceDir}"
RETENTION_DAYS=${retention}
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="backup_\${DATE}.tar.gz"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create backup
tar -czf "$BACKUP_DIR/$BACKUP_NAME" "$SOURCE_DIR"

# Remove old backups
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log backup completion
echo "Backup completed: $BACKUP_NAME" >> "$BACKUP_DIR/backup.log"`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
      <CodeEditor code={generateBackupScript()} language="bash" />
    </div>
  );
}