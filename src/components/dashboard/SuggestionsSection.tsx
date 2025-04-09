
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, ThumbsUp, ThumbsDown, Calendar } from "lucide-react";

type Suggestion = {
  id: number;
  category: 'activity' | 'habit' | 'conversation';
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'challenging';
  timeframe: 'now' | 'this week' | 'this month';
};

const SuggestionsSection = () => {
  // Mock suggestions data
  const suggestions: Suggestion[] = [
    {
      id: 1,
      category: 'activity',
      title: "Surprise Breakfast in Bed",
      description: "Wake up a little earlier and prepare your partner's favorite breakfast. The surprise element will add extra joy.",
      difficulty: 'easy',
      timeframe: 'now'
    },
    {
      id: 2,
      category: 'conversation',
      title: "Dreams and Aspirations Check-in",
      description: "Set aside 30 minutes to discuss your individual and shared dreams for the future. What are you both working toward?",
      difficulty: 'medium',
      timeframe: 'this week'
    },
    {
      id: 3,
      category: 'habit',
      title: "Technology-Free Evening",
      description: "Designate one evening each week as technology-free. Focus solely on each other without digital distractions.",
      difficulty: 'challenging',
      timeframe: 'this month'
    },
    {
      id: 4,
      category: 'activity',
      title: "Try a New Restaurant Together",
      description: "Choose a cuisine you've never tried before and make it an adventure to experience new flavors together.",
      difficulty: 'easy',
      timeframe: 'this week'
    },
  ];
  
  const difficultyBadges = {
    'easy': <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded">Easy</span>,
    'medium': <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded">Medium</span>,
    'challenging': <span className="bg-red-100 text-red-700 text-xs px-2 py-0.5 rounded">Challenging</span>
  };
  
  const timeframeIcons = {
    'now': <Calendar className="h-4 w-4 text-green-500" />,
    'this week': <Calendar className="h-4 w-4 text-amber-500" />,
    'this month': <Calendar className="h-4 w-4 text-blue-500" />
  };
  
  const categoryColors = {
    'activity': 'border-l-purple-500',
    'habit': 'border-l-blue-500',
    'conversation': 'border-l-teal-500'
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-500" />
          Relationship Suggestions
        </CardTitle>
        <CardDescription>AI-powered ideas to strengthen your connection</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {suggestions.map((suggestion) => (
            <div 
              key={suggestion.id} 
              className={`border-l-4 ${categoryColors[suggestion.category]} rounded-lg p-4 bg-card shadow-sm`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-medium">{suggestion.title}</h3>
                {difficultyBadges[suggestion.difficulty]}
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{suggestion.description}</p>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs">
                  {timeframeIcons[suggestion.timeframe]}
                  <span className="capitalize">{suggestion.timeframe}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 px-2">
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <Button>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate More Suggestions
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestionsSection;
