
import React from 'react';
import { Card } from "@/components/ui/card";

interface GoalsEmptyStateProps {
  isSharedView: boolean;
  isPartnerView: boolean;
}

export function GoalsEmptyState({ isSharedView, isPartnerView }: GoalsEmptyStateProps) {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">
        {isSharedView 
          ? "No shared goals found. Create a shared goal to get started!" 
          : isPartnerView
            ? "Your partner hasn't shared any goals with you yet."
            : "No goals found. Create one to get started!"}
      </p>
    </Card>
  );
}
