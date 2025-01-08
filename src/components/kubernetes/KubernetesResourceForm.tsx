import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";

interface ResourceFormProps {
  resourceType: string;
  onUpdate: (resources: any[]) => void;
  initialResources?: any[];
}

export function KubernetesResourceForm({ resourceType, onUpdate, initialResources = [] }: ResourceFormProps) {
  const [resources, setResources] = useState(initialResources);

  const addResource = () => {
    const newResource = {
      name: `${resourceType.toLowerCase()}-${resources.length + 1}`,
      data: {}
    };
    const updatedResources = [...resources, newResource];
    setResources(updatedResources);
    onUpdate(updatedResources);
  };

  const removeResource = (index: number) => {
    const updatedResources = resources.filter((_, i) => i !== index);
    setResources(updatedResources);
    onUpdate(updatedResources);
  };

  const updateResource = (index: number, field: string, value: string) => {
    const updatedResources = [...resources];
    updatedResources[index] = {
      ...updatedResources[index],
      [field]: value
    };
    setResources(updatedResources);
    onUpdate(updatedResources);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{resourceType}s</h3>
        <Button onClick={addResource} size="sm" className="flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add {resourceType}
        </Button>
      </div>

      {resources.map((resource, index) => (
        <div key={index} className="p-4 border rounded-lg space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">{resourceType} {index + 1}</h4>
            <Button 
              variant="destructive" 
              size="sm"
              onClick={() => removeResource(index)}
              className="flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Remove
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input
                value={resource.name}
                onChange={(e) => updateResource(index, "name", e.target.value)}
                placeholder={`${resourceType.toLowerCase()}-name`}
              />
            </div>
            {/* Add more fields based on resource type */}
          </div>
        </div>
      ))}
    </div>
  );
}