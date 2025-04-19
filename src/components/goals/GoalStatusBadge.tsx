
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { GoalStatus } from "@/types/goals";

interface GoalStatusBadgeProps {
  status: GoalStatus;
  className?: string; // Added className prop as optional
}

export function GoalStatusBadge({ status, className }: GoalStatusBadgeProps) {
  let variant: "default" | "secondary" | "destructive" | "outline" = "default";
  let statusText = "Unknown";
  
  switch (status) {
    case 'pending':
      variant = "outline";
      statusText = "Pending";
      break;
    case 'in_progress':
      variant = "secondary";
      statusText = "In Progress";
      break;
    case 'completed':
      variant = "default";
      statusText = "Completed";
      break;
    case 'cancelled':
      variant = "destructive";
      statusText = "Cancelled";
      break;
  }
  
  return (
    <Badge variant={variant} className={className}>
      {statusText}
    </Badge>
  );
}
