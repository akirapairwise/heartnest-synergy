
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { useWeeklyAISummary } from '@/hooks/useWeeklyAISummary';

const WeeklyAISummary = () => {
  const { insight, isLoading, error, fetchWeeklyAISummary } = useWeeklyAISummary();

  useEffect(() => {
    fetchWeeklyAISummary();
  }, []);

  return (
    <Card className="bg-gradient-to-br from-harmony-50 to-calm-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-harmony-500" />
            <CardTitle className="text-md">Weekly AI Summary</CardTitle>
          </div>
        </div>
        <CardDescription>Personalized insights based on your check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-8 w-8 text-harmony-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-800 p-4 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Unable to load weekly summary</h3>
              <p className="text-sm mt-1">We'll try again next time you visit.</p>
            </div>
          </div>
        ) : insight ? (
          <div className="bg-white p-4 rounded-lg border border-harmony-100">
            <p className="text-sm whitespace-pre-line">{insight}</p>
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
