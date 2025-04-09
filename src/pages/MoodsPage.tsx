
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar } from "lucide-react";
import { useToast } from '@/components/ui/use-toast';

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodDescriptions = [
  "Feeling distant and experiencing conflict",
  "Not feeling very connected, communication is difficult",
  "Ok but could be better, some ups and downs",
  "Feeling good about our relationship, positive interactions",
  "Strong connection, deep trust, and mutual support"
];

const MoodsPage = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const { toast } = useToast();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMood === null) {
      toast({
        title: "Please select a mood",
        description: "Select how you're feeling about your relationship today",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, this would save to the database
    toast({
      title: "Mood tracked successfully!",
      description: "Your relationship mood has been recorded."
    });
    
    // Reset form
    setSelectedMood(null);
    setNote("");
  };
  
  // Mock mood history (in a real app, this would come from a database)
  const moodHistory = [
    { date: "2025-04-09", mood: 4, note: "Had a wonderful dinner date" },
    { date: "2025-04-08", mood: 3, note: "Good conversation about future plans" },
    { date: "2025-04-07", mood: 2, note: "Some miscommunication today" },
    { date: "2025-04-06", mood: 4, note: "Morning walk together" },
    { date: "2025-04-05", mood: 3, note: "Quiet day at home" },
    { date: "2025-04-04", mood: 5, note: "Celebrated our anniversary" },
    { date: "2025-04-03", mood: 3, note: "Normal day, nothing special" },
  ];
  
  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mood Tracker</h1>
        <p className="text-muted-foreground">Track how you feel about your relationship over time</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>How are you feeling about your relationship today?</CardTitle>
              <CardDescription>Your partner won't see your response until they submit theirs</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-3 justify-between">
                    {[1, 2, 3, 4, 5].map((mood) => (
                      <button
                        key={mood}
                        type="button"
                        className={`flex-1 min-w-[100px] flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                          selectedMood === mood 
                            ? 'border-primary bg-primary/10' 
                            : 'border-muted hover:border-muted-foreground/50'
                        }`}
                        onClick={() => setSelectedMood(mood)}
                      >
                        <div className="flex">
                          {Array(mood).fill(0).map((_, i) => (
                            <Heart 
                              key={i} 
                              className={`h-5 w-5 ${
                                mood === 1 ? 'text-red-500' :
                                mood === 2 ? 'text-orange-400' :
                                mood === 3 ? 'text-yellow-500' :
                                mood === 4 ? 'text-green-400' :
                                'text-green-600'
                              }`}
                              fill="currentColor"
                            />
                          ))}
                          {Array(5 - mood).fill(0).map((_, i) => (
                            <Heart 
                              key={i} 
                              className="h-5 w-5 text-gray-200"
                            />
                          ))}
                        </div>
                        <span className="mt-2 font-medium text-sm">{moodLabels[mood-1]}</span>
                        <p className="text-xs text-muted-foreground text-center mt-1">
                          {moodDescriptions[mood-1]}
                        </p>
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2 mt-4">
                    <label className="text-sm font-medium">Add a note (optional)</label>
                    <Textarea 
                      placeholder="What's on your mind about your relationship today?"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full btn-primary-gradient">
                  Save Mood Entry
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-md">Mood History</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <CardDescription>Your recent mood entries</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {moodHistory.map((entry, index) => (
                  <div key={index} className="border-b pb-3 last:border-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium">
                          {new Date(entry.date).toLocaleDateString('en-US', { 
                            weekday: 'short',
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">{entry.note}</p>
                      </div>
                      <div className="flex mt-1">
                        {Array(entry.mood).fill(0).map((_, i) => (
                          <Heart 
                            key={i} 
                            className={`h-4 w-4 ${
                              entry.mood === 1 ? 'text-red-500' :
                              entry.mood === 2 ? 'text-orange-400' :
                              entry.mood === 3 ? 'text-yellow-500' :
                              entry.mood === 4 ? 'text-green-400' :
                              'text-green-600'
                            }`}
                            fill="currentColor"
                          />
                        ))}
                        {Array(5 - entry.mood).fill(0).map((_, i) => (
                          <Heart key={i} className="h-4 w-4 text-gray-200" />
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodsPage;
