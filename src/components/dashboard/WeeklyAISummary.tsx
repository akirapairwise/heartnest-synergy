
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
import { cn } from "@/lib/utils";

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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <Loader2 className="h-10 w-10 animate-spin text-harmony-500" />
          <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-harmony-300 opacity-70" />
          </div>
        </div>
        <span className="text-sm text-harmony-600 font-medium mt-4">Generating your insights...</span>
        <span className="text-xs text-muted-foreground mt-1">Analyzing your relationship data</span>
      </div>
    );
  } else if (status === "error") {
    content = (
      <Alert variant="destructive" className="mb-2 border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-red-800">Something went wrong</AlertTitle>
        <AlertDescription className="text-red-700">{error}</AlertDescription>
        <div className="flex justify-end mt-3">
          <Button size="sm" variant="outline" onClick={fetchSummary} className="text-harmony-700 border-harmony-300 hover:bg-harmony-50">
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
      if (parts.length <= 1) return <p className="text-harmony-800">{text}</p>;
      
      return (
        <>
          {parts.map((part, index) => {
            if (part.match(/^\d+\.$/)) {
              // This is a section number
              return (
                <div key={index} className="flex items-center mt-4 first:mt-0">
                  <div className="h-6 w-6 rounded-full bg-harmony-100 flex items-center justify-center mr-2">
                    <span className="text-xs font-semibold text-harmony-700">{part.replace('.', '')}</span>
                  </div>
                  <h4 className="font-semibold text-harmony-800">
                    {index + 1 < parts.length && parts[index + 1].split(':')[0]}
                  </h4>
                </div>
              );
            } else if (index > 0 && parts[index-1].match(/^\d+\.$/)) {
              // This is section content that follows a number
              const titleAndContent = part.split(':');
              return (
                <div key={index} className="mb-4 pl-8">
                  {titleAndContent.length > 1 ? (
                    <p className="text-harmony-700 mt-1">{titleAndContent.slice(1).join(':')}</p>
                  ) : (
                    <p className="text-harmony-700 mt-1">{part}</p>
                  )}
                </div>
              );
            }
            return part; // Regular text
          })}
        </>
      );
    };
    
    content = (
      <div className={cn(
        "bg-white rounded-lg border border-harmony-100 shadow-sm transition-all duration-300",
        expanded ? "p-6" : "p-4"
      )}>
        <div className="prose prose-sm max-w-none text-sm whitespace-pre-line">
          {renderFormattedSummary()}
        </div>
        <div className="flex justify-between mt-4 pt-3 border-t border-harmony-100">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={fetchSummary} 
            className="text-harmony-700 hover:text-harmony-800 hover:bg-harmony-50"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Refresh
          </Button>
          {summary.length > MAX_PREVIEW_LENGTH && (
            <Button
              onClick={() => setExpanded(x => !x)}
              size="sm"
              variant="outline"
              className="border-harmony-200 text-harmony-700 hover:bg-harmony-50 transition-all duration-300"
            >
              {expanded ? (
                <>
                  <span>Collapse</span> <ChevronsUp className="h-3.5 w-3.5 ml-1" />
                </>
              ) : (
                <>
                  <span>Read Full</span> <ChevronsDown className="h-3.5 w-3.5 ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    );
  } else {
    content = (
      <div className="text-center py-10 px-4">
        <div className="bg-gradient-to-br from-harmony-50/80 to-calm-50/80 p-6 rounded-xl mb-4 mx-auto w-20 h-20 flex items-center justify-center">
          <Sparkles className="h-10 w-10 text-harmony-400" />
        </div>
        <h3 className="text-lg font-medium mb-2 text-harmony-800">Get Weekly Relationship Insights</h3>
        <p className="text-sm mb-4 max-w-xs mx-auto text-harmony-600">
          Complete your weekly check-in to receive AI-powered insights about your relationship
        </p>
        <Button 
          onClick={handleCompleteSummary} 
          className="bg-gradient-to-r from-harmony-500 to-love-500 text-white hover:from-harmony-600 hover:to-love-600 shadow-sm hover:shadow transition-all duration-300"
        >
          Complete Weekly Check-in
        </Button>
      </div>
    );
  }

  return (
    <Card className={cn(
      "bg-gradient-to-br from-harmony-50 to-calm-50 border-harmony-200 shadow-md overflow-hidden",
      expanded ? "transition-all duration-300" : ""
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2 mb-1">
          <div className="bg-white/70 p-1.5 rounded-full">
            <Sparkles className="h-5 w-5 text-harmony-500" />
          </div>
          <CardTitle className="text-lg font-semibold text-harmony-800">Weekly AI Insight</CardTitle>
        </div>
        <CardDescription className="font-medium text-harmony-600">
          Based on your moods, goals & shared moments
        </CardDescription>
      </CardHeader>
      <CardContent className={cn(
        expanded ? "transition-all duration-300 pb-6" : ""
      )}>
        {content}
      </CardContent>
    </Card>
  );
};

export default WeeklyAISummary;
