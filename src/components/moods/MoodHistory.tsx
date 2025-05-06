
import React from 'react';
import { MoodEntry } from '@/types/check-ins';
import { format, parseISO, isValid } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Calendar, MessageSquare } from 'lucide-react';
import { moodEmojis } from '../dashboard/mood/MoodUtils';

interface MoodHistoryProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

const MoodHistory: React.FC<MoodHistoryProps> = ({ moodHistory, isLoading }) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (moodHistory.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No mood entries found.</p>
      </div>
    );
  }

  // Group entries by month for better organization
  const groupedByMonth: Record<string, MoodEntry[]> = {};
  
  moodHistory.forEach(entry => {
    let date = typeof entry.date === 'string' ? entry.date : '';
    if (!date) return;
    
    // Try to parse the date
    const parsedDate = parseISO(date);
    if (!isValid(parsedDate)) return;
    
    const month = format(parsedDate, 'MMMM yyyy');
    
    if (!groupedByMonth[month]) {
      groupedByMonth[month] = [];
    }
    groupedByMonth[month].push(entry);
  });

  return (
    <div className="space-y-6">
      {Object.entries(groupedByMonth).map(([month, entries]) => (
        <div key={month} className="space-y-3">
          <h3 className="text-lg font-medium text-gray-700">{month}</h3>
          <div className="space-y-3">
            {entries.map(entry => {
              const parsedDate = typeof entry.date === 'string' ? parseISO(entry.date) : new Date();
              const moodInfo = moodEmojis[entry.mood as keyof typeof moodEmojis];
              
              return (
                <Card key={entry.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`text-2xl ${moodInfo?.color || 'text-gray-400'}`}>
                        {moodInfo?.emoji || '😐'}
                      </div>
                      <div>
                        <h4 className={`font-medium ${moodInfo?.color || 'text-gray-700'}`}>
                          {moodInfo?.label || 'Neutral'}
                        </h4>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{format(parsedDate, 'EEEE, MMMM d, yyyy')}</span>
                          {entry.timestamp && (
                            <span className="ml-2">
                              at {format(new Date(entry.timestamp), 'h:mm a')}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`rounded-full w-10 h-10 flex items-center justify-center ${moodInfo?.bgColor || 'bg-gray-100'}`}>
                      <span className="text-lg">{entry.mood}</span>
                    </div>
                  </div>
                  {entry.note && (
                    <div className="mt-3 pl-10">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <p className="text-sm text-gray-600">{entry.note}</p>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MoodHistory;
