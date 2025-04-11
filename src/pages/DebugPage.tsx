
import React from "react";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";
import PartnerCodeDebugger from "@/components/debug/PartnerCodeDebugger";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DebugPage = () => {
  useDocumentTitle("Debug Tools | HeartNest");
  const navigate = useNavigate();
  
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-6">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate('/dashboard')}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Debug Tools</h1>
        <p className="text-muted-foreground">
          These tools help troubleshoot application functionality
        </p>
      </div>
      
      <div className="space-y-6">
        <PartnerCodeDebugger />
      </div>
    </div>
  );
};

export default DebugPage;
