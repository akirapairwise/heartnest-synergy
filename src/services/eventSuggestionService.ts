
import { supabase } from '@/integrations/supabase/client';

export type EventSuggestion = {
  title: string;
  description: string;
  cost: 'low' | 'medium' | 'high';
  duration: string;
  distance: string;
  benefit: string;
  event_link?: string;
};

export type EventSuggestionParams = {
  location?: string;
  mood?: string;
  interests?: string;
  dietaryPreferences?: string;
  budget?: string;
  timing?: string;
  specialDates?: string;
};

export const generateEventSuggestions = async (
  params: EventSuggestionParams
): Promise<EventSuggestion[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase.functions.invoke('generate-event-suggestions', {
      body: {
        userId: user.id,
        ...params
      }
    });
    
    if (error) {
      console.error('Error generating event suggestions:', error);
      throw new Error(error.message);
    }
    
    return data.suggestions;
  } catch (error) {
    console.error('Error in generateEventSuggestions:', error);
    throw error;
  }
};

export const fetchSavedEventSuggestions = async (): Promise<EventSuggestion[]> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');
    
    const { data, error } = await supabase
      .from('event_suggestions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
      
    if (error) {
      if (error.code === 'PGRST116') {
        // No saved suggestions found
        return [];
      }
      throw error;
    }
    
    return data?.suggestions || [];
  } catch (error) {
    console.error('Error fetching saved event suggestions:', error);
    return [];
  }
};
