import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const categories = [
  { id: "nda", name: "NDAs" },
  { id: "rental", name: "Rental Agreements" },
  { id: "will", name: "Wills" },
  { id: "business", name: "Business Contracts" },
];

const CreateTemplate = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("nda");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data, error } = await supabase
        .from("templates")
        .insert([
          {
            title,
            category,
            content,
            created_by: user?.id,
            is_public: true,
          },
        ])
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Template created successfully!",
      });

      navigate("/templates");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not create template.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Create New Template</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border p-2 rounded">
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <Textarea placeholder="Template Content" value={content} onChange={(e) => setContent(e.target.value)} required />
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Template"}</Button>
        </form>
      </Card>
    </div>
  );
};

export default CreateTemplate;
