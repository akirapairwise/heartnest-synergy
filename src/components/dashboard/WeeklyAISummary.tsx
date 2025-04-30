
import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle, Loader2, ChevronsDown, ChevronsUp, RotateCcw } from "lucide-react";
import { useWeeklyAISummary } from "@/hooks/useWeeklyAISummary";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const MAX_PREVIEW_LENGTH = 180;

const WeeklyAISummary = () => {
  const { status, summary, error, fetchSummary } = useWeeklyAISummary();
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
    // eslint-disable-next-line
  }, []);

  // A helper to condense the summary to a short preview
  function getSummaryPreview(text: string) {
    if (!text) return "";
    if (text.length <= MAX_PREVIEW_LENGTH) return text;
    // Cut at last sentence end before MAX_PREVIEW_LENGTH if possible
    const trimmed = text.slice(0, MAX_PREVIEW_LENGTH);
    const lastPeriod = trimmed.lastIndexOf(".");
    return lastPeriod > 60 ? trimmed.slice(0, lastPeriod + 1).trim() : trimmed.trim() + "...";
  }

  const handleCompleteSummary = () => {
    navigate('/check-ins');
  };

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
          <Button size="sm" variant="outline" onClick={fetchSummary} className="text-harmony-700 border-harmony-300">
            <RotateCcw className="h-4 w-4 mr-1" />
            Try Again
          </Button>
        </div>
      </Alert>
    );
  } else if (summary) {
    const shouldTruncate = summary.length > MAX_PREVIEW_LENGTH && !expanded;
    
    // Parse sections from the summary (assuming format: "1. Section title", "2. Section title", etc.)
    const renderFormattedSummary = () => {
      const text = shouldTruncate ? getSummaryPreview(summary) : summary;
      
      // Split by number + period pattern (1., 2., 3., etc.)
      const parts = text.split(/(\d+\.)\s/g);
      if (parts.length <= 1) return text;
      
      return (
        <>
          {parts.map((part, index) => {
            if (part.match(/^\d+\.$/)) {
              // This is a section number
              return <span key={index} className="font-semibold text-harmony-600">{part} </span>;
            } else if (index > 0 && parts[index-1].match(/^\d+\.$/)) {
              // This is section content that follows a number
              return (
                <div key={index} className="mb-2">
                  <span>{part}</span>
                </div>
              );
            }
            return part; // Regular text
          })}
        </>
      );
    };
    
    content = (
      <div className="bg-white p-4 rounded-lg border border-harmony-100 shadow-sm">
        <div className="prose prose-sm max-w-none text-sm whitespace-pre-line text-harmony-900">
          {renderFormattedSummary()}
        </div>
        <div className="flex justify-between mt-3 pt-2 border-t border-harmony-100">
          <Button variant="ghost" size="sm" onClick={fetchSummary} className="text-harmony-700">
            <RotateCcw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          {summary.length > MAX_PREVIEW_LENGTH && (
            <Button
              onClick={() => setExpanded(x => !x)}
              size="sm"
              variant="outline"
              className="border-harmony-200 text-harmony-700"
            >
              {expanded ? (
                <>
                  Collapse <ChevronsUp className="h-4 w-4 ml-1" />
                </>
              ) : (
                <>
                  Read Full <ChevronsDown className="h-4 w-4 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-center py-8 text-muted-foreground">
        <Sparkles className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
        <h3 className="text-lg font-medium mb-2 text-gray-700">Get Weekly Relationship Insights</h3>
        <p className="text-sm mb-4 max-w-xs mx-auto">
          Complete your weekly check-in to receive AI-powered insights about your relationship
        </p>
        <Button 
          onClick={handleCompleteSummary} 
          size="sm" 
          className="bg-gradient-to-r from-harmony-500 to-love-500 text-white"
        >
          Complete Weekly Check-in
        </Button>
      </div>
    );
  }

  return (
    <Card className="bg-gradient-to-br from-harmony-50 to-calm-50 border-harmony-200 shadow-md">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-6 w-6 text-harmony-500" />
          <CardTitle className="text-lg font-semibold text-harmony-800">Weekly AI Insight</CardTitle>
        </div>
        <CardDescription className="font-medium text-harmony-600">Based on your moods, goals & shared moments</CardDescription>
      </CardHeader>
      <CardContent>{content}</CardContent>
    </Card>
  );
};

export default WeeklyAISummary;
