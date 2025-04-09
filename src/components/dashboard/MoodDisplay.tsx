
import React, { useEffect, useState } from 'react';
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

type MoodEntry = {
  date: string;
  mood: number;
  note?: string;
};

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];

const MoodDisplay = () => {
  const [userMood, setUserMood] = useState<MoodEntry | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodEntry | null>(null);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchLatestMoods();
    }
  }, [user]);
  
  const fetchLatestMoods = async () => {
    try {
      // Fetch user's latest mood
      const { data: userData, error: userError } = await supabase
        .from('check_ins')
        .select('timestamp, mood, reflection')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(1)
        .single();
        
      if (!userError && userData) {
        setUserMood({
          date: userData.timestamp,
          mood: parseInt(userData.mood.charAt(0)),
          note: userData.reflection || undefined
        });
      }
      
      // In a real app, you would fetch the partner's mood
      // For now, we'll use mock data for the partner
      setPartnerMood({ 
        date: new Date().toISOString(), 
        mood: 3, 
        note: "Good conversation about future plans" 
      });
      
    } catch (error) {
      console.error('Error fetching mood data:', error);
      // Don't show error toast here as it's not critical for the UI
    }
  };
  
  // Default display if no data is available
  const defaultUserMood: MoodEntry = userMood || { 
    date: new Date().toISOString(), 
    mood: 3, 
    note: "No recent check-in" 
  };
  
  const defaultPartnerMood: MoodEntry = partnerMood || { 
    date: new Date().toISOString(), 
    mood: 3, 
    note: "No recent check-in" 
  };
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-3 flex items-center">
          <Heart className="h-4 w-4 text-love-500 mr-1.5" />
          Today's Mood
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://api.dicebear.com/7.x/initials/svg?seed=AU" />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">You</p>
                <p className={`text-sm font-medium ${moodColors[defaultUserMood.mood-1]}`}>{moodLabels[defaultUserMood.mood-1]}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-4 w-4 ${star <= defaultUserMood.mood ? moodColors[defaultUserMood.mood-1] : 'text-gray-200'}`}
                  fill={star <= defaultUserMood.mood ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{defaultUserMood.note}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/150?img=39" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Partner</p>
                <p className={`text-sm font-medium ${moodColors[defaultPartnerMood.mood-1]}`}>{moodLabels[defaultPartnerMood.mood-1]}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-4 w-4 ${star <= defaultPartnerMood.mood ? moodColors[defaultPartnerMood.mood-1] : 'text-gray-200'}`}
                  fill={star <= defaultPartnerMood.mood ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{defaultPartnerMood.note}</p>
          </div>
        </div>
        
        <div className="mt-3 text-center">
          <a 
            href="/moods"
            className="inline-flex items-center text-xs text-harmony-600 hover:text-harmony-700"
          >
            View mood history
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodDisplay;
