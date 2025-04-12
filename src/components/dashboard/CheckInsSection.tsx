
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react'; 
import RecentCheckIns from '../check-ins/RecentCheckIns';
import WeeklyCheckInCard from './WeeklyCheckInCard';

const CheckInsSection = () => {
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Weekly Check-In Card */}
        <WeeklyCheckInCard />
        
        {/* Existing Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-medium">Recent Check-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <RecentCheckIns limit={3} />
            <Button
              variant="outline"
              size="sm"
              className="w-full mt-4"
              onClick={() => navigate('/check-ins')}
            >
              View All Check-ins
              <ExternalLink className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <Button
        variant="outline"
        className="w-full"
        onClick={() => navigate('/check-ins')}
      >
        View Check-In History
        <ExternalLink className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default CheckInsSection;
