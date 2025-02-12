import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { generateDocument } from "@/lib/anthropic";
import { useAuth } from "@/contexts/AuthContext";

// Define the expected structure of the template
interface Template {
  id: string;
  title: string;
  description: string;
  category: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  content: string;
}

// Define form fields
interface FormField {
  id: string;
  label: string;
  type: "text" | "textarea" | "date" | "email";
  placeholder: string;
  required: boolean;
}

const CreateDocument = () => {
  const { templateId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // Fetch template details with error logging
  const { data: template, isLoading, error } = useQuery<Template>({
    queryKey: ['template', templateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', templateId)
        .single();

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      if (!data) {
        throw new Error('Template data not found!');
      }

      console.log('Fetched template:', data);
      return data as Template;
    },
  });

  if (error) {
    return <div className="text-red-600 text-center mt-10">Failed to load template: {error.message}</div>;
  }

  // Generate form fields based on template category
  const getFormFields = (): FormField[] => {
    switch (template?.category) {
      case 'nda':
        return [
          { id: 'partyA', label: 'Party A (Company Name)', type: 'text', placeholder: 'Enter company name', required: true },
          { id: 'partyB', label: 'Party B (Recipient Name)', type: 'text', placeholder: 'Enter recipient name', required: true },
          { id: 'purpose', label: 'Purpose of Disclosure', type: 'textarea', placeholder: 'Describe the purpose of sharing confidential information', required: true },
          { id: 'duration', label: 'Duration (in years)', type: 'text', placeholder: 'Enter duration', required: true },
        ];
      default:
        return [];
    }
  };

  // Handle form data changes
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Submit the form and generate document
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);

    try {
      console.log('Submitting form data:', formData);
      const generatedContent = await generateDocument(template, formData);

      const { data: document, error } = await supabase
        .from('documents')
        .insert({
          title: `${template?.title} - ${new Date().toLocaleDateString()}`,
          content: generatedContent,
          template_id: templateId,
          created_by: user?.id,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Document Generated",
        description: "Your document has been created successfully.",
      });

      navigate(`/editor/${document.id}`);
    } catch (error: any) {
      console.error("Document generation error:", error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        <p className="text-gray-600 mt-4">Loading template...</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <Breadcrumb className="mb-8">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/templates">Templates</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink>{template?.title}</BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">{template?.title}</h1>
        <p className="text-gray-600 mb-8">{template?.description}</p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {getFormFields().map((field) => (
            <div key={field.id} className="space-y-2">
              <label htmlFor={field.id} className="text-sm font-medium">{field.label}</label>
              <Input id={field.id} type={field.type} placeholder={field.placeholder} required={field.required} value={formData[field.id] || ''} onChange={(e) => handleInputChange(field.id, e.target.value)} />
            </div>
          ))}

          <Button type="submit" disabled={isGenerating}>{isGenerating ? 'Generating...' : 'Generate Document'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateDocument;
