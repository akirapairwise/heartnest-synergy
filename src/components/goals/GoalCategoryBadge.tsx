
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { GoalCategory } from "@/types/goals";

interface GoalCategoryBadgeProps {
  category: GoalCategory | null | undefined;
}

export function GoalCategoryBadge({ category }: GoalCategoryBadgeProps) {
  if (!category) return null;
  
  const getCategoryStyles = () => {
    switch (category) {
      case 'communication':
        return "bg-blue-100 text-blue-800";
      case 'quality-time':
        return "bg-purple-100 text-purple-800";
      case 'adventure':
        return "bg-green-100 text-green-800";
      case 'understanding':
        return "bg-yellow-100 text-yellow-800";
      case 'growth':
        return "bg-orange-100 text-orange-800";
      case 'intimacy':
        return "bg-pink-100 text-pink-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };
  
  const getCategoryLabel = () => {
    switch (category) {
      case 'communication':
        return "Communication";
      case 'quality-time':
        return "Quality Time";
      case 'adventure':
        return "Adventure";
      case 'understanding':
        return "Understanding";
      case 'growth':
        return "Personal Growth";
      case 'intimacy':
        return "Intimacy";
      default:
        return "Other";
    }
  };
  
  return (
    <Badge variant="outline" className={`${getCategoryStyles()} border-0`}>
      {getCategoryLabel()}
    </Badge>
  );
}
