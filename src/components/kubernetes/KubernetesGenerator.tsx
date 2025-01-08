import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "../CodeEditor";
import { Switch } from "@/components/ui/switch";
import { KubernetesResourceForm } from "./KubernetesResourceForm";

export function KubernetesGenerator() {
  const [name, setName] = useState("my-app");
  const [environment, setEnvironment] = useState("development");
  const [deployments, setDeployments] = useState([]);
  const [services, setServices] = useState([]);
  const [configMaps, setConfigMaps] = useState([]);
  const [secrets, setSecrets] = useState([]);
  const [pvcs, setPvcs] = useState([]);

  const generateKubernetes = () => {
    let k8sConfig = `apiVersion: v1
kind: Namespace
metadata:
  name: ${name}-${environment}\n`;

    // Generate Deployments
    deployments.forEach(deployment => {
      k8sConfig += `---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: ${deployment.name}
  namespace: ${name}-${environment}
spec:
  replicas: 3
  selector:
    matchLabels:
      app: ${deployment.name}
  template:
    metadata:
      labels:
        app: ${deployment.name}
    spec:
      containers:
      - name: ${deployment.name}
        image: nginx:latest
        ports:
        - containerPort: 80\n`;
    });

    // Generate Services
    services.forEach(service => {
      k8sConfig += `---
apiVersion: v1
kind: Service
metadata:
  name: ${service.name}
  namespace: ${name}-${environment}
spec:
  selector:
    app: ${service.name}
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
  type: ClusterIP\n`;
    });

    // Generate ConfigMaps
    configMaps.forEach(configMap => {
      k8sConfig += `---
apiVersion: v1
kind: ConfigMap
metadata:
  name: ${configMap.name}
  namespace: ${name}-${environment}
data:
  config.json: |-
    {
      "key": "value"
    }\n`;
    });

    // Generate Secrets
    secrets.forEach(secret => {
      k8sConfig += `---
apiVersion: v1
kind: Secret
metadata:
  name: ${secret.name}
  namespace: ${name}-${environment}
type: Opaque
data:
  username: dXNlcm5hbWU=
  password: cGFzc3dvcmQ=\n`;
    });

    // Generate PVCs
    pvcs.forEach(pvc => {
      k8sConfig += `---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: ${pvc.name}
  namespace: ${name}-${environment}
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 1Gi\n`;
    });

    return k8sConfig;
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
      </div>

      <KubernetesResourceForm
        resourceType="Deployment"
        onUpdate={setDeployments}
        initialResources={deployments}
      />

      <KubernetesResourceForm
        resourceType="Service"
        onUpdate={setServices}
        initialResources={services}
      />

      <KubernetesResourceForm
        resourceType="ConfigMap"
        onUpdate={setConfigMaps}
        initialResources={configMaps}
      />

      <KubernetesResourceForm
        resourceType="Secret"
        onUpdate={setSecrets}
        initialResources={secrets}
      />

      <KubernetesResourceForm
        resourceType="PVC"
        onUpdate={setPvcs}
        initialResources={pvcs}
      />

      <CodeEditor code={generateKubernetes()} language="yaml" />
    </div>
  );
}