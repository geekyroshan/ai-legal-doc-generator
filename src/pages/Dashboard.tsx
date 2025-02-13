import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Trash, FileText, Download, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { downloadAsPDF, downloadAsDOCX } from "@/lib/export-utils";

interface Document {
  id: string;
  title: string;
  content: string;
  created_at: string;
  template_id: string;
  created_by: string;
  status: string;
}

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch user-generated documents
  const { data: documents, isLoading } = useQuery({
    queryKey: ["documents", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .eq("created_by", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Document[];
    },
    enabled: !!user?.id, // Only run query if user is logged in
  });

  // Delete document mutation
  const deleteDocument = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("documents").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "Deleted", description: "Document deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["documents", user?.id] });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocument.mutate(id);
    }
  };

  const handleDownload = async (doc: Document, format: "pdf" | "docx") => {
    try {
      const fileName = `${doc.title.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}`;

      if (format === "pdf") {
        await downloadAsPDF(doc.content, fileName);
      } else {
        await downloadAsDOCX(doc.content, fileName);
      }

      toast({ title: "Download Started", description: `Your document is being downloaded as ${format.toUpperCase()}` });
    } catch (error: any) {
      toast({ title: "Download Failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">My Documents</h1>

      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search documents..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full mb-6 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
      />

      {/* Document Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents
            ?.filter((doc) => doc.title.toLowerCase().includes(searchQuery.toLowerCase()))
            .map((doc) => (
              <Card key={doc.id} className="relative p-4 shadow-md border">
                <CardHeader>
                  <CardTitle className="text-lg">{doc.title}</CardTitle>
                  <CardDescription>Created on: {new Date(doc.created_at).toLocaleDateString()}</CardDescription>
                </CardHeader>
                <CardContent className="flex justify-between items-center">
                  <div className="flex gap-2">
                    <Button variant="outline" size="icon" onClick={() => navigate(`/editor/${doc.id}`)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={() => handleDownload(doc, "pdf")}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                  <Button variant="destructive" size="icon" onClick={() => handleDelete(doc.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
        </div>
      )}

      {documents?.length === 0 && !isLoading && (
        <p className="text-gray-500 text-center mt-10">No documents found. Generate a new document to get started.</p>
      )}
    </div>
  );
};

export default Dashboard;
