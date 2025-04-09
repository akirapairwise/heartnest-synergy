
import React from 'react';
import MoodTracker from '@/components/moods/MoodTracker';
import MoodHistory from '@/components/moods/MoodHistory';
import { useMoodHistory } from '@/hooks/useMoodHistory';

const MoodsPage = () => {
  const { moodHistory, isFetchingHistory, fetchMoodHistory } = useMoodHistory();
  
  const handleMoodSaved = () => {
    fetchMoodHistory();
  };
  
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track how you feel about your relationship over time</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MoodTracker onMoodSaved={handleMoodSaved} />
        </div>
        
        <div>
          <MoodHistory 
            moodHistory={moodHistory}
            isLoading={isFetchingHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default MoodsPage;
