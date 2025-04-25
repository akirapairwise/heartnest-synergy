import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ThumbsUp, ThumbsDown, BookOpen, Activity, Calendar, Brain } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { 
  fetchRecommendations, 
  generateRecommendation, 
  generateAIRecommendation,
  updateRecommendationFeedback, 
  Recommendation 
} from '@/services/recommendationService';
import { toast } from 'sonner';
import RecommendationCard from '@/components/recommendations/RecommendationCard';

const SuggestionsSection = () => {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { user } = useAuth();
  
  const fetchUserRecommendations = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const data = await fetchRecommendations(user.id, selectedCategory !== 'all' ? selectedCategory : undefined);
      setRecommendations(data);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      toast.error('Failed to load recommendations');
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchUserRecommendations();
  }, [user, selectedCategory]);
  
  const handleGenerateRecommendation = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      await generateRecommendation(user.id, selectedCategory);
      toast.success('New recommendation generated!');
      fetchUserRecommendations();
    } catch (error) {
      console.error('Error generating recommendation:', error);
      toast.error('Failed to generate recommendation');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleFeedback = async (id: string, isLiked: boolean) => {
    try {
      await updateRecommendationFeedback(id, isLiked);
      
      // Update local state to reflect the change
      setRecommendations(prev => 
        prev.map(rec => 
          rec.id === id ? { ...rec, is_liked: isLiked } : rec
        )
      );
      
      toast.success(isLiked ? 'Recommendation liked!' : 'Recommendation noted');
    } catch (error) {
      console.error('Error updating feedback:', error);
      toast.error('Failed to update feedback');
    }
  };
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'books':
        return <BookOpen className="h-4 w-4 text-purple-500" />;
      case 'activities':
        return <Activity className="h-4 w-4 text-blue-500" />;
      case 'date_ideas':
        return <Calendar className="h-4 w-4 text-green-500" />;
      default:
        return <Sparkles className="h-4 w-4 text-amber-500" />;
    }
  };
  
  const getCategoryColors = (category: string) => {
    switch (category) {
      case 'books':
        return 'border-l-purple-500';
      case 'activities':
        return 'border-l-blue-500';
      case 'date_ideas':
        return 'border-l-green-500';
      default:
        return 'border-l-amber-500';
    }
  };

  const handleGenerateAIRecommendation = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      await generateAIRecommendation(user.id, selectedCategory !== 'all' ? selectedCategory : undefined);
      toast.success('AI-powered recommendation generated!');
      fetchUserRecommendations();
    } catch (error) {
      console.error('Error generating AI recommendation:', error);
      toast.error('Failed to generate AI recommendation');
    } finally {
      setIsGenerating(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              Relationship Suggestions
            </CardTitle>
            <CardDescription>AI-powered ideas to strengthen your connection</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="books">Books</SelectItem>
                <SelectItem value="activities">Activities</SelectItem>
                <SelectItem value="date_ideas">Date Ideas</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleGenerateAIRecommendation}
            disabled={isGenerating}
          >
            <Brain className="mr-2 h-4 w-4 text-purple-500" />
            {isGenerating ? 'Generating AI Suggestion...' : 'Generate AI Suggestion'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-pulse text-muted-foreground">Loading suggestions...</div>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12 space-y-4">
            <Sparkles className="h-12 w-12 text-muted-foreground mx-auto" />
            <p className="text-muted-foreground">No suggestions found for this category</p>
            <Button onClick={handleGenerateRecommendation} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Generate a Suggestion'}
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4">
              {recommendations.map((recommendation) => (
                <RecommendationCard
                  key={recommendation.id}
                  category={recommendation.category}
                  suggestion={recommendation.suggestion}
                  className="animate-fade-in"
                />
              ))}
            </div>
            
            <div className="mt-6 text-center">
              <Button onClick={handleGenerateRecommendation} disabled={isGenerating}>
                <Sparkles className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate More Suggestions'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SuggestionsSection;
