import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, SmilePlus, History } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MoodEntry } from '@/types/check-ins';

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];

const MoodCard = () => {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchRecentMoods();
    } else {
      setIsLoading(false);
    }
  }, [user]);
  
  const fetchRecentMoods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('id, timestamp, mood, reflection')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      const formattedData = (data || []).map(entry => ({
        id: entry.id,
        date: entry.timestamp,
        mood: parseInt(entry.mood.charAt(0)),
        note: entry.reflection
      }));
      
      setRecentMoods(formattedData);
    } catch (error: any) {
      console.error('Error fetching recent moods:', error);
      setError('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback to mock data if no real data is available
  const moodEntries = recentMoods.length > 0 ? recentMoods : [
    { id: "1", date: "2025-04-09", mood: 4, note: "Had a wonderful dinner date" },
    { id: "2", date: "2025-04-08", mood: 3, note: "Good conversation about future plans" },
    { id: "3", date: "2025-04-07", mood: 2, note: "Some miscommunication today" },
    { id: "4", date: "2025-04-06", mood: 4, note: "Morning walk together" },
    { id: "5", date: "2025-04-05", mood: 3, note: "Quiet day at home" },
  ];
  
  const avgMood = moodEntries.length > 0 
    ? Math.round(moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length)
    : 3; // Default to neutral if no mood data
  
  return (
    <Card className="heart-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-love-500" />
            <CardTitle className="text-md">Mood Tracker</CardTitle>
          </div>
          <TrendingUp className="h-5 w-5 text-harmony-500" />
        </div>
        <CardDescription>Track your emotional connection</CardDescription>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="text-center py-4 text-red-500">
            <p>{error}</p>
            <button 
              onClick={() => fetchRecentMoods()} 
              className="mt-2 text-sm text-harmony-600 hover:text-harmony-700"
            >
              Try again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Current mood:</p>
              <div className="flex items-center">
                <span className={`font-medium ${moodColors[avgMood-1]}`}>{moodLabels[avgMood-1]}</span>
                <div className="flex ml-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Heart
                      key={star}
                      className={`h-4 w-4 ${star <= avgMood ? moodColors[avgMood-1] : 'text-gray-200'}`}
                      fill={star <= avgMood ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Recent entries</span>
                <span className="text-muted-foreground">{moodEntries.length} entries</span>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-2">
                  {moodEntries.slice(0, 3).map((entry, index) => (
                    <div key={index} className="flex items-start justify-between border-b pb-2">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{entry.note}</p>
                      </div>
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Heart
                            key={star}
                            className={`h-3 w-3 ${star <= entry.mood ? moodColors[entry.mood-1] : 'text-gray-200'}`}
                            fill={star <= entry.mood ? 'currentColor' : 'none'}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate('/moods')}
                className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
              >
                <SmilePlus className="h-4 w-4 mr-1" />
                Add mood
              </button>
              
              <button 
                onClick={() => navigate('/mood-history')}
                className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
              >
                <History className="h-4 w-4 mr-1" />
                View history
              </button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodCard;
