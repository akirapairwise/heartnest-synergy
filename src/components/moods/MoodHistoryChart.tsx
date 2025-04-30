
import React, { useMemo } from 'react';
import { format, subDays } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { MoodEntry } from '@/types/check-ins';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";

interface MoodHistoryChartProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
  daysToShow?: number;
}

const MoodHistoryChart: React.FC<MoodHistoryChartProps> = ({ 
  moodHistory, 
  isLoading,
  daysToShow = 7
}) => {
  const chartData = useMemo(() => {
    // Create an array for the last X days
    const today = new Date();
    const data: Array<{ date: string; formattedDate: string; mood: number | null }> = [];
    
    // Initialize data array with the last X days
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      data.push({
        date: dateStr,
        formattedDate: format(date, "MMM d"),
        mood: null
      });
    }
    
    // Fill in mood data where available
    moodHistory.forEach(entry => {
      const entryDate = entry.date.split('T')[0]; // Get just the date part
      const dataEntry = data.find(d => d.date === entryDate);
      if (dataEntry) {
        dataEntry.mood = entry.mood;
      }
    });
    
    return data;
  }, [moodHistory, daysToShow]);
  
  const moodLabels = {
    1: "Very Low",
    2: "Low",
    3: "Neutral",
    4: "Good",
    5: "Excellent"
  };
  
  const config = {
    mood: {
      label: "Mood",
      color: "#fb7185" // Using love-400 equivalent
    },
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }
  
  return (
    <div className="w-full bg-white p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-medium mb-3">Mood Trends</h3>
      <ChartContainer config={config} className="h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
            <XAxis 
              dataKey="formattedDate"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              dy={10}
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tickFormatter={(value) => moodLabels[value as keyof typeof moodLabels] || ""}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              width={70}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const value = payload[0].value as number;
                  return (
                    <ChartTooltipContent
                      active={active}
                      payload={payload}
                      label={label}
                      formatter={(val) => [
                        `${moodLabels[Number(val) as keyof typeof moodLabels] || val}`,
                        "Mood"
                      ]}
                    />
                  );
                }
                return null;
              }}
            />
            <Line
              type="monotone"
              dataKey="mood"
              stroke="#fb7185"
              strokeWidth={2}
              dot={{ fill: "#fb7185", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#fb7185", stroke: "#fff", strokeWidth: 2 }}
              connectNulls={true}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};

export default MoodHistoryChart;
