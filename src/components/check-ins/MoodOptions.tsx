
import React from 'react';
import { Smile, Meh, Frown } from "lucide-react";
import { MoodOption } from '@/types/check-ins';

export const moodOptions: MoodOption[] = [
  { 
    value: "happy", 
    label: "Happy", 
    icon: <Smile className="h-6 w-6" />, 
    color: "text-green-500" 
  },
  { 
    value: "neutral", 
    label: "Neutral", 
    icon: <Meh className="h-6 w-6" />, 
    color: "text-yellow-500" 
  },
  { 
    value: "sad", 
    label: "Sad", 
    icon: <Frown className="h-6 w-6" />, 
    color: "text-red-500" 
  },
];

export const getMoodIcon = (moodValue: string) => {
  const option = moodOptions.find(option => option.value === moodValue);
  if (option) {
    return (
      <div className={option.color}>
        {option.icon}
      </div>
    );
  }
  return <Meh className="h-6 w-6 text-gray-400" />;
};
