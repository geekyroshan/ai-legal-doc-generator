
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";
import { Link } from "react-router-dom";

type Template = Database['public']['Tables']['templates']['Row'];

const Templates = () => {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  const { data: templates, isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
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

  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container-tight">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold">Document Templates</h1>
          <Button onClick={() => setIsCreating(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="mr-2 h-4 w-4" />
            New Template
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {templates?.map((template) => (
            <Card key={template.id} className="p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg">{template.title}</h3>
                  {template.description && (
                    <p className="text-sm text-gray-500">{template.description}</p>
                  )}
                </div>
                <FileText className="h-5 w-5 text-gray-400" />
              </div>
              
              <div className="pt-4 flex items-center justify-between border-t">
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <Button size="sm" asChild>
                  <Link to={`/documents/new?template=${template.id}`}>
                    Use Template
                  </Link>
                </Button>
              </div>
            </Card>
          ))}

          {templates?.length === 0 && (
            <div className="col-span-full text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">No templates yet</h3>
              <p className="mt-2 text-gray-500">Create your first document template to get started.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Templates;
