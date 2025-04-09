
import React from 'react';
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { CheckIn } from '@/types/check-ins';
import { getMoodIcon } from './MoodOptions';

interface RecentCheckInsProps {
  checkIns: CheckIn[];
  onViewCheckIn: (checkIn: CheckIn) => void;
}

const RecentCheckIns: React.FC<RecentCheckInsProps> = ({ checkIns, onViewCheckIn }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Recent Check-Ins</CardTitle>
        <CardDescription>Your latest emotional check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        {checkIns.length > 0 ? (
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
            {checkIns.slice(0, 10).map((checkIn) => (
              <div 
                key={checkIn.id} 
                className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => onViewCheckIn(checkIn)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getMoodIcon(checkIn.mood)}
                    <div>
                      <div className="font-medium capitalize">{checkIn.mood}</div>
                      <div className="text-xs text-muted-foreground">
                        {format(new Date(checkIn.timestamp), "MMMM d, yyyy • h:mm a")}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    {checkIn.satisfaction_rating}/10
                  </div>
                </div>
                {checkIn.reflection && (
                  <div className="mt-2 pl-8 pr-2 text-sm text-muted-foreground line-clamp-2">
                    {checkIn.reflection}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
            <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
            <p>No check-ins yet</p>
            <Button 
              variant="link" 
              className="mt-2" 
              onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Create your first check-in
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentCheckIns;
