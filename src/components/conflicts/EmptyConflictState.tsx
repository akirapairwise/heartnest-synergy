
import React from 'react';
import { AlertCircle } from "lucide-react";

const EmptyConflictState = () => {
  return (
    <div className="text-center p-6 border rounded-lg bg-muted/20">
      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-lg font-medium mb-2">No conflicts recorded</h3>
      <p className="text-muted-foreground mb-4">
        Record relationship conflicts to work through them constructively together.
      </p>
    </div>
  );
};

export default EmptyConflictState;
