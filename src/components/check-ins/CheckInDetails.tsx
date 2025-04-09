
import React from 'react';
import { format } from "date-fns";
import { Clock, MessageSquare } from "lucide-react";
import { CheckIn } from '@/types/check-ins';
import { getMoodIcon } from './MoodOptions';

interface CheckInDetailsProps {
  checkIn: CheckIn | null;
}

const CheckInDetails: React.FC<CheckInDetailsProps> = ({ checkIn }) => {
  if (!checkIn) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="p-2 bg-muted rounded-full">
          {getMoodIcon(checkIn.mood)}
        </div>
        <div>
          <h3 className="font-medium">
            Feeling {checkIn.mood}
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
