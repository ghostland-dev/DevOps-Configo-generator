import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function KubernetesGenerator() {
  const [name, setName] = useState("my-app");
  const [image, setImage] = useState("nginx:latest");
  const [replicas, setReplicas] = useState("3");
  const [port, setPort] = useState("80");
  const [environment, setEnvironment] = useState("development");
  const [useIngress, setUseIngress] = useState(false);
  const [usePVC, setUsePVC] = useState(false);
  const [useConfigMap, setUseConfigMap] = useState(false);
  const [useSecrets, setUseSecrets] = useState(false);
  const [domain, setDomain] = useState("");

  const generateKubernetes = () => {
    let k8sConfig = `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}-${environment}
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${name}
  namespace: ${name}-${environment}
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
        env:
        - name: NODE_ENV
          value: ${environment}
        ${useConfigMap ? `envFrom:
        - configMapRef:
            name: ${name}-config` : ""}
        ${useSecrets ? `
        - secretRef:
            name: ${name}-secrets` : ""}
        ${usePVC ? `volumeMounts:
        - name: ${name}-storage
          mountPath: /data` : ""}
      ${usePVC ? `volumes:
      - name: ${name}-storage
        persistentVolumeClaim:
          claimName: ${name}-pvc` : ""}
---
apiVersion: v1
kind: Service
metadata:
  name: ${name}
  namespace: ${name}-${environment}
spec:
  selector:
    app: ${name}
  ports:
    - protocol: TCP
      port: ${port}
      targetPort: ${port}
  type: ClusterIP`;

    if (useConfigMap) {
      k8sConfig += `
---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${name}-config
  namespace: ${name}-${environment}
data:
  DATABASE_URL: "postgresql://user:password@postgres:5432/dbname"
  REDIS_URL: "redis://redis:6379"`;
    }

    if (useSecrets) {
      k8sConfig += `
---
apiVersion: v1
kind: Secret
metadata:
  name: ${name}-secrets
  namespace: ${name}-${environment}
type: Opaque
data:
  DB_PASSWORD: cGFzc3dvcmQ= # base64 encoded "password"
  API_KEY: c2VjcmV0a2V5 # base64 encoded "secretkey"`;
    }

    if (usePVC) {
      k8sConfig += `
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${name}-pvc
  namespace: ${name}-${environment}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi`;
    }

    if (useIngress) {
      k8sConfig += `
---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: ${name}-ingress
  namespace: ${name}-${environment}
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
  - host: ${domain}
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: ${name}
            port:
              number: ${port}`;
    }

    return k8sConfig;
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
        {useIngress && (
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
            checked={useIngress}
            onCheckedChange={setUseIngress}
          />
          <Label>Use Ingress</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={usePVC}
            onCheckedChange={setUsePVC}
          />
          <Label>Use PVC</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useConfigMap}
            onCheckedChange={setUseConfigMap}
          />
          <Label>Use ConfigMap</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={useSecrets}
            onCheckedChange={setUseSecrets}
          />
          <Label>Use Secrets</Label>
        </div>
      </div>
      <CodeEditor code={generateKubernetes()} language="yaml" />
    </div>
  );
}