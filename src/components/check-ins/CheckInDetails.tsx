
import React from 'react';
import { format } from "date-fns";
import { Clock, MessageSquare } from "lucide-react";
import { CheckIn } from '@/types/check-ins';
import { getMoodIcon, getMoodEmoji } from './MoodOptions';

interface CheckInDetailsProps {
  checkIn: CheckIn | null;
}

const CheckInDetails: React.FC<CheckInDetailsProps> = ({ checkIn }) => {
  if (!checkIn) return null;

  // Get mood value - could be in format "4_connected" or just "happy"
  const moodValue = checkIn.mood;
  const moodLabel = moodValue.includes('_') 
    ? moodValue.split('_')[1] 
    : moodValue;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="text-3xl" aria-hidden="true">
          {getMoodEmoji(moodValue)}
        </div>
        <div>
          <h3 className="font-medium flex items-center gap-2">
            Feeling {moodLabel}
            <span className="inline-block ml-1">{getMoodIcon(moodValue)}</span>
          </h3>
          <p className="text-sm text-muted-foreground">
            Satisfaction: {checkIn.satisfaction_rating}/10
          </p>
        </div>
      </div>
      
      <div className="flex items-start gap-2 mt-4">
        <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
        <span className="text-sm">
          {format(new Date(checkIn.timestamp), "MMMM d, yyyy 'at' h:mm a")}
        </span>
      </div>
      
      {checkIn.reflection && (
        <div className="flex items-start gap-2 mt-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
          <div className="bg-muted p-3 rounded-lg text-sm">
            {checkIn.reflection}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckInDetails;
