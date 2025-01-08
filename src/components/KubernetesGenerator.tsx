import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";

export function KubernetesGenerator() {
  const [name, setName] = useState("my-app");
  const [image, setImage] = useState("nginx:latest");
  const [replicas, setReplicas] = useState("3");
  const [port, setPort] = useState("80");

  const generateKubernetes = () => {
    return `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
spec:
  replicas: ${replicas}
  selector:
    matchLabels:
      app: ${name}
  template:
    metadata:
      labels:
        app: ${name}
    spec:
      containers:
      - name: ${name}
        image: ${image}
        ports:
        - containerPort: ${port}
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}
spec:
  selector:
    app: ${name}
  ports:
    - protocol: TCP
      port: ${port}
      targetPort: ${port}
  type: ClusterIP`;
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Application Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="my-app"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="image">Container Image</Label>
          <Input
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            placeholder="nginx:latest"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="replicas">Replicas</Label>
          <Input
            id="replicas"
            value={replicas}
            onChange={(e) => setReplicas(e.target.value)}
            placeholder="3"
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
      </div>
      <CodeEditor code={generateKubernetes()} language="yaml" />
    </div>
  );
}