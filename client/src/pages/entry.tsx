import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { insertToolSchema, type InsertTool } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const categories = [
  { value: "hand-tools", label: "Ferramentas Manuais" },
  { value: "power-tools", label: "Ferramentas Elétricas" },
  { value: "measuring", label: "Instrumentos de Medição" },
  { value: "safety", label: "Equipamentos de Segurança" },
  { value: "other", label: "Outros" },
];

const entryTypes = [
  { value: "purchase", label: "Compra Nova" },
  { value: "transfer", label: "Transferência de Obra" },
];

const worksites = [
  { value: "obra-norte", label: "Obra Norte - Shopping Center" },
  { value: "obra-sul", label: "Obra Sul - Residencial Alto Padrão" },
  { value: "obra-leste", label: "Obra Leste - Complexo Industrial" },
  { value: "obra-oeste", label: "Obra Oeste - Centro Comercial" },
  { value: "deposito-central", label: "Depósito Central" },
];

export default function Entry() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [entryType, setEntryType] = useState("purchase");

  const form = useForm<InsertTool>({
    resolver: zodResolver(insertToolSchema.extend({
      availableQuantity: insertToolSchema.shape.totalQuantity,
    })),
    defaultValues: {
      name: "",
      code: "",
      category: "",
      totalQuantity: 1,
      availableQuantity: 1,
      unitPrice: undefined,
      supplier: "",
      purchaseDate: undefined,
      notes: "",
      entryType: "purchase",
      originWorksite: "",
    },
  });

  const createToolMutation = useMutation({
    mutationFn: async (data: InsertTool) => {
      const response = await apiRequest("POST", "/api/tools", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tools"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      toast({
        title: "Sucesso",
        description: "Ferramenta adicionada ao estoque",
      });
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar ferramenta",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertTool) => {
    // Set available quantity equal to total quantity for new entries
    const toolData = {
      ...data,
      availableQuantity: data.totalQuantity,
    };
    createToolMutation.mutate(toolData);
  };

  const handleClearForm = () => {
    form.reset();
  };

  return (
    <section className="p-4 space-y-6 fade-in" data-testid="entry-view">
      <div className="flex items-center space-x-3">
        <Button
          variant="secondary"
          size="icon"
          className="touch-target w-10 h-10 rounded-full"
          onClick={() => setLocation("/")}
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <h2 className="text-xl font-semibold text-foreground" data-testid="heading-new-entry">Nova Entrada</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6" data-testid="form-tool-entry">
          {/* Entry Type */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground" data-testid="heading-entry-type">Tipo de Entrada</h3>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="entryType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Entrada</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setEntryType(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12 touch-target" data-testid="select-entry-type">
                          <SelectValue placeholder="Selecione o tipo de entrada" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {entryTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {entryType === "transfer" && (
                <FormField
                  control={form.control}
                  name="originWorksite"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Obra de Origem</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 touch-target" data-testid="select-origin-worksite">
                            <SelectValue placeholder="Selecione a obra de origem" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {worksites.map((worksite) => (
                            <SelectItem key={worksite.value} value={worksite.value}>
                              {worksite.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>
          </div>

          {/* Tool Information */}
          <div className="bg-card border border-border rounded-lg p-4 space-y-4">
            <h3 className="font-medium text-foreground" data-testid="heading-tool-info">Informações da Ferramenta</h3>
            
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Ferramenta</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Furadeira Bosch GSB 450 RE"
                        className="h-12 touch-target"
                        data-testid="input-tool-name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="FUR-001"
                          className="h-12 touch-target"
                          data-testid="input-tool-code"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="totalQuantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          placeholder="1"
                          className="h-12 touch-target"
                          data-testid="input-tool-quantity"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-12 touch-target" data-testid="select-tool-category">
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Informações adicionais, estado da ferramenta, etc."
                        className="h-24 resize-none"
                        data-testid="textarea-tool-notes"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Purchase Information - Only for new purchases */}
          {entryType === "purchase" && (
            <div className="bg-card border border-border rounded-lg p-4 space-y-4">
              <h3 className="font-medium text-foreground" data-testid="heading-purchase-info">Informações de Compra</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Unitário</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="0,00"
                          className="h-12 touch-target"
                          data-testid="input-unit-price"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="purchaseDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Compra</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          className="h-12 touch-target"
                          data-testid="input-purchase-date"
                          {...field}
                          value={field.value ? new Date(field.value).toISOString().split('T')[0] : ''}
                          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="supplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fornecedor</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nome do fornecedor"
                        className="h-12 touch-target"
                        data-testid="input-supplier"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              type="submit"
              className="w-full h-12 touch-target"
              disabled={createToolMutation.isPending}
              data-testid="button-submit-entry"
            >
              <Plus className="w-4 h-4 mr-2" />
              {createToolMutation.isPending 
                ? "Adicionando..." 
                : entryType === "transfer" 
                  ? "Registrar Transferência" 
                  : "Adicionar ao Estoque"
              }
            </Button>
            
            <Button
              type="button"
              variant="secondary"
              className="w-full h-12 touch-target"
              onClick={handleClearForm}
              data-testid="button-clear-form"
            >
              <X className="w-4 h-4 mr-2" />
              Limpar Formulário
            </Button>
          </div>
        </form>
      </Form>
    </section>
  );
}
