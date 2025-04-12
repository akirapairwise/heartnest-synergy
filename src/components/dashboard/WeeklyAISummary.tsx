
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useWeeklyAISummary } from '@/hooks/useWeeklyAISummary';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const WeeklyAISummary = () => {
  const { insight, isLoading, error, fetchWeeklyAISummary } = useWeeklyAISummary();

  useEffect(() => {
    // Check local storage for cached insight
    const cachedInsight = localStorage.getItem('weeklyAIInsight');
    const cachedTimestamp = localStorage.getItem('weeklyAIInsightTimestamp');
    
    // Only use cache if it's less than 24 hours old
    const useCachedInsight = cachedInsight && cachedTimestamp && 
      (Date.now() - Number(cachedTimestamp) < 24 * 60 * 60 * 1000);
    
    if (!useCachedInsight) {
      fetchWeeklyAISummary();
    }
  }, []);

  // Cache the insight when it changes
  useEffect(() => {
    if (insight) {
      localStorage.setItem('weeklyAIInsight', insight);
      localStorage.setItem('weeklyAIInsightTimestamp', Date.now().toString());
    }
  }, [insight]);

  // Use cached insight if available and no fresh data
  const displayInsight = insight || localStorage.getItem('weeklyAIInsight');

  return (
    <Card className="bg-gradient-to-br from-harmony-50 to-calm-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-harmony-500" />
            <CardTitle className="text-md">💡 Weekly AI Insight</CardTitle>
          </div>
        </div>
        <CardDescription>Based on your moods and check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 text-harmony-500 animate-spin" />
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Unable to load weekly summary</AlertTitle>
            <AlertDescription>We'll try again next time you visit.</AlertDescription>
          </Alert>
        ) : displayInsight ? (
          <div className="bg-white p-4 rounded-lg border border-harmony-100">
            <p className="text-sm whitespace-pre-line">{displayInsight}</p>
          </div>
        ) : (
          <div className="text-center py-6 text-muted-foreground">
            <p>Complete your weekly check-in to receive AI insights.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WeeklyAISummary;
