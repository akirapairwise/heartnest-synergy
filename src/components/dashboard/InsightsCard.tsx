
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import WeeklyAISummary from './WeeklyAISummary';
import SuggestedActivitiesCard from './SuggestedActivitiesCard';

const InsightsCard = () => {
  return (
    <div className="space-y-6">
      <Card className="heart-card bg-gradient-to-br from-white via-calm-50/30 to-love-50/30 border-calm-100 shadow-lg hover:shadow-xl transition-all duration-300">
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
          </div>
        </CardContent>
      </Card>
      
      <SuggestedActivitiesCard />
    </div>
  );
};

export default InsightsCard;
