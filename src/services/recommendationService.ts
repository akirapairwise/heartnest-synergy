
import { supabase } from '@/integrations/supabase/client';

export type Recommendation = {
  id: string;
  category: string;
  context: string | null;
  suggestion: string;
  created_at: string;
  is_liked: boolean | null;
};

export const fetchRecommendations = async (userId: string, category?: string): Promise<Recommendation[]> => {
  let query = supabase
    .from('ai_recommendations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
    
  if (category && category !== 'all') {
    query = query.eq('category', category);
  }
  
  const { data, error } = await query;
  
  if (error) throw error;
  return (data || []) as Recommendation[];
};

export const updateRecommendationFeedback = async (recommendationId: string, isLiked: boolean): Promise<void> => {
  const { error } = await supabase
    .from('ai_recommendations')
    .update({ is_liked: isLiked })
    .eq('id', recommendationId);
    
  if (error) throw error;
};

// This is a mock function to demonstrate how recommendations would be generated
// In a real app, this would connect to an AI service or edge function
export const generateRecommendation = async (userId: string, category: string): Promise<void> => {
  // Example categories: 'books', 'activities', 'date_ideas'
  const recommendations = {
    books: [
      "Try reading 'The 5 Love Languages' by Gary Chapman to better understand each other's needs",
      "Read 'Attached' by Amir Levine and Rachel Heller to explore attachment styles in relationships",
      "Explore 'Hold Me Tight' by Dr. Sue Johnson for insights on emotional bonding"
    ],
    activities: [
      "Start a weekly tradition of trying new recipes together",
      "Create a shared bucket list of experiences you'd like to have together",
      "Try a 30-day couples' challenge to build new habits together"
    ],
    date_ideas: [
      "Plan a surprise picnic at a scenic spot with your partner's favorite foods",
      "Take a dance class together - it's fun and builds connection through physical touch",
      "Visit a local museum or art gallery and discuss which pieces resonate with you both"
    ],
    general: [
      "Practice active listening by summarizing what your partner says before responding",
      "Schedule regular check-ins about your relationship goals and growth",
      "Create a gratitude practice where you share one thing you appreciate about each other daily"
    ]
  };
  
  const categoryOptions = category === 'all' ? ['books', 'activities', 'date_ideas', 'general'] : [category];
  const selectedCategory = categoryOptions[Math.floor(Math.random() * categoryOptions.length)];
  const randomSuggestion = recommendations[selectedCategory as keyof typeof recommendations][
    Math.floor(Math.random() * recommendations[selectedCategory as keyof typeof recommendations].length)
  ];
  
  const context = "Based on your recent relationship patterns";
  
  const { error } = await supabase
    .from('ai_recommendations')
    .insert({
      user_id: userId,
      category: selectedCategory,
      context,
      suggestion: randomSuggestion
    });
    
  if (error) throw error;
};
