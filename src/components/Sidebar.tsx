import { FileCode2, Box, Layers, Terminal, Server } from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onSelect: (tool: string) => void;
  selectedTool: string;
}

export function Sidebar({ isOpen, onSelect, selectedTool }: SidebarProps) {
  const tools = [
    { id: "dockerfile", name: "Dockerfile", icon: FileCode2 },
    { id: "compose", name: "Docker Compose", icon: Box },
    { id: "kubernetes", name: "Kubernetes", icon: Layers },
    { id: "ansible", name: "Ansible", icon: Terminal },
    { id: "backup", name: "Backup Scripts", icon: Terminal },
    { id: "webserver", name: "Web Server", icon: Server },
  ];

  return (
    <div
      className={cn(
        "fixed left-0 top-14 z-30 h-[calc(100vh-3.5rem)] w-64 border-r bg-background transition-transform duration-300 md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={() => onSelect(tool.id)}
                className={cn(
                  "flex w-full items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                  selectedTool === tool.id ? "bg-accent" : "transparent"
                )}
              >
                <tool.icon className="mr-2 h-4 w-4" />
                {tool.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}