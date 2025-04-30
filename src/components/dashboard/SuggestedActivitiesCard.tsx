import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Recommendation } from '@/services/recommendationService';
import { EventSuggestion } from '@/services/eventSuggestionService';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, CalendarDays, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from "@/components/ui/skeleton";

const SuggestedActivitiesCard = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [eventSuggestions, setEventSuggestions] = useState<EventSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        // Fetch the most recent recommendations
        const { data: recsData, error: recsError } = await supabase
          .from('ai_recommendations')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(3);
          
        if (recsError) throw recsError;
        
        // Fetch saved event suggestions if any
        const { data: eventsData, error: eventsError } = await supabase
          .from('event_suggestions')
          .select('suggestions')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        
        if (eventsError) throw eventsError;
        
        setRecommendations(recsData || []);
        
        if (eventsData?.suggestions) {
          // Get the first 2 event suggestions
          setEventSuggestions((eventsData.suggestions as EventSuggestion[]).slice(0, 2));
        }
      } catch (error) {
        console.error('Error fetching suggestions:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [user]);
  
  // Get activity icons based on category
  const getActivityIcon = (category: string) => {
    switch(category) {
      case 'books':
        return <div className="bg-amber-100 p-1.5 rounded-md"><span className="text-amber-600 text-xs">📚</span></div>;
      case 'activities':
        return <div className="bg-harmony-100 p-1.5 rounded-md"><span className="text-harmony-600 text-xs">🎮</span></div>;
      case 'date_ideas':
        return <div className="bg-love-100 p-1.5 rounded-md"><span className="text-love-600 text-xs">❤️</span></div>;
      default:
        return <div className="bg-calm-100 p-1.5 rounded-md"><span className="text-calm-600 text-xs">🌱</span></div>;
    }
  };
  
  // Extract a single sentence from the suggestion text
  const extractFirstSentence = (text: string): string => {
    if (!text) return '';
    
    // First try to extract the first bullet point if it exists
    const bulletMatch = text.match(/•\s*([^•\n]+)/);
    if (bulletMatch && bulletMatch[1]) {
      return bulletMatch[1].trim();
    }
    
    // Otherwise extract first sentence
    const sentenceMatch = text.match(/^[^.!?]+[.!?]/);
    return sentenceMatch ? sentenceMatch[0].trim() : text.substring(0, 60) + '...';
  };
  
  // Check if we have any content to display
  const hasContent = recommendations.length > 0 || eventSuggestions.length > 0;
  
  if (isLoading) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Suggested Activities
          </CardTitle>
          <CardDescription>Personalized activities for you and your partner</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
  
  if (!hasContent) {
    return (
      <Card className="shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Suggested Activities
          </CardTitle>
          <CardDescription>Find something fun to do together</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Lightbulb className="h-10 w-10 text-amber-300 mb-2" />
            <h3 className="text-base font-medium">Discover new activities</h3>
            <p className="text-sm text-muted-foreground mb-4 max-w-[240px]">
              Get personalized activity suggestions for you and your partner
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link to="/recommendations">
                  Get Recommendations
                </Link>
              </Button>
              <Button size="sm" className="bg-gradient-to-r from-purple-500 to-blue-500 text-white" asChild>
                <Link to="/event-suggestions">
                  Find Events
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle className="text-md">Suggested Activities</CardTitle>
          </div>
          <Link
            to="/recommendations"
            className="text-xs text-muted-foreground hover:text-purple-600 flex items-center"
          >
            View all
            <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </div>
        <CardDescription>Personalized activities for you and your partner</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {/* Show recommendations first */}
          {recommendations.slice(0, 2).map((rec, index) => (
            <Link 
              to="/recommendations" 
              key={`rec-${rec.id}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              {getActivityIcon(rec.category)}
              <div className="overflow-hidden">
                <p className="text-xs font-medium line-clamp-1">{extractFirstSentence(rec.suggestion)}</p>
                <p className="text-xs text-muted-foreground">{rec.category.replace('_', ' ')}</p>
              </div>
            </Link>
          ))}
          
          {/* Show event suggestions */}
          {eventSuggestions.slice(0, 2).map((event, index) => (
            <Link 
              to="/event-suggestions" 
              key={`event-${index}`}
              className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
            >
              <div className="bg-blue-100 p-1.5 rounded-md">
                <CalendarDays className="h-3 w-3 text-blue-600" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-medium line-clamp-1">{event.title}</p>
                <p className="text-xs text-muted-foreground">{event.cost} cost • {event.duration}</p>
              </div>
            </Link>
          ))}
          
          {/* If we have fewer than 4 items total, add a button for more suggestions */}
          {(recommendations.length + eventSuggestions.length) < 4 && (
            <Link 
              to="/event-suggestions"
              className="flex items-center justify-center w-full mt-1 p-2 rounded-lg border border-dashed border-muted-foreground/30 hover:border-purple-400 hover:bg-purple-50/50 transition-colors"
            >
              <span className="text-xs text-muted-foreground flex items-center">
                Discover more activities
                <ArrowRight className="h-3 w-3 ml-1" />
              </span>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SuggestedActivitiesCard;
