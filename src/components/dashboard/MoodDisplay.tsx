
import React from 'react';
import { Heart } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MoodEntry = {
  date: string;
  mood: number;
  note?: string;
};

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];

const MoodDisplay = () => {
  // Mock user mood data
  const userMood: MoodEntry = { 
    date: "2025-04-09", 
    mood: 4, 
    note: "Had a wonderful dinner date" 
  };
  
  // Mock partner mood data
  const partnerMood: MoodEntry = { 
    date: "2025-04-09", 
    mood: 3, 
    note: "Good conversation about future plans" 
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
                <p className={`text-sm font-medium ${moodColors[userMood.mood-1]}`}>{moodLabels[userMood.mood-1]}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-4 w-4 ${star <= userMood.mood ? moodColors[userMood.mood-1] : 'text-gray-200'}`}
                  fill={star <= userMood.mood ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{userMood.note}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://i.pravatar.cc/150?img=39" />
                <AvatarFallback>JP</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-xs text-muted-foreground">Partner</p>
                <p className={`text-sm font-medium ${moodColors[partnerMood.mood-1]}`}>{moodLabels[partnerMood.mood-1]}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-4 w-4 ${star <= partnerMood.mood ? moodColors[partnerMood.mood-1] : 'text-gray-200'}`}
                  fill={star <= partnerMood.mood ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{partnerMood.note}</p>
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
