
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Heart, MessageSquare, PlusCircle } from "lucide-react";

type CheckIn = {
  id: number;
  date: string;
  moodRating: number;
  note: string;
  tags: string[];
};

const CheckInsSection = () => {
  // Mock check-in data
  const checkIns: CheckIn[] = [
    {
      id: 1,
      date: "2025-04-08",
      moodRating: 4,
      note: "Had a wonderful dinner date and discussed future plans together. Feeling very connected.",
      tags: ["date night", "future planning", "communication"]
    },
    {
      id: 2,
      date: "2025-04-05",
      moodRating: 3,
      note: "Quiet weekend at home. Watched movies and relaxed together.",
      tags: ["quality time", "relaxation"]
    },
    {
      id: 3,
      date: "2025-04-02",
      moodRating: 2,
      note: "Minor argument about household chores. Need to work on better division of responsibilities.",
      tags: ["conflict", "chores", "communication"]
    },
  ];
  
  const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-love-500" />
              Relationship Check-Ins
            </CardTitle>
            <CardDescription>Track how you're feeling about your relationship</CardDescription>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Check-In
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {checkIns.map((checkIn) => (
            <div key={checkIn.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 text-muted-foreground mr-2" />
                  <p className="text-sm font-medium">
                    {new Date(checkIn.date).toLocaleDateString('en-US', { 
                      weekday: 'short',
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <Heart
                      key={rating}
                      className={`h-4 w-4 ${rating <= checkIn.moodRating ? moodColors[checkIn.moodRating-1] : 'text-gray-200'}`}
                      fill={rating <= checkIn.moodRating ? 'currentColor' : 'none'}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex gap-2 items-start mb-3">
                <MessageSquare className="h-4 w-4 text-muted-foreground mt-1 flex-shrink-0" />
                <p className="text-sm">{checkIn.note}</p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {checkIn.tags.map((tag, idx) => (
                  <span 
                    key={idx} 
                    className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CheckInsSection;
