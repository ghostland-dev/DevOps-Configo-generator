import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";

export function DockerfileGenerator() {
  const [baseImage, setBaseImage] = useState("node:18");
  const [workDir, setWorkDir] = useState("/app");
  const [port, setPort] = useState("3000");

  const generateDockerfile = () => {
    return `FROM ${baseImage}

WORKDIR ${workDir}

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE ${port}

CMD ["npm", "start"]`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
      <CodeEditor code={generateDockerfile()} language="dockerfile" />
    </div>
  );
}