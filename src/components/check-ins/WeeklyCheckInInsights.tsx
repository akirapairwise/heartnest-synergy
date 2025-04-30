
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { WeeklyCheckIn } from '@/types/check-ins';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartBarIcon, FileBarChart, Calendar, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import WeeklyCheckInChart from './WeeklyCheckInChart';
import ResolutionSummary from '../conflicts/resolution/ResolutionSummary';
import { useWeeklyAISummary } from '@/hooks/useWeeklyAISummary';
import { Button } from '@/components/ui/button';
import WeeklyCheckInForm from './WeeklyCheckInForm';

const WeeklyCheckInInsights: React.FC = () => {
  const [checkIns, setCheckIns] = useState<WeeklyCheckIn[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { user } = useAuth();
  
  const { summary, status: summaryStatus, fetchSummary } = useWeeklyAISummary();
  
  const fetchCheckIns = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('weekly_check_ins')
        .select('*')
        .eq('user_id', user.id)
        .order('checkin_date', { ascending: false })
        .limit(8);
        
      if (error) throw error;
      setCheckIns(data as WeeklyCheckIn[]);
    } catch (error) {
      console.error('Error fetching weekly check-ins:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchCheckIns();
  }, [user]);
  
  const getAverageMetrics = () => {
    if (!checkIns.length) return { connection: 0, communication: 0 };
    
    const sum = checkIns.reduce((acc, curr) => {
      return {
        connection: acc.connection + curr.connection_level,
        communication: acc.communication + curr.communication_rating
      };
    }, { connection: 0, communication: 0 });
    
    return {
      connection: parseFloat((sum.connection / checkIns.length).toFixed(1)),
      communication: parseFloat((sum.communication / checkIns.length).toFixed(1))
    };
  };
  
  const handleCheckInComplete = () => {
    fetchCheckIns();
    fetchSummary();
    setIsFormOpen(false);
  };
  
  const averages = getAverageMetrics();
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileBarChart className="h-5 w-5 text-love-500" />
            Relationship Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="charts">Charts</TabsTrigger>
              <TabsTrigger value="ai-summary">AI Summary</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
                </div>
              ) : checkIns.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-harmony-50 p-4 rounded-lg border border-harmony-100">
                      <div className="text-xs text-harmony-600 mb-1">Avg. Connection</div>
                      <div className="text-2xl font-semibold text-harmony-700">{averages.connection}/5</div>
                      <div className="flex mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-full mr-0.5 rounded-full ${
                              i < Math.round(averages.connection) ? 'bg-harmony-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="bg-love-50 p-4 rounded-lg border border-love-100">
                      <div className="text-xs text-love-600 mb-1">Avg. Communication</div>
                      <div className="text-2xl font-semibold text-love-700">{averages.communication}/5</div>
                      <div className="flex mt-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`h-1 w-full mr-0.5 rounded-full ${
                              i < Math.round(averages.communication) ? 'bg-love-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium mb-3">Recent Check-ins</h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                      {checkIns.slice(0, 5).map(checkIn => (
                        <div key={checkIn.id} className="p-3 border rounded-lg hover:bg-muted/30">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-sm font-medium">
                                {format(new Date(checkIn.checkin_date), 'MMMM d, yyyy')}
                              </p>
                              <div className="flex gap-4 mt-1 text-xs">
                                <span>Connection: {checkIn.connection_level}/5</span>
                                <span>Communication: {checkIn.communication_rating}/5</span>
                              </div>
                            </div>
                            <div className="text-lg">{
                              checkIn.mood.includes('1_') ? '😞' :
                              checkIn.mood.includes('2_') ? '😔' :
                              checkIn.mood.includes('3_') ? '😐' :
                              checkIn.mood.includes('4_') ? '🙂' : '😊'
                            }</div>
                          </div>
                          {checkIn.reflection_note && (
                            <p className="text-xs text-muted-foreground mt-2 italic">
                              "{checkIn.reflection_note}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground/50" />
                  <h3 className="text-lg font-medium mb-2">No check-ins recorded yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                    Weekly check-ins help you track your relationship progress and receive personalized insights
                  </p>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-to-r from-love-500 to-harmony-500 text-white"
                  >
                    Complete Your First Check-in
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="charts">
              <WeeklyCheckInChart 
                checkIns={checkIns} 
                isLoading={isLoading}
                onStartCheckIn={() => setIsFormOpen(true)}
              />
            </TabsContent>
            
            <TabsContent value="ai-summary" className="min-h-[300px]">
              {summaryStatus === 'loading' ? (
                <div className="flex justify-center items-center h-[300px]">
                  <Skeleton className="w-full h-[300px]" />
                </div>
              ) : summary ? (
                <div className="max-w-4xl mx-auto">
                  <ResolutionSummary summary={summary} />
                </div>
              ) : (
                <div className="h-[300px] flex flex-col items-center justify-center">
                  <Sparkles className="h-12 w-12 text-muted-foreground/50 mb-4" />
                  <h3 className="text-lg font-medium mb-2">No AI insights available yet</h3>
                  <p className="text-muted-foreground mb-6 text-center max-w-sm">
                    Complete at least one weekly check-in to receive personalized AI insights about your relationship
                  </p>
                  <Button 
                    onClick={() => setIsFormOpen(true)}
                    className="bg-gradient-to-r from-harmony-500 to-love-500 text-white"
                  >
                    Start Weekly Check-in
                  </Button>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <WeeklyCheckInForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        onCheckInComplete={handleCheckInComplete}
      />
    </div>
  );
};

export default WeeklyCheckInInsights;
