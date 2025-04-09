
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Calendar } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodDescriptions = [
  "Feeling distant and experiencing conflict",
  "Not feeling very connected, communication is difficult",
  "Ok but could be better, some ups and downs",
  "Feeling good about our relationship, positive interactions",
  "Strong connection, deep trust, and mutual support"
];

type MoodEntry = {
  id: string;
  date: string;
  mood: number;
  note?: string;
};

const MoodsPage = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchMoodHistory();
    }
  }, [user]);
  
  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('check_ins')
        .select('id, timestamp, mood, reflection')
        .eq('user_id', user?.id)
        .order('timestamp', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      const formattedData = (data || []).map(entry => ({
        id: entry.id,
        date: entry.timestamp,
        mood: parseInt(entry.mood.charAt(0)),
        note: entry.reflection
      }));
      
      setMoodHistory(formattedData);
    } catch (error) {
      console.error('Error fetching mood history:', error);
      toast.error('Failed to load mood history');
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedMood === null) {
      toast.error('Please select a mood');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to save a mood entry');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const moodString = `${selectedMood}_${moodLabels[selectedMood-1].toLowerCase()}`;
      
      const { error } = await supabase
        .from('check_ins')
        .insert({
          mood: moodString,
          reflection: note || null,
          satisfaction_rating: selectedMood * 2,
          user_id: user.id,
        });

      if (error) throw error;
      
      toast.success('Mood tracked successfully!');
      
      // Reset form
      setSelectedMood(null);
      setNote("");
      
      // Refresh mood history
      fetchMoodHistory();
    } catch (error: any) {
      console.error('Error saving mood:', error);
      toast.error('Failed to save mood: ' + (error.message || 'Unknown error'));
    } finally {
      setIsLoading(false);
    }
  };
  
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
                
                <Button type="submit" className="w-full btn-primary-gradient" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Mood Entry'}
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
              {moodHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No mood entries yet.</p>
                  <p className="text-sm mt-1">Track your first mood above!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {moodHistory.map((entry, index) => (
                    <div key={entry.id} className="border-b pb-3 last:border-0">
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
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodsPage;
