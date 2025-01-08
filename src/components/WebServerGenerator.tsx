import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";

export function WebServerGenerator() {
  const [serverName, setServerName] = useState("example.com");
  const [port, setPort] = useState("80");
  const [sslEnabled, setSslEnabled] = useState(true);
  const [rootDir, setRootDir] = useState("/var/www/html");

  const generateNginxConfig = () => {
    return `server {
    listen ${port}${sslEnabled ? ' ssl' : ''};
    server_name ${serverName};
    root ${rootDir};

    ${sslEnabled ? `ssl_certificate /etc/nginx/ssl/${serverName}.crt;
    ssl_certificate_key /etc/nginx/ssl/${serverName}.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;` : ''}

    index index.html index.htm index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
    }

    location ~ /\\.ht {
        deny all;
    }
}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="serverName">Server Name</Label>
          <Input
            id="serverName"
            value={serverName}
            onChange={(e) => setServerName(e.target.value)}
            placeholder="example.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="80"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="rootDir">Root Directory</Label>
          <Input
            id="rootDir"
            value={rootDir}
            onChange={(e) => setRootDir(e.target.value)}
            placeholder="/var/www/html"
          />
        </div>
        <div className="space-y-2">
          <Label>SSL</Label>
          <Button
            variant={sslEnabled ? "default" : "outline"}
            onClick={() => setSslEnabled(!sslEnabled)}
            className="w-full"
          >
            {sslEnabled ? "Enabled" : "Disabled"}
          </Button>
        </div>
      </div>
      <CodeEditor code={generateNginxConfig()} language="nginx" />
    </div>
  );
}