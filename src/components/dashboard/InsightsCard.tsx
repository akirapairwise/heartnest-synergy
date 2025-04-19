import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, TrendingUp, TrendingDown } from "lucide-react";
import WeeklyAISummary from './WeeklyAISummary';

const InsightsCard = () => {
  return (
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
          
          <div>
            <h3 className="text-sm font-medium mb-2">Suggested Activities</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="bg-love-100 p-1.5 rounded-md">
                  <span className="text-love-600 text-xs">❤️</span>
                </div>
                <div>
                  <p className="text-xs font-medium">Share a gratitude moment</p>
                  <p className="text-xs text-muted-foreground">Express appreciation for something specific</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="bg-harmony-100 p-1.5 rounded-md">
                  <span className="text-harmony-600 text-xs">🎮</span>
                </div>
                <div>
                  <p className="text-xs font-medium">Game night</p>
                  <p className="text-xs text-muted-foreground">Try a new board game together</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <div className="bg-calm-100 p-1.5 rounded-md">
                  <span className="text-calm-600 text-xs">🌱</span>
                </div>
                <div>
                  <p className="text-xs font-medium">Start a small project</p>
                  <p className="text-xs text-muted-foreground">Plant herbs or redecorate a room together</p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-center">
            <a 
              href="/insights"
              className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700"
            >
              View all insights
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-4 h-4 ml-1"
              >
                <path
                  fillRule="evenodd"
                  d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsCard;
