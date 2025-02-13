import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Loader2, PlusCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Template {
  id: string;
  title: string;
  description: string;
  content: string;
  created_at: string;
  created_by: string;
  is_public: boolean;
}

const Templates = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Fetch templates from Supabase
  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          title: "Error loading templates",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return data as Template[];
    },
  });

  const categories = [
    { id: "all", name: "All Templates" },
    { id: "nda", name: "NDAs" },
    { id: "rental", name: "Rental Agreements" },
    { id: "will", name: "Wills" },
    { id: "business", name: "Business Contracts" },
  ];

  const handleTemplateSelect = (templateId: string) => {
    navigate(`/create-document/${templateId}`);
  };

  return (
    <div className="container py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <p className="text-gray-600">Choose a template or create a new one.</p>
        </div>
        <Button onClick={() => navigate('/create-template')} className="flex items-center bg-teal-600 hover:bg-teal-700">
          <PlusCircle className="mr-2" />
          Create Template
        </Button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            onClick={() => setSelectedCategory(category.id)}
            className="whitespace-nowrap"
          >
            {category.name}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates?.map((template) => (
          <Card 
            key={template.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleTemplateSelect(template.id)}
          >
            <CardHeader>
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <CardTitle>{template.title}</CardTitle>
              <CardDescription>{template.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Use Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {isLoading && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      )}
    </div>
  );
};

export default Templates;
