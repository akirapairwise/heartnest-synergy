
import React from 'react';
import { Heart, Loader2 } from "lucide-react";
import { MoodEntry } from '@/types/check-ins';
import { format } from 'date-fns';

interface MoodHistoryProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ moodHistory, isLoading }) => {
  return (
    <div>
      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : moodHistory.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <p>No mood entries yet.</p>
          <p className="text-sm mt-1">Track your first mood to see your history!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {moodHistory.map((entry) => {
            // Ensure mood is a valid number between 1-5
            const moodValue = Math.max(1, Math.min(5, entry.mood || 0));
            const emptyHearts = Math.max(0, 5 - moodValue);
            
            return (
              <div key={entry.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                      {entry.timestamp && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {format(new Date(entry.timestamp), 'h:mm a')}
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                  </div>
                  <div className="flex mt-1">
                    {/* Filled hearts based on mood value */}
                    {Array.from({ length: moodValue }).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`h-4 w-4 ${
                          moodValue === 1 ? 'text-red-500' :
                          moodValue === 2 ? 'text-orange-400' :
                          moodValue === 3 ? 'text-yellow-500' :
                          moodValue === 4 ? 'text-green-400' :
                          'text-green-600'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                    {/* Empty hearts to fill the remaining space */}
                    {Array.from({ length: emptyHearts }).map((_, i) => (
                      <Heart key={`empty-${i}`} className="h-4 w-4 text-gray-200" />
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MoodHistory;
