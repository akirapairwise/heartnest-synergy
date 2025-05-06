
import React, { useMemo, useState } from 'react';
import { format, subDays, parseISO, isValid } from "date-fns";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine } from "recharts";
import { MoodEntry } from '@/types/check-ins';
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";
import { Skeleton } from "@/components/ui/skeleton";
import { Heart, PlusCircle, Calendar, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { moodEmojis } from '@/components/dashboard/mood/MoodUtils';

interface MoodHistoryChartProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
  daysToShow?: number;
  onAddMood?: () => void;
}

const MoodHistoryChart: React.FC<MoodHistoryChartProps> = ({ 
  moodHistory, 
  isLoading,
  daysToShow = 30,
  onAddMood
}) => {
  const [timeRange, setTimeRange] = useState<'7d' | '14d' | '30d'>('30d');
  
  const getDaysToShow = (): number => {
    switch (timeRange) {
      case '7d': return 7;
      case '14d': return 14;
      default: return 30;
    }
  };
  
  const chartData = useMemo(() => {
    // Create an array for the last X days
    const today = new Date();
    const data: Array<{ date: string; formattedDate: string; mood: number | null; emoji: string }> = [];
    const days = getDaysToShow();
    
    // Initialize data array with the last X days
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, "yyyy-MM-dd");
      data.push({
        date: dateStr,
        formattedDate: format(date, "MMM d"),
        mood: null,
        emoji: "❓"
      });
    }
    
    // Fill in mood data where available
    moodHistory.forEach(entry => {
      // Ensure date is valid before processing
      const entryDate = typeof entry.date === 'string' ? entry.date.split('T')[0] : null;
      if (entryDate) {
        const dataEntry = data.find(d => d.date === entryDate);
        if (dataEntry) {
          dataEntry.mood = entry.mood;
          dataEntry.emoji = moodEmojis[entry.mood as keyof typeof moodEmojis]?.emoji || "❓";
        }
      }
    });
    
    return data;
  }, [moodHistory, timeRange]);
  
  const moodLabels = {
    1: "Struggling",
    2: "Disconnected",
    3: "Neutral",
    4: "Connected",
    5: "Thriving"
  };

  const moodColors = {
    1: "#ef4444", // red
    2: "#f97316", // orange
    3: "#eab308", // yellow
    4: "#84cc16", // green
    5: "#22c55e"  // darker green
  };
  
  const config = {
    mood: {
      label: "Mood",
      color: "#fb7185" // Using love-400 equivalent
    },
  };

  if (isLoading) {
    return <Skeleton className="w-full h-[300px] rounded-xl" />;
  }
  
  // Check if there's no meaningful mood data
  const hasMoodData = moodHistory.length > 0;
  
  if (!hasMoodData) {
    return (
      <div className="w-full h-[300px] bg-white p-6 rounded-xl border border-gray-200 flex flex-col items-center justify-center">
        <Heart className="h-12 w-12 text-love-300 mb-3" />
        <h3 className="text-lg font-medium text-gray-700 mb-2">No mood data yet</h3>
        <p className="text-sm text-gray-500 mb-4 text-center">Track your mood daily to see patterns over time</p>
        {onAddMood && (
          <Button 
            onClick={onAddMood}
            className="bg-love-50 text-love-600 border-love-200 hover:bg-love-100"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Log Today's Mood
          </Button>
        )}
      </div>
    );
  }
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value as number;
      if (value === null) return null;
      
      const mood = moodLabels[value as keyof typeof moodLabels];
      const emoji = payload[0].payload.emoji;
      
      return (
        <div className="bg-white p-3 border rounded-lg shadow-md">
          <p className="text-sm font-medium mb-1">{label}</p>
          <div className="flex items-center gap-2">
            <span className="text-lg">{emoji}</span>
            <span className="text-sm text-gray-700">{mood}</span>
          </div>
        </div>
      );
    }
    return null;
  };
  
  const CustomActiveDot = (props: any) => {
    const { cx, cy, stroke, dataKey, value, payload } = props;
    
    if (value === null) return null;
    
    return (
      <g>
        <circle cx={cx} cy={cy} r={6} stroke="white" strokeWidth={2} fill={moodColors[value as keyof typeof moodColors]} />
        <circle cx={cx} cy={cy} r={3} stroke="white" strokeWidth={1} fill={moodColors[value as keyof typeof moodColors]} />
        <text x={cx} y={cy - 15} textAnchor="middle" fill={moodColors[value as keyof typeof moodColors]} fontSize="12" fontWeight="bold">
          {payload.emoji}
        </text>
      </g>
    );
  };
  
  const renderGradient = () => (
    <defs>
      <linearGradient id="moodColorGradient" x1="0" y1="0" x2="0" y2="1">
        <stop offset="5%" stopColor="#fb7185" stopOpacity={0.8}/>
        <stop offset="95%" stopColor="#fb7185" stopOpacity={0.2}/>
      </linearGradient>
    </defs>
  );

  return (
    <div className="space-y-4 w-full">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-love-500" />
          <h3 className="font-medium text-gray-800">Mood Trends</h3>
        </div>
        <div>
          <Tabs defaultValue="30d" className="w-full sm:w-auto" onValueChange={(v) => setTimeRange(v as '7d' | '14d' | '30d')}>
            <TabsList className="w-full sm:w-auto grid grid-cols-3">
              <TabsTrigger value="7d">Week</TabsTrigger>
              <TabsTrigger value="14d">2 Weeks</TabsTrigger>
              <TabsTrigger value="30d">Month</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm h-[300px]">
        <ChartContainer config={config} className="h-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              {renderGradient()}
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
                tickFormatter={(value) => moodLabels[value as keyof typeof moodLabels].substring(0, 3) || ""}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#6b7280" }}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              {[1, 2, 3, 4, 5].map((level) => (
                <ReferenceLine 
                  key={level} 
                  y={level} 
                  stroke="#e5e7eb" 
                  strokeDasharray="3 3" 
                  opacity={0.5} 
                />
              ))}
              
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#fb7185"
                strokeWidth={2.5}
                dot={{ fill: "#fb7185", strokeWidth: 2, r: 4 }}
                activeDot={<CustomActiveDot />}
                connectNulls={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </div>
      
      <div className="flex justify-between p-2 text-xs text-gray-500">
        <span>Data from {chartData[0]?.formattedDate} to {chartData[chartData.length-1]?.formattedDate}</span>
        {onAddMood && (
          <button 
            onClick={onAddMood}
            className="inline-flex items-center text-love-600 hover:text-love-700 font-medium"
          >
            <Calendar className="h-3.5 w-3.5 mr-1" />
            Log Today
          </button>
        )}
      </div>
    </div>
  );
};

export default MoodHistoryChart;
