import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Navbar from "@/components/Navbar";
import Templates from "./pages/Templates";
import CreateTemplate from "./pages/CreateTemplate";
import CreateDocument from "./pages/CreateDocument";
import Editor from "./pages/Editor"; // Import Editor Page
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useState } from "react";
import { PrivateRoute } from "./components/PrivateRoute";

const AppContent = () => {
  const { loading } = useAuth();

  if (loading) {
    console.log("App is still initializing, showing loader...");
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Index />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
        <Route
          path="/templates"
          element={
            <PrivateRoute>
              <Templates />
            </PrivateRoute>
          }
        />
      <Route
        path="/create-template"
         element={
         <PrivateRoute>
          <CreateTemplate />
       </PrivateRoute>
  }
/>

        <Route
          path="/create-document/:templateId"
          element={
            <PrivateRoute>
              <CreateDocument />
            </PrivateRoute>
          }
        />
        <Route
          path="/editor/:documentId"
          element={
            <PrivateRoute>
              <Editor />
            </PrivateRoute>
          }
        />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

const App = () => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
