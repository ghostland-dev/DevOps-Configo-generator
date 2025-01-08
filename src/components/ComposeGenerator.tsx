import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CodeEditor } from "./CodeEditor";

export function ComposeGenerator() {
  const [serviceName, setServiceName] = useState("app");
  const [image, setImage] = useState("node:18");
  const [port, setPort] = useState("3000");

  const generateCompose = () => {
    return `version: '3'

services:
  ${serviceName}:
    image: ${image}
    ports:
      - "${port}:${port}"
    volumes:
      - .:/app
    working_dir: /app
    command: npm start`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
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
      </div>
      <CodeEditor code={generateCompose()} language="yaml" />
    </div>
  );
}