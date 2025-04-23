
import React, { useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle, Loader2, RotateCcw } from "lucide-react";
import { useWeeklyAISummary } from "@/hooks/useWeeklyAISummary";
import { Button } from "@/components/ui/button";

const WeeklyAISummary = () => {
  const { status, summary, error, fetchSummary } = useWeeklyAISummary();

  useEffect(() => {
    // Fetch insight on mount
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  let content;
  if (status === "loading") {
    content = (
      <div className="flex flex-col items-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-harmony-500 mb-2" />
        <span className="text-xs text-muted-foreground">Generating your weekly summary...</span>
      </div>
    );
  } else if (status === "error") {
    content = (
      <Alert variant="destructive" className="mb-2">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="outline" onClick={fetchSummary}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        </div>
      </Alert>
    );
  } else if (summary) {
    content = (
      <div className="bg-white p-4 rounded-lg border border-harmony-100">
        <p className="text-sm whitespace-pre-line">{summary}</p>
        <div className="flex justify-end mt-2">
          <Button variant="ghost" size="xs" onClick={fetchSummary}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-center py-6 text-muted-foreground text-sm">
        <p>Complete your weekly check-in to receive your AI insight summary.</p>
        <div className="flex justify-center mt-4">
          <Button size="sm" variant="outline" onClick={fetchSummary}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Get Insight
          </Button>
        </div>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-harmony-50 to-calm-50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-harmony-500" />
            <CardTitle className="text-md">💡 Weekly AI Insight</CardTitle>
          </div>
        </div>
        <CardDescription>Based on your moods, goals & shared moments</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default WeeklyAISummary;
