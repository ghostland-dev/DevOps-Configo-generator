import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function WebServerGenerator() {
  const [serverName, setServerName] = useState("example.com");
  const [port, setPort] = useState("80");
  const [sslEnabled, setSslEnabled] = useState(true);
  const [rootDir, setRootDir] = useState("/var/www/html");
  const [environment, setEnvironment] = useState("development");
  const [serverType, setServerType] = useState("nginx");
  const [phpEnabled, setPhpEnabled] = useState(true);
  const [useHTTP2, setUseHTTP2] = useState(true);
  const [enableCaching, setEnableCaching] = useState(true);

  const generateConfig = () => {
    if (serverType === "nginx") {
      return `# ${environment} configuration for ${serverName}
server {
    listen ${port}${sslEnabled ? ' ssl http2' : ''};
    server_name ${serverName};
    root ${rootDir};

    ${sslEnabled ? `# SSL Configuration
    ssl_certificate /etc/nginx/ssl/${serverName}.crt;
    ssl_certificate_key /etc/nginx/ssl/${serverName}.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;` : ""}

    ${useHTTP2 && sslEnabled ? `# HTTP/2 Configuration
    http2_push_preload on;
    http2_max_concurrent_streams 128;` : ""}

    index index.html index.htm${phpEnabled ? " index.php" : ""};

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    ${environment === "production" ? `add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;` : ""}

    ${enableCaching ? `# Cache Configuration
    location ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }` : ""}

    location / {
        try_files $uri $uri/ ${phpEnabled ? "/index.php?$query_string" : "/index.html"};
    }

    ${phpEnabled ? `location ~ \\.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param ENVIRONMENT ${environment};
    }` : ""}

    location ~ /\\.ht {
        deny all;
    }

    ${environment === "production" ? `# Error pages
    error_page 404 /404.html;
    error_page 500 502 503 504 /50x.html;` : ""}

    # Access and error logs
    access_log /var/log/nginx/${serverName}.access.log;
    error_log /var/log/nginx/${serverName}.error.log${environment === "development" ? " debug" : ""};
}`;
    } else if (serverType === "apache") {
      return `# ${environment} configuration for ${serverName}
<VirtualHost *:${port}>
    ServerName ${serverName}
    DocumentRoot ${rootDir}
    ServerAdmin webmaster@${serverName}

    ${sslEnabled ? `# SSL Configuration
    SSLEngine on
    SSLCertificateFile /etc/apache2/ssl/${serverName}.crt
    SSLCertificateKeyFile /etc/apache2/ssl/${serverName}.key
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384` : ""}

    ${useHTTP2 && sslEnabled ? `# HTTP/2 Configuration
    Protocols h2 http/1.1` : ""}

    <Directory ${rootDir}>
        Options ${environment === "development" ? "Indexes " : ""}FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ${phpEnabled ? `# PHP Configuration
    <FilesMatch "\\.php$">
        SetHandler "proxy:unix:/var/run/php/php8.1-fpm.sock|fcgi://localhost"
    </FilesMatch>` : ""}

    ${enableCaching ? `# Cache Configuration
    <FilesMatch "\\.(jpg|jpeg|png|gif|ico|css|js)$">
        Header set Cache-Control "max-age=2592000, public"
    </FilesMatch>` : ""}

    # Security Headers
    Header always set X-Frame-Options "SAMEORIGIN"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set X-Content-Type-Options "nosniff"
    ${environment === "production" ? `Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"` : ""}

    # Logging
    ErrorLog \${APACHE_LOG_DIR}/${serverName}.error.log
    CustomLog \${APACHE_LOG_DIR}/${serverName}.access.log combined${environment === "development" ? " env=!dontlog" : ""}
</VirtualHost>`;
    } else {
      return `# ${environment} configuration for ${serverName}
{
    ${serverName} {
        root * ${rootDir}
        encode gzip

        ${sslEnabled ? `# SSL Configuration
        tls /etc/caddy/ssl/${serverName}.crt /etc/caddy/ssl/${serverName}.key {
            protocols tls1.2 tls1.3
        }` : ""}

        # File server
        file_server

        ${phpEnabled ? `# PHP Configuration
        php_fastcgi unix//var/run/php/php8.1-fpm.sock` : ""}

        ${enableCaching ? `# Cache Configuration
        @static {
            file
            path *.ico *.css *.js *.gif *.jpg *.jpeg *.png *.svg *.woff *.woff2
        }
        header @static Cache-Control "max-age=2592000"` : ""}

        # Security headers
        header {
            X-Frame-Options "SAMEORIGIN"
            X-XSS-Protection "1; mode=block"
            X-Content-Type-Options "nosniff"
            ${environment === "production" ? `Strict-Transport-Security "max-age=31536000; includeSubDomains"` : ""}
        }

        # Logging
        log {
            output file /var/log/caddy/${serverName}.access.log
            format json
            level ${environment === "development" ? "DEBUG" : "INFO"}
        }
    }
}`;
    }
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
          <Label htmlFor="serverType">Server Type</Label>
          <Select 
            value={serverType} 
            onValueChange={setServerType}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select server type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nginx">Nginx</SelectItem>
              <SelectItem value="apache">Apache</SelectItem>
              <SelectItem value="caddy">Caddy</SelectItem>
            </SelectContent>
          </Select>
        </div>
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
        <div className="flex items-center space-x-2">
          <Switch
            checked={sslEnabled}
            onCheckedChange={setSslEnabled}
          />
          <Label>Enable SSL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={phpEnabled}
            onCheckedChange={setPhpEnabled}
          />
          <Label>Enable PHP</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useHTTP2}
            onCheckedChange={setUseHTTP2}
          />
          <Label>Use HTTP/2</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={enableCaching}
            onCheckedChange={setEnableCaching}
          />
          <Label>Enable Caching</Label>
        </div>
      </div>
      <CodeEditor code={generateConfig()} language={serverType === "apache" ? "apache" : "nginx"} />
    </div>
  );
}