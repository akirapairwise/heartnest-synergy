
import React from 'react';
import { Card } from "@/components/ui/card";

export function EmptySharedGoals() {
  return (
    <Card className="p-6 text-center">
      <p className="text-muted-foreground">
        No shared goals yet. Create a shared goal to get started!
      </p>
    </Card>
  );
}
