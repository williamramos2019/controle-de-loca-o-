import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import ToolCard from "@/components/tool-card";
import type { ToolWithLoanInfo } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const categories = [
  { id: "all", label: "Todas" },
  { id: "hand-tools", label: "Manuais" },
  { id: "power-tools", label: "Elétricas" },
  { id: "measuring", label: "Medição" },
  { id: "safety", label: "Segurança" },
];

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const { toast } = useToast();

  const { data: tools = [], isLoading } = useQuery({
    queryKey: ["/api/tools"],
  });

  const filteredTools = tools.filter((tool: ToolWithLoanInfo) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleLend = (toolId: string) => {
    toast({
      title: "Empréstimo",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  const handleEdit = (toolId: string) => {
    toast({
      title: "Editar",
      description: "Funcionalidade em desenvolvimento",
    });
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="animate-pulse space-y-3">
          <div className="h-12 bg-muted rounded-lg"></div>
          <div className="flex space-x-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-muted rounded-full"></div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-4 animate-pulse">
              <div className="space-y-3">
                <div className="h-5 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="flex space-x-2">
                  <div className="h-10 bg-muted rounded flex-1"></div>
                  <div className="h-10 bg-muted rounded flex-1"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="p-4 space-y-4 fade-in" data-testid="inventory-view">
      {/* Search and Filter */}
      <div className="space-y-3">
        <div className="relative">
          <Input
            type="text"
            placeholder="Buscar ferramentas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-12 pl-10 touch-target"
            data-testid="input-search-tools"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        </div>
        
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "secondary"}
              size="sm"
              className="whitespace-nowrap touch-target"
              onClick={() => setSelectedCategory(category.id)}
              data-testid={`filter-${category.id}`}
            >
              {category.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Inventory Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredTools.length === 0 ? (
          <div className="bg-card border border-border rounded-lg p-6 text-center">
            <p className="text-sm text-muted-foreground" data-testid="text-no-tools">
              Nenhuma ferramenta encontrada
            </p>
          </div>
        ) : (
          filteredTools.map((tool: ToolWithLoanInfo) => (
            <ToolCard
              key={tool.id}
              tool={tool}
              onLend={handleLend}
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </section>
  );
}
