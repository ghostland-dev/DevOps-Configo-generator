import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function ComposeGenerator() {
  const [serviceName, setServiceName] = useState("app");
  const [image, setImage] = useState("node:18");
  const [port, setPort] = useState("3000");
  const [environment, setEnvironment] = useState("development");
  const [useTraefik, setUseTraefik] = useState(false);
  const [addDatabase, setAddDatabase] = useState(false);
  const [addRedis, setAddRedis] = useState(false);
  const [domain, setDomain] = useState("");

  const generateCompose = () => {
    let compose = `version: '3.8'

services:
  ${serviceName}:
    image: ${image}
    ports:
      - "${port}:${port}"
    volumes:
      - .:/app
    working_dir: /app
    environment:
      - NODE_ENV=${environment}
      ${addDatabase ? `- DATABASE_URL=postgres://user:password@db:5432/dbname
      - DB_HOST=db` : ""}
      ${addRedis ? `- REDIS_URL=redis://redis:6379` : ""}
    ${useTraefik ? `
    labels:
      - "traefik.enable=true"
      - "traefik.http.routers.${serviceName}.rule=Host(\`${domain}\`)"
      - "traefik.http.services.${serviceName}.loadbalancer.server.port=${port}"` : ""}
    networks:
      - app-network
    command: npm run ${environment}`;

    if (addDatabase) {
      compose += `

  db:
    image: postgres:14-alpine
    environment:
      - POSTGRES_USER=user
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=dbname
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network`;
    }

    if (addRedis) {
      compose += `

  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network`;
    }

    if (useTraefik) {
      compose += `

  traefik:
    image: traefik:v2.9
    command:
      - "--api.insecure=true"
      - "--providers.docker=true"
    ports:
      - "80:80"
      - "8080:8080"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    networks:
      - app-network`;
    }

    compose += `

networks:
  app-network:
    driver: bridge

volumes:${addDatabase ? `
  postgres_data:` : ""}${addRedis ? `
  redis_data:` : ""}`;

    return compose;
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
          <Label htmlFor="serviceName">Service Name</Label>
          <Input
            id="serviceName"
            value={serviceName}
            onChange={(e) => setServiceName(e.target.value)}
            placeholder="app"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Image</Label>
          <Input
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="node:18"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="port">Port</Label>
          <Input
            id="port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
            placeholder="3000"
          />
        </div>
        {useTraefik && (
          <div className="space-y-2">
            <Label htmlFor="domain">Domain</Label>
            <Input
              id="domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="app.example.com"
            />
          </div>
        )}
        <div className="flex items-center space-x-2">
          <Switch
            checked={useTraefik}
            onCheckedChange={setUseTraefik}
          />
          <Label>Use Traefik</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={addDatabase}
            onCheckedChange={setAddDatabase}
          />
          <Label>Add PostgreSQL</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={addRedis}
            onCheckedChange={setAddRedis}
          />
          <Label>Add Redis</Label>
        </div>
      </div>
      <CodeEditor code={generateCompose()} language="yaml" />
    </div>
  );
}