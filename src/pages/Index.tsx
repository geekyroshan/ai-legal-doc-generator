
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, FileText, Shield, Zap } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 sm:py-32">
        <div className="container-tight">
          <div className="text-center space-y-8 animate-fade-in">
            <div className="inline-flex items-center px-4 py-2 bg-teal-50 rounded-full text-teal-700 text-sm font-medium mb-8">
              <Zap size={16} className="mr-2" />
              AI-Powered Legal Documents
            </div>
            <h1 className="text-4xl font-bold sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 leading-tight">
              Create Legal Documents<br />in Minutes
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Generate professional legal documents instantly using advanced AI. Perfect for businesses, freelancers, and individuals.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700">
                Get Started
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline" size="lg">
                View Templates
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container-tight">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 space-y-4 card-hover">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <FileText className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold">Smart Templates</h3>
              <p className="text-gray-600">
                Choose from a wide range of professionally crafted legal document templates.
              </p>
            </Card>

            <Card className="p-6 space-y-4 card-hover">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Zap className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold">AI-Powered</h3>
              <p className="text-gray-600">
                Our AI technology ensures accurate and customized legal documents in minutes.
              </p>
            </Card>

            <Card className="p-6 space-y-4 card-hover">
              <div className="h-12 w-12 bg-teal-100 rounded-lg flex items-center justify-center">
                <Shield className="h-6 w-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold">Secure & Private</h3>
              <p className="text-gray-600">
                Your documents are protected with enterprise-grade security and privacy.
              </p>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
