
import React, { useMemo } from 'react';
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { WeeklyCheckIn } from '@/types/check-ins';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface WeeklyCheckInChartProps {
  checkIns: WeeklyCheckIn[];
  isLoading: boolean;
  weeksToShow?: number;
  onStartCheckIn?: () => void;
}

const WeeklyCheckInChart: React.FC<WeeklyCheckInChartProps> = ({ 
  checkIns,
  isLoading,
  weeksToShow = 6,
  onStartCheckIn
}) => {
  const chartData = useMemo(() => {
    if (!checkIns.length) return [];
    
    // Sort by date
    const sortedCheckIns = [...checkIns].sort((a, b) => {
      return new Date(a.checkin_date).getTime() - new Date(b.checkin_date).getTime();
    });
    
    // Take only the last N weeks
    const recentCheckIns = sortedCheckIns.slice(-weeksToShow);
    
    // Transform check-ins into chart data
    return recentCheckIns.map(checkIn => {
      const date = new Date(checkIn.checkin_date);
      
      // Map mood string to numeric value
      let moodValue = 3; // Default neutral
      if (checkIn.mood.includes('1_')) moodValue = 1;
      else if (checkIn.mood.includes('2_')) moodValue = 2;
      else if (checkIn.mood.includes('3_')) moodValue = 3;
      else if (checkIn.mood.includes('4_')) moodValue = 4;
      else if (checkIn.mood.includes('5_')) moodValue = 5;
      
      return {
        date: format(date, "MMM d"),
        connection: checkIn.connection_level,
        communication: checkIn.communication_rating,
        mood: moodValue
      };
    });
  }, [checkIns, weeksToShow]);
  
  const config = {
    connection: {
      label: "Connection",
      color: "#f472b6" // love-400
    },
    communication: {
      label: "Communication",
      color: "#38bdf8" // harmony-400
    },
    mood: {
      label: "Mood",
      color: "#fbbf24" // yellow-400
    }
  };
  
  if (isLoading) {
    return <Skeleton className="w-full h-[250px]" />;
  }
  
  if (checkIns.length === 0) {
    return (
      <div className="w-full h-[250px] bg-white p-6 rounded-lg border border-gray-200 flex flex-col items-center justify-center">
        <Calendar className="h-10 w-10 text-harmony-300 mb-3" />
        <h3 className="text-base font-medium text-gray-700 mb-1">No weekly check-ins yet</h3>
        <p className="text-sm text-gray-500 mb-4 text-center max-w-xs">
          Complete your first weekly check-in to start tracking your relationship metrics
        </p>
        {onStartCheckIn && (
          <Button 
            onClick={onStartCheckIn}
            className="bg-gradient-to-r from-harmony-500 to-love-500 text-white"
          >
            Start Weekly Check-in
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Weekly Relationship Metrics</h3>
      <ChartContainer config={config} className="h-[250px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
            />
            <YAxis
              domain={[0, 5]}
              ticks={[0, 1, 2, 3, 4, 5]}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
            />
            <Tooltip content={<ChartTooltipContent />} />
            <ReferenceLine y={0} stroke="#e5e7eb" />
            <Bar dataKey="connection" fill={config.connection.color} radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="communication" fill={config.communication.color} radius={[4, 4, 0, 0]} barSize={15} />
            <Bar dataKey="mood" fill={config.mood.color} radius={[4, 4, 0, 0]} barSize={15} />
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default WeeklyCheckInChart;
