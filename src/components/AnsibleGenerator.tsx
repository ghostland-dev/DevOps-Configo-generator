import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";
import { Switch } from "@/components/ui/switch";

export function AnsibleGenerator() {
  const [hostPattern, setHostPattern] = useState("webservers");
  const [user, setUser] = useState("ansible");
  const [environment, setEnvironment] = useState("development");
  const [installNginx, setInstallNginx] = useState(true);
  const [installNode, setInstallNode] = useState(true);
  const [installDocker, setInstallDocker] = useState(true);
  const [setupFirewall, setSetupFirewall] = useState(true);
  const [setupMonitoring, setSetupMonitoring] = useState(false);

  const generateAnsible = () => {
    return `---
- name: Configure ${environment} environment
  hosts: ${hostPattern}
  become: yes
  remote_user: ${user}

  vars:
    env: ${environment}
    node_version: 18.x
    monitoring_port: 9100

  pre_tasks:
    - name: Update apt cache
      apt:
        update_cache: yes
      when: ansible_os_family == "Debian"

  tasks:${installNginx ? `
    - name: Install Nginx
      apt:
        name: nginx
        state: present

    - name: Start Nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Copy Nginx config
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/nginx.conf
      notify: restart nginx` : ""}

    ${installNode ? `
    - name: Install Node.js
      block:
        - name: Add NodeSource repository
          shell: |
            curl -fsSL https://deb.nodesource.com/setup_${environment === "production" ? "18" : "20"}.x | bash -
        - name: Install Node.js
          apt:
            name: nodejs
            state: present` : ""}

    ${installDocker ? `
    - name: Install Docker
      block:
        - name: Add Docker GPG key
          apt_key:
            url: https://download.docker.com/linux/ubuntu/gpg
            state: present
        
        - name: Add Docker repository
          apt_repository:
            repo: deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ansible_distribution_release }} stable
            state: present
        
        - name: Install Docker packages
          apt:
            name: 
              - docker-ce
              - docker-ce-cli
              - containerd.io
            state: present
        
        - name: Start Docker service
          service:
            name: docker
            state: started
            enabled: yes` : ""}

    ${setupFirewall ? `
    - name: Configure UFW
      block:
        - name: Install UFW
          apt:
            name: ufw
            state: present
        
        - name: Allow SSH
          ufw:
            rule: allow
            port: 22
            proto: tcp
        
        - name: Allow HTTP
          ufw:
            rule: allow
            port: 80
            proto: tcp
        
        - name: Allow HTTPS
          ufw:
            rule: allow
            port: 443
            proto: tcp
        
        - name: Enable UFW
          ufw:
            state: enabled
            policy: deny` : ""}

    ${setupMonitoring ? `
    - name: Setup Node Exporter
      block:
        - name: Download Node Exporter
          get_url:
            url: https://github.com/prometheus/node_exporter/releases/download/v1.5.0/node_exporter-1.5.0.linux-amd64.tar.gz
            dest: /tmp/node_exporter.tar.gz
        
        - name: Extract Node Exporter
          unarchive:
            src: /tmp/node_exporter.tar.gz
            dest: /usr/local/bin
            remote_src: yes
            extra_opts: [--strip-components=1]
        
        - name: Create Node Exporter service
          template:
            src: templates/node_exporter.service.j2
            dest: /etc/systemd/system/node_exporter.service
        
        - name: Start Node Exporter
          systemd:
            name: node_exporter
            state: started
            enabled: yes
            daemon_reload: yes` : ""}

  handlers:
    - name: restart nginx
      service:
        name: nginx
        state: restarted`;
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
          <Label htmlFor="hostPattern">Host Pattern</Label>
          <Input
            id="hostPattern"
            value={hostPattern}
            onChange={(e) => setHostPattern(e.target.value)}
            placeholder="webservers"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="user">Remote User</Label>
          <Input
            id="user"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="ansible"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={installNginx}
            onCheckedChange={setInstallNginx}
          />
          <Label>Install Nginx</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={installNode}
            onCheckedChange={setInstallNode}
          />
          <Label>Install Node.js</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={installDocker}
            onCheckedChange={setInstallDocker}
          />
          <Label>Install Docker</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={setupFirewall}
            onCheckedChange={setSetupFirewall}
          />
          <Label>Setup Firewall</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            checked={setupMonitoring}
            onCheckedChange={setSetupMonitoring}
          />
          <Label>Setup Monitoring</Label>
        </div>
      </div>
      <CodeEditor code={generateAnsible()} language="yaml" />
    </div>
  );
}