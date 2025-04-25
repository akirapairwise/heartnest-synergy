
import React from 'react';
import { Card } from '@/components/ui/card';
import { Sparkles, BookOpen, Calendar, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

type RecommendationCardProps = {
  category: string;
  suggestion: string;
  className?: string;
};

const RecommendationCard = ({ category, suggestion, className }: RecommendationCardProps) => {
  // Split the suggestion into bullet points
  const points = suggestion.split('•').filter(Boolean).map(point => point.trim());

  const getCategoryIcon = () => {
    switch (category) {
      case 'books':
        return <BookOpen className="h-5 w-5 text-love-500" />;
      case 'activities':
        return <Activity className="h-5 w-5 text-harmony-500" />;
      case 'date_ideas':
        return <Calendar className="h-5 w-5 text-calm-500" />;
      default:
        return <Sparkles className="h-5 w-5 text-primary" />;
    }
  };

  const getCategoryClass = () => {
    switch (category) {
      case 'books':
        return 'from-love-50 to-love-100/30 border-love-200';
      case 'activities':
        return 'from-harmony-50 to-harmony-100/30 border-harmony-200';
      case 'date_ideas':
        return 'from-calm-50 to-calm-100/30 border-calm-200';
      default:
        return 'from-primary-50 to-primary-100/30 border-primary-200';
    }
  };

  return (
    <Card className={cn(
      "p-6 bg-gradient-to-br shadow-sm hover:shadow-md transition-all duration-300",
      getCategoryClass(),
      className
    )}>
      <div className="flex items-start gap-4">
        <div className="rounded-full bg-white p-2 shadow-sm">
          {getCategoryIcon()}
        </div>
        <div className="flex-1 space-y-4">
          <h3 className="font-semibold text-lg capitalize flex items-center gap-2">
            {category.replace('_', ' ')}
          </h3>
          <ul className="space-y-2">
            {points.map((point, index) => (
              <li key={index} className="flex items-start gap-2 text-sm leading-relaxed">
                <span className="text-primary mt-1">•</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Card>
  );
};

export default RecommendationCard;
