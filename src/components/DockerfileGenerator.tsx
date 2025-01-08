import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function DockerfileGenerator() {
  const [baseImage, setBaseImage] = useState("node:18");
  const [workDir, setWorkDir] = useState("/app");
  const [port, setPort] = useState("3000");
  const [environment, setEnvironment] = useState("development");
  const [useMultistage, setUseMultistage] = useState(false);
  const [installDevDeps, setInstallDevDeps] = useState(true);
  const [customCommands, setCustomCommands] = useState("");

  const generateDockerfile = () => {
    if (useMultistage) {
      return `# Build stage
FROM ${baseImage} as builder

WORKDIR ${workDir}

COPY package*.json ./

RUN ${environment === "production" 
  ? "npm ci --only=production" 
  : "npm install"}

COPY . .

${environment === "production" 
  ? "RUN npm run build" 
  : ""}

# Production stage
FROM ${baseImage}-slim

WORKDIR ${workDir}

COPY --from=builder ${workDir}/dist ./dist
COPY --from=builder ${workDir}/node_modules ./node_modules
COPY package*.json ./

EXPOSE ${port}

${customCommands ? customCommands + "\n" : ""}

CMD ["npm", "run", "${environment}"]`;
    }

    return `FROM ${baseImage}

WORKDIR ${workDir}

COPY package*.json ./

RUN ${environment === "production" 
  ? "npm ci --only=production" 
  : "npm install"}

COPY . .

${environment === "production" ? "RUN npm run build" : ""}

EXPOSE ${port}

${customCommands ? customCommands + "\n" : ""}

CMD ["npm", "run", "${environment}"]`;
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
          <Label htmlFor="baseImage">Base Image</Label>
          <Input
            id="baseImage"
            value={baseImage}
            onChange={(e) => setBaseImage(e.target.value)}
            placeholder="node:18"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="workDir">Working Directory</Label>
          <Input
            id="workDir"
            value={workDir}
            onChange={(e) => setWorkDir(e.target.value)}
            placeholder="/app"
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
        <div className="space-y-2">
          <Label htmlFor="customCommands">Custom Commands</Label>
          <Input
            id="customCommands"
            value={customCommands}
            onChange={(e) => setCustomCommands(e.target.value)}
            placeholder="RUN apt-get update && apt-get install -y ..."
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useMultistage}
            onCheckedChange={setUseMultistage}
          />
          <Label>Use Multi-stage Build</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={installDevDeps}
            onCheckedChange={setInstallDevDeps}
          />
          <Label>Install Dev Dependencies</Label>
        </div>
      </div>
      <CodeEditor code={generateDockerfile()} language="dockerfile" />
    </div>
  );
}