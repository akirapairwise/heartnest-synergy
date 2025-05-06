
import React from 'react';
import { Smile, Meh, Frown, Heart, HeartCrack, HeartOff, HeartHandshake } from "lucide-react";
import { MoodOption } from '@/types/check-ins';

export const moodOptions: MoodOption[] = [
  { 
    value: "happy", 
    label: "Happy", 
    icon: <Heart className="h-6 w-6" fill="currentColor" />, 
    color: "text-green-500",
    emoji: "😊"
  },
  { 
    value: "neutral", 
    label: "Neutral", 
    icon: <Meh className="h-6 w-6" />, 
    color: "text-yellow-500",
    emoji: "😐"
  },
  { 
    value: "sad", 
    label: "Sad", 
    icon: <HeartCrack className="h-6 w-6" />, 
    color: "text-red-500",
    emoji: "😔"
  },
  {
    value: "thriving",
    label: "Thriving",
    icon: <HeartHandshake className="h-6 w-6" fill="currentColor" />,
    color: "text-green-600",
    emoji: "🥰"
  },
  {
    value: "struggling",
    label: "Struggling",
    icon: <HeartOff className="h-6 w-6" />,
    color: "text-red-600",
    emoji: "😢"
  }
];

export const getMoodIcon = (moodValue: string) => {
  // Parse mood values like "4_connected" to extract just the string part
  const cleanedValue = moodValue.includes('_') 
    ? moodValue.split('_')[1] 
    : moodValue;
    
  const option = moodOptions.find(option => 
    option.value === cleanedValue || option.value === moodValue
  );
  
  if (option) {
    return (
      <div className={option.color}>
        {option.icon}
      </div>
    );
  }
  
  // Default icon if no match found
  return <Meh className="h-6 w-6 text-gray-400" />;
};

export const getMoodEmoji = (moodValue: string) => {
  // Parse mood values like "4_connected" to extract just the string part
  const cleanedValue = moodValue.includes('_') 
    ? moodValue.split('_')[1] 
    : moodValue;
    
  const option = moodOptions.find(option => 
    option.value === cleanedValue || option.value === moodValue
  );
  
  return option?.emoji || "😐";
};

