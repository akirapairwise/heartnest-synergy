
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, PlusCircle } from "lucide-react";

type Conflict = {
  id: number;
  topic: string;
  description: string;
  date: string;
  status: 'resolved' | 'ongoing' | 'needs-attention';
  resolution?: string;
};

const ConflictsSection = () => {
  // Mock conflicts data
  const conflicts: Conflict[] = [
    {
      id: 1,
      topic: "Communication Styles",
      description: "Different approaches to discussing problems - I prefer immediate discussions while partner prefers to process alone first.",
      date: "2025-03-15",
      status: 'resolved',
      resolution: "Agreed to give 30 mins of space before discussing important issues."
    },
    {
      id: 2,
      topic: "Financial Planning",
      description: "Disagreement about how to allocate our monthly budget and savings priorities.",
      date: "2025-04-02",
      status: 'ongoing',
    },
    {
      id: 3,
      topic: "Family Visits",
      description: "Different expectations about frequency of family visits and holidays.",
      date: "2025-04-05",
      status: 'needs-attention',
    },
  ];
  
  const statusIcons = {
    'resolved': <CheckCircle className="h-5 w-5 text-green-500" />,
    'ongoing': <Clock className="h-5 w-5 text-amber-500" />,
    'needs-attention': <AlertCircle className="h-5 w-5 text-red-500" />
  };
  
  const statusLabels = {
    'resolved': 'Resolved',
    'ongoing': 'Ongoing',
    'needs-attention': 'Needs Attention'
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Conflict Management
            </CardTitle>
            <CardDescription>Track and resolve relationship conflicts constructively</CardDescription>
          </div>
          <Button size="sm">
            <PlusCircle className="mr-2 h-4 w-4" />
            Record Conflict
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {conflicts.map((conflict) => (
            <div key={conflict.id} className="border rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-medium">{conflict.topic}</h3>
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted">
                  {statusIcons[conflict.status]}
                  <span className="text-xs">{statusLabels[conflict.status]}</span>
                </div>
              </div>
              
              <p className="text-sm text-muted-foreground mb-3">{conflict.description}</p>
              
              <div className="flex items-center text-xs text-muted-foreground mb-3">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>Recorded on {new Date(conflict.date).toLocaleDateString()}</span>
              </div>
              
              {conflict.resolution && (
                <div className="bg-green-50 p-3 rounded-md border border-green-100">
                  <p className="text-sm font-medium text-green-700 mb-1">Resolution</p>
                  <p className="text-sm text-green-600">{conflict.resolution}</p>
                </div>
              )}
              
              {conflict.status !== 'resolved' && (
                <div className="mt-3 flex justify-end">
                  <Button variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Mark as Resolved
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConflictsSection;
