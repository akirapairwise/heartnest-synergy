
import React from 'react';
import { Sparkles } from "lucide-react";

const ProcessingState = () => {
  return (
    <div className="text-center p-8">
      <Sparkles className="mx-auto h-12 w-12 text-amber-500 mb-4" />
      <h3 className="text-lg font-medium mb-2">AI is working on a resolution</h3>
      <p className="text-muted-foreground">The AI is analyzing both perspectives to provide guidance.</p>
    </div>
  );
};

export default ProcessingState;
