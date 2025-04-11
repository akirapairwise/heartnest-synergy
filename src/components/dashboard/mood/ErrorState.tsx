
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  error: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onRetry }) => {
  return (
    <Card className="shadow-sm overflow-hidden bg-gradient-to-b from-white to-gray-50 border-none">
      <CardContent className="p-6 text-center">
        <AlertCircle className="h-10 w-10 text-amber-500 mx-auto mb-3" />
        <p className="text-sm text-red-500 mb-3 font-medium">{error}</p>
        <Button 
          onClick={onRetry} 
          variant="outline"
          size="sm"
          className="gap-2 hover:bg-gray-100"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Try again
        </Button>
      </CardContent>
    </Card>
  );
};

export default ErrorState;
