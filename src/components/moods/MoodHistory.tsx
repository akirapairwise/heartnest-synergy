
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Heart, Loader2 } from "lucide-react";
import { MoodEntry } from '@/types/check-ins';

interface MoodHistoryProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ moodHistory, isLoading }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-md">Mood History</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </div>
        <CardDescription>Your recent mood entries</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : moodHistory.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mood entries yet.</p>
            <p className="text-sm mt-1">Track your first mood above!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {moodHistory.map((entry) => (
              <div key={entry.id} className="border-b pb-3 last:border-0">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm font-medium">
                      {new Date(entry.date).toLocaleDateString('en-US', { 
                        weekday: 'short',
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                  </div>
                  <div className="flex mt-1">
                    {Array(entry.mood).fill(0).map((_, i) => (
                      <Heart 
                        key={i} 
                        className={`h-4 w-4 ${
                          entry.mood === 1 ? 'text-red-500' :
                          entry.mood === 2 ? 'text-orange-400' :
                          entry.mood === 3 ? 'text-yellow-500' :
                          entry.mood === 4 ? 'text-green-400' :
                          'text-green-600'
                        }`}
                        fill="currentColor"
                      />
                    ))}
                    {Array(5 - entry.mood).fill(0).map((_, i) => (
                      <Heart key={`empty-${i}`} className="h-4 w-4 text-gray-200" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MoodHistory;
