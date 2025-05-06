
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import MoodHistory from '@/components/moods/MoodHistory';
import MoodHistoryChart from '@/components/moods/MoodHistoryChart';
import { useMoodHistory } from '@/hooks/useMoodHistory';
import { Loader2, Heart, Calendar, PlusCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { useDailyMood } from '@/hooks/useDailyMood';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import MoodTracker from '@/components/moods/MoodTracker';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MoodHistoryPage = () => {
  const { moodHistory, isFetchingHistory, fetchMoodHistory } = useMoodHistory();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { dailyMood, fetchDailyMood } = useDailyMood();
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
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
      fetchDailyMood();
    }
  }, [user, isAuthLoading, fetchMoodHistory, fetchDailyMood]);
  
  const handleMoodSaved = () => {
    setIsMoodDialogOpen(false);
    fetchMoodHistory();
    fetchDailyMood();
    toast.success("Mood saved successfully");
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
  
  return (
    <div className="animate-fade-in space-y-6 pb-8 max-w-4xl mx-auto px-4 pt-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Mood History</h1>
          <p className="text-muted-foreground">Track your relationship mood patterns over time</p>
        </div>
        <Button 
          onClick={() => setIsMoodDialogOpen(true)}
          className="bg-gradient-to-r from-love-400 to-harmony-400 text-white hover:from-love-500 hover:to-harmony-500 transition-colors"
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Log Today's Mood
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden border-0 shadow-md bg-gradient-to-br from-white to-gray-50">
          <Tabs defaultValue="chart" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="w-full">
                <TabsTrigger value="chart" className="flex items-center gap-1.5 flex-1">
                  Chart View
                </TabsTrigger>
                <TabsTrigger value="list" className="flex items-center gap-1.5 flex-1">
                  <Calendar className="h-4 w-4" />
                  List View
                </TabsTrigger>
              </TabsList>
            </div>
            
            <CardContent className="p-6">
              <TabsContent value="chart" className="mt-0">
                <MoodHistoryChart 
                  moodHistory={moodHistory}
                  isLoading={isFetchingHistory}
                  onAddMood={() => setIsMoodDialogOpen(true)}
                />
              </TabsContent>
              
              <TabsContent value="list" className="mt-0">
                {moodHistory.length > 0 ? (
                  <MoodHistory 
                    moodHistory={moodHistory}
                    isLoading={isFetchingHistory}
                  />
                ) : !isFetchingHistory ? (
                  <div className="py-16 text-center">
                    <Heart className="h-16 w-16 mx-auto mb-4 text-love-200" />
                    <h3 className="text-xl font-medium mb-2">No mood logs yet</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Start tracking your mood daily to gain insights into your emotional patterns
                    </p>
                    <Button 
                      onClick={() => setIsMoodDialogOpen(true)}
                      className="bg-love-500 text-white"
                    >
                      <Calendar className="h-4 w-4 mr-2" />
                      Log Your First Mood
                    </Button>
                  </div>
                ) : null}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
      
      <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">How are you feeling today?</DialogTitle>
          </DialogHeader>
          <MoodTracker 
            onMoodSaved={handleMoodSaved} 
            dailyMood={dailyMood}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MoodHistoryPage;
