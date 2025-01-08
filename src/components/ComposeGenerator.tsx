import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";
import { Plus, Trash2 } from "lucide-react";

interface Service {
  name: string;
  image: string;
  port: string;
  environment: string[];
}

export function ComposeGenerator() {
  const [services, setServices] = useState<Service[]>([{
    name: "app",
    image: "node:18",
    port: "3000",
    environment: []
  }]);
  const [environment, setEnvironment] = useState("development");
  const [useTraefik, setUseTraefik] = useState(false);
  const [addDatabase, setAddDatabase] = useState(false);
  const [addRedis, setAddRedis] = useState(false);
  const [domain, setDomain] = useState("");

  const addService = () => {
    setServices([...services, {
      name: `service-${services.length + 1}`,
      image: "nginx:latest",
      port: "80",
      environment: []
    }]);
  };

  const removeService = (index: number) => {
    setServices(services.filter((_, i) => i !== index));
  };

  const updateService = (index: number, field: keyof Service, value: string) => {
    const newServices = [...services];
    newServices[index] = {
      ...newServices[index],
      [field]: value
    };
    setServices(newServices);
  };

  const generateCompose = () => {
    let compose = `version: '3.8'\n\nservices:\n`;

    // Add user-defined services
    services.forEach(service => {
      compose += `  ${service.name}:
    image: ${service.image}
    ports:
      - "${service.port}:${service.port}"
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
      - "traefik.http.routers.${service.name}.rule=Host(\`${domain}\`)"
      - "traefik.http.services.${service.name}.loadbalancer.server.port=${service.port}"` : ""}
    networks:
      - app-network\n`;
    });

    // Add database if enabled
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
      - app-network\n`;
    }

    // Add Redis if enabled
    if (addRedis) {
      compose += `
  redis:
    image: redis:alpine
    volumes:
      - redis_data:/data
    networks:
      - app-network\n`;
    }

    // Add Traefik if enabled
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
      - app-network\n`;
    }

    // Add networks and volumes
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
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Services</h2>
        <Button onClick={addService} className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Service
        </Button>
      </div>

      {services.map((service, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Service {index + 1}</h3>
            {services.length > 1 && (
              <Button 
                variant="destructive" 
                size="sm"
                onClick={() => removeService(index)}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" /> Remove
              </Button>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Service Name</Label>
              <Input
                value={service.name}
                onChange={(e) => updateService(index, "name", e.target.value)}
                placeholder="app"
              />
            </div>
            <div className="space-y-2">
              <Label>Image</Label>
              <Input
                value={service.image}
                onChange={(e) => updateService(index, "image", e.target.value)}
                placeholder="node:18"
              />
            </div>
            <div className="space-y-2">
              <Label>Port</Label>
              <Input
                value={service.port}
                onChange={(e) => updateService(index, "port", e.target.value)}
                placeholder="3000"
              />
            </div>
          </div>
        </div>
      ))}

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