import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface CodeEditorProps {
  code: string;
  language: string;
}

export function CodeEditor({ code, language }: CodeEditorProps) {
  const { toast } = useToast();

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(code);
    toast({
      title: "Copied to clipboard",
      description: "The configuration has been copied to your clipboard.",
    });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-2 top-2"
        onClick={copyToClipboard}
      >
        <Copy className="h-4 w-4" />
      </Button>
      <pre className="code-editor overflow-auto">
        <code className={`language-${language}`}>{code}</code>
      </pre>
    </div>
  );
}