
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, SmilePlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

type MoodEntry = {
  date: string;
  mood: number;
  note?: string;
};

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];

const MoodCard = () => {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (user) {
      fetchRecentMoods();
    }
  }, [user]);
  
  const fetchRecentMoods = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('timestamp, mood, reflection')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(5);
        
      if (error) throw error;
      
      const formattedData = (data || []).map(entry => ({
        date: entry.timestamp,
        mood: parseInt(entry.mood.charAt(0)),
        note: entry.reflection || undefined
      }));
      
      setRecentMoods(formattedData);
    } catch (error) {
      console.error('Error fetching recent moods:', error);
      // Don't show error toast here as it's not critical for the UI
    } finally {
      setIsLoading(false);
    }
  };
  
  // Fallback to mock data if no real data is available
  const moodEntries = recentMoods.length > 0 ? recentMoods : [
    { date: "2025-04-09", mood: 4, note: "Had a wonderful dinner date" },
    { date: "2025-04-08", mood: 3, note: "Good conversation about future plans" },
    { date: "2025-04-07", mood: 2, note: "Some miscommunication today" },
    { date: "2025-04-06", mood: 4, note: "Morning walk together" },
    { date: "2025-04-05", mood: 3, note: "Quiet day at home" },
  ];
  
  const avgMood = Math.round(
    moodEntries.reduce((sum, entry) => sum + entry.mood, 0) / moodEntries.length
  );
  
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
              <div className="space-y-2 animate-pulse">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start justify-between border-b pb-2">
                    <div className="w-2/3">
                      <div className="h-4 bg-muted rounded w-20 mb-2"></div>
                      <div className="h-3 bg-muted rounded w-40"></div>
                    </div>
                    <div className="flex space-x-1">
                      {[1, 2, 3, 4, 5].map((j) => (
                        <div key={j} className="h-3 w-3 bg-muted rounded-full"></div>
                      ))}
                    </div>
                  </div>
                ))}
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
          
          <div className="flex items-center justify-center">
            <button 
              onClick={() => navigate('/moods')}
              className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
            >
              <SmilePlus className="h-4 w-4 mr-1" />
              Add new mood entry
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodCard;
