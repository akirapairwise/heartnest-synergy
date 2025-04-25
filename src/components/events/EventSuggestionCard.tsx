
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Map, Calendar, Clock, Heart, ExternalLink } from 'lucide-react';
import { EventSuggestion } from '@/services/eventSuggestionService';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type EventSuggestionCardProps = {
  suggestion: EventSuggestion;
  className?: string;
};

const EventSuggestionCard = ({ suggestion, className }: EventSuggestionCardProps) => {
  const getCostColor = () => {
    switch (suggestion.cost) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'high':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className={cn(
      "overflow-hidden bg-gradient-to-br from-white to-slate-50 border-slate-200 hover:shadow-md transition-all duration-300",
      className
    )}>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{suggestion.title}</h3>
        
        <p className="text-muted-foreground mb-4">{suggestion.description}</p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="outline" className={cn("font-normal", getCostColor())}>
            {suggestion.cost} cost
          </Badge>
          
          <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 font-normal">
            <Clock className="h-3 w-3 mr-1" />
            {suggestion.duration}
          </Badge>
          
          <Badge variant="outline" className="bg-purple-50 text-purple-800 border-purple-200 font-normal">
            <Map className="h-3 w-3 mr-1" />
            {suggestion.distance}
          </Badge>
        </div>
        
        <div className="flex items-start gap-2 mb-4 text-sm">
          <Heart className="h-4 w-4 text-rose-500 mt-1 flex-shrink-0" />
          <p className="text-muted-foreground">{suggestion.benefit}</p>
        </div>
        
        {suggestion.event_link && (
          <Button variant="outline" size="sm" className="w-full mt-2" asChild>
            <a href={suggestion.event_link} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              More Details
            </a>
          </Button>
        )}
      </div>
    </Card>
  );
};

export default EventSuggestionCard;
