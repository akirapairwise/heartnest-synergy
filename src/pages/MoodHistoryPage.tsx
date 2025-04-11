
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MoodHistory from '@/components/moods/MoodHistory';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const MoodHistoryPage = () => {
  const { moodHistory, isFetchingHistory, fetchMoodHistory } = useMoodHistory();
  const { user, isLoading: isAuthLoading } = useAuth();
  const navigate = useNavigate();
  
  // Check authentication on mount
  React.useEffect(() => {
    if (!isAuthLoading && !user) {
      toast.error("Please log in to view your mood history");
      navigate('/auth', { replace: true });
    }
  }, [user, isAuthLoading, navigate]);
  
  // Fetch mood data when user is authenticated
  React.useEffect(() => {
    if (user && !isAuthLoading) {
      fetchMoodHistory();
    }
  }, [user, isAuthLoading, fetchMoodHistory]);
  
  // Show loading state while checking auth
  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }
  
  return (
    <div className="animate-fade-in space-y-6 pb-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood History</h1>
        <p className="text-muted-foreground">Track your relationship mood patterns over time</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="p-6">
          <CardContent className="p-0">
            <MoodHistory 
              moodHistory={moodHistory}
              isLoading={isFetchingHistory}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MoodHistoryPage;
