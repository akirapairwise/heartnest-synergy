
import React, { useMemo } from 'react';
import { format } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { WeeklyCheckIn } from '@/types/check-ins';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface WeeklyCheckInChartProps {
  checkIns: WeeklyCheckIn[];
  isLoading: boolean;
  weeksToShow?: number;
}

const WeeklyCheckInChart: React.FC<WeeklyCheckInChartProps> = ({ 
  checkIns,
  isLoading,
  weeksToShow = 6
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
      <div className="w-full h-[250px] bg-white p-4 rounded-lg border border-gray-200 flex items-center justify-center">
        <p className="text-muted-foreground">No weekly check-in data available</p>
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
