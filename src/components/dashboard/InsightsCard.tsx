
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import WeeklyAISummary from './WeeklyAISummary';
import SuggestedActivitiesCard from './SuggestedActivitiesCard';

const InsightsCard = () => {
  return (
    <div className="space-y-6">
      <Card className="heart-card bg-gradient-to-br from-white via-calm-50/30 to-love-50/30 border-calm-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-calm-500" />
              <CardTitle className="text-md">AI Insights</CardTitle>
            </div>
          </div>
          <CardDescription>Personalized recommendations for your relationship</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <WeeklyAISummary />
            
            <div className="bg-gradient-to-br from-harmony-50 to-calm-50 p-4 rounded-lg border border-harmony-100">
              <h3 className="text-sm font-medium text-harmony-700 mb-1">Weekly Relationship Review</h3>
              <p className="text-xs text-muted-foreground">
                Based on your mood entries and interactions this week:
              </p>
              
              <div className="mt-3 space-y-2">
                <div className="flex items-start gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Communication is improving</p>
                    <p className="text-xs text-muted-foreground">You've been more open about your feelings</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-2">
                  <TrendingDown className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-medium">Quality time is decreasing</p>
                    <p className="text-xs text-muted-foreground">Try scheduling a date night this weekend</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <SuggestedActivitiesCard />
    </div>
  );
};

export default InsightsCard;
