import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { DockerfileGenerator } from "@/components/DockerfileGenerator";
import { ComposeGenerator } from "@/components/ComposeGenerator";
import { KubernetesGenerator } from "@/components/KubernetesGenerator";
import { AnsibleGenerator } from "@/components/AnsibleGenerator";
import { BackupGenerator } from "@/components/BackupGenerator";
import { WebServerGenerator } from "@/components/WebServerGenerator";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTool, setSelectedTool] = useState("dockerfile");

  const renderTool = () => {
    switch (selectedTool) {
      case "dockerfile":
        return <DockerfileGenerator />;
      case "compose":
        return <ComposeGenerator />;
      case "kubernetes":
        return <KubernetesGenerator />;
      case "ansible":
        return <AnsibleGenerator />;
      case "backup":
        return <BackupGenerator />;
      case "webserver":
        return <WebServerGenerator />;
      default:
        return (
          <div className="flex h-[50vh] items-center justify-center">
            <p className="text-muted-foreground">Select a tool from the sidebar to begin</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar onMenuClick={() => setIsMenuOpen(!isMenuOpen)} />
      <div className="flex">
        <Sidebar
          isOpen={isMenuOpen}
          onSelect={setSelectedTool}
          selectedTool={selectedTool}
        />
        <main className="flex-1 p-6 md:ml-64">
          <div className="mx-auto max-w-4xl">
            {renderTool()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Index;