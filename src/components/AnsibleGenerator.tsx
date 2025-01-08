import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { CodeEditor } from "./CodeEditor";

export function AnsibleGenerator() {
  const [hostPattern, setHostPattern] = useState("webservers");
  const [user, setUser] = useState("ansible");
  const [tasks, setTasks] = useState([
    "Install Nginx",
    "Start Nginx service",
    "Copy config file",
  ]);

  const generateAnsible = () => {
    return `---
- name: Configure web server
  hosts: ${hostPattern}
  become: yes
  remote_user: ${user}

  tasks:
    - name: Install Nginx
      apt:
        name: nginx
        state: present
        update_cache: yes

    - name: Start Nginx service
      service:
        name: nginx
        state: started
        enabled: yes

    - name: Copy Nginx config file
      copy:
        src: files/nginx.conf
        dest: /etc/nginx/nginx.conf
        owner: root
        group: root
        mode: '0644'
      notify: restart nginx

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
      </div>
      <CodeEditor code={generateAnsible()} language="yaml" />
    </div>
  );
}