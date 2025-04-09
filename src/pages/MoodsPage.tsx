
import React, { useEffect } from 'react';
import MoodTracker from '@/components/moods/MoodTracker';
import MoodHistory from '@/components/moods/MoodHistory';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { useDailyMood } from '@/hooks/useDailyMood';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MoodsPage = () => {
  const { moodHistory, isFetchingHistory, fetchMoodHistory } = useMoodHistory();
  const { dailyMood, isLoading: isLoadingDailyMood, fetchDailyMood, saveDailyMood } = useDailyMood();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication on mount
  useEffect(() => {
    console.log("MoodsPage auth check - User:", !!user, "isAuthLoading:", isAuthLoading);
    if (!isAuthLoading && !user) {
      console.log("No user found, redirecting to /auth");
      toast.error("Please log in to access the mood tracker");
      navigate('/auth', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);
  
  // Fetch mood data when user is authenticated
  useEffect(() => {
    console.log("Fetch mood data effect - User:", !!user, "isAuthLoading:", isAuthLoading);
    if (user && !isAuthLoading) {
      console.log("Fetching mood data for user:", user.id);
      fetchMoodHistory();
      fetchDailyMood();
    }
  }, [user, isAuthLoading, fetchMoodHistory, fetchDailyMood]);
  
  const handleMoodSaved = () => {
    console.log("Mood saved, refreshing data");
    fetchMoodHistory();
    fetchDailyMood(); 
  };
  
  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  // If not authenticated, show a message
  if (!user) {
    return (
      <Card className="max-w-md mx-auto my-8">
        <CardHeader>
          <CardTitle>Authentication Required</CardTitle>
          <CardDescription>Please sign in to access the mood tracking feature.</CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track how you feel about your relationship over time</p>
      </div>
      
      {isLoadingDailyMood ? (
        <Card className="p-8">
          <div className="flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-muted-foreground">Loading mood data...</p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <MoodTracker 
              onMoodSaved={handleMoodSaved} 
              dailyMood={dailyMood}
            />
          </div>
          
          <div>
            <MoodHistory 
              moodHistory={moodHistory}
              isLoading={isFetchingHistory}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MoodsPage;
