
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

const LoadingState: React.FC = () => {
  return (
    <Card className="shadow-sm overflow-hidden bg-gradient-to-b from-white to-gray-50 border-none">
      <CardContent className="p-6 flex justify-center items-center min-h-[200px]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-harmony-500 mb-3" />
          <p className="text-sm text-muted-foreground">Loading mood data...</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LoadingState;
