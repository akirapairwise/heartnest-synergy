
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "sonner";
import { Smile, Meh, Frown, Calendar as CalendarIcon, Clock, Send, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";

// Define types for the check-in data
type CheckIn = {
  id: string;
  mood: string;
  reflection: string | null;
  satisfaction_rating: number;
  timestamp: string;
  user_id?: string;
};

type MoodOption = {
  value: string;
  label: string;
  icon: React.ReactNode;
  color: string;
};

const moodOptions: MoodOption[] = [
  { 
    value: "happy", 
    label: "Happy", 
    icon: <Smile className="h-6 w-6" />, 
    color: "text-green-500" 
  },
  { 
    value: "neutral", 
    label: "Neutral", 
    icon: <Meh className="h-6 w-6" />, 
    color: "text-yellow-500" 
  },
  { 
    value: "sad", 
    label: "Sad", 
    icon: <Frown className="h-6 w-6" />, 
    color: "text-red-500" 
  },
];

const CheckInsPage = () => {
  const [mood, setMood] = useState<string>("");
  const [satisfactionRating, setSatisfactionRating] = useState<number>(5);
  const [reflection, setReflection] = useState<string>("");
  const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [open, setOpen] = useState(false);
  
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchCheckIns();
    }
  }, [user]);

  const fetchCheckIns = async () => {
    try {
      // Use a more generic approach to work around TypeScript limitations
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .order('timestamp', { ascending: false }) as { data: CheckIn[] | null, error: any };

      if (error) {
        throw error;
      }

      setCheckIns(data || []);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
      toast.error('Failed to load check-ins');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!mood) {
      toast.error('Please select a mood');
      return;
    }
    
    if (!user) {
      toast.error('You must be logged in to save a check-in');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Use type assertions to work around TypeScript limitations
      const { error } = await supabase
        .from('check_ins')
        .insert([
          {
            mood,
            reflection: reflection || null,
            satisfaction_rating: satisfactionRating,
            user_id: user.id, // Add the user_id from the auth context
          },
        ]) as { error: any };

      if (error) {
        throw error;
      }

      toast.success('Check-in saved successfully');
      
      // Reset form
      setMood("");
      setSatisfactionRating(5);
      setReflection("");
      
      // Refresh the check-ins list
      fetchCheckIns();
    } catch (error) {
      console.error('Error saving check-in:', error);
      toast.error('Failed to save check-in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewCheckIn = (checkIn: CheckIn) => {
    setSelectedCheckIn(checkIn);
    setOpen(true);
  };

  const getMoodIcon = (moodValue: string) => {
    const option = moodOptions.find(option => option.value === moodValue);
    if (option) {
      return (
        <div className={option.color}>
          {option.icon}
        </div>
      );
    }
    return <Meh className="h-6 w-6 text-gray-400" />;
  };

  const getDayWithCheckIns = (day: Date) => {
    return checkIns.find(checkIn => {
      const checkInDate = new Date(checkIn.timestamp);
      return (
        checkInDate.getDate() === day.getDate() &&
        checkInDate.getMonth() === day.getMonth() &&
        checkInDate.getFullYear() === day.getFullYear()
      );
    });
  };

  // Filter check-ins for the selected date
  const checkInsForSelectedDate = selectedDate 
    ? checkIns.filter(checkIn => {
        const checkInDate = new Date(checkIn.timestamp);
        return (
          checkInDate.getDate() === selectedDate.getDate() &&
          checkInDate.getMonth() === selectedDate.getMonth() &&
          checkInDate.getFullYear() === selectedDate.getFullYear()
        );
      })
    : [];

  const CheckInDetails = () => (
    <>
      {selectedCheckIn && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-muted rounded-full">
              {getMoodIcon(selectedCheckIn.mood)}
            </div>
            <div>
              <h3 className="font-medium">
                Feeling {selectedCheckIn.mood}
              </h3>
              <p className="text-sm text-muted-foreground">
                Satisfaction: {selectedCheckIn.satisfaction_rating}/10
              </p>
            </div>
          </div>
          
          <div className="flex items-start gap-2 mt-4">
            <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
            <span className="text-sm">
              {format(new Date(selectedCheckIn.timestamp), "MMMM d, yyyy 'at' h:mm a")}
            </span>
          </div>
          
          {selectedCheckIn.reflection && (
            <div className="flex items-start gap-2 mt-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div className="bg-muted p-3 rounded-lg text-sm">
                {selectedCheckIn.reflection}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Emotional Check-Ins</h1>
        <p className="text-muted-foreground">Track and reflect on your emotional well-being</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>New Check-In</CardTitle>
              <CardDescription>How are you feeling today?</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label className="mb-2 block">Select your mood</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {moodOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          className={`flex flex-col items-center p-4 rounded-lg border transition-all ${
                            mood === option.value 
                              ? `border-primary bg-primary/10 ${option.color}` 
                              : 'border-muted hover:border-muted-foreground/50'
                          }`}
                          onClick={() => setMood(option.value)}
                        >
                          <div className={mood === option.value ? option.color : "text-muted-foreground"}>
                            {option.icon}
                          </div>
                          <span className="mt-2 text-sm font-medium">{option.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Satisfaction (1-10)</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">1</span>
                      <Slider
                        value={[satisfactionRating]}
                        min={1}
                        max={10}
                        step={1}
                        onValueChange={(value) => setSatisfactionRating(value[0])}
                        className="flex-1"
                      />
                      <span className="text-sm text-muted-foreground">10</span>
                      <span className="ml-2 w-8 text-center font-medium">{satisfactionRating}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Add reflection (optional)</Label>
                    <Textarea 
                      placeholder="What's on your mind? How are you feeling?"
                      value={reflection}
                      onChange={(e) => setReflection(e.target.value)}
                      rows={4}
                    />
                  </div>
                </div>
                
                <Button type="submit" className="w-full btn-primary-gradient" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Check-In'}
                  <Send className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Calendar View
                </CardTitle>
                <CardDescription>Select a date to view check-ins</CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  className="rounded-md border"
                  modifiers={{
                    hasCheckIn: (date) => !!getDayWithCheckIns(date),
                  }}
                  modifiersStyles={{
                    hasCheckIn: { 
                      fontWeight: 'bold',
                      backgroundColor: 'hsl(var(--primary) / 0.1)',
                      borderRadius: '50%'
                    }
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedDate ? (
                    <>Check-ins for {format(selectedDate, "MMMM d, yyyy")}</>
                  ) : (
                    <>Select a date</>
                  )}
                </CardTitle>
                <CardDescription>
                  {checkInsForSelectedDate.length === 0 ? (
                    selectedDate ? 'No check-ins for this date' : 'Select a date to see check-ins'
                  ) : (
                    `${checkInsForSelectedDate.length} check-in(s) found`
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {checkInsForSelectedDate.length > 0 ? (
                  <div className="space-y-4">
                    {checkInsForSelectedDate.map((checkIn) => (
                      <div 
                        key={checkIn.id} 
                        className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleViewCheckIn(checkIn)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getMoodIcon(checkIn.mood)}
                            <div>
                              <div className="font-medium capitalize">{checkIn.mood}</div>
                              <div className="text-xs text-muted-foreground">
                                {format(new Date(checkIn.timestamp), "h:mm a")}
                              </div>
                            </div>
                          </div>
                          <div className="text-sm font-medium">
                            {checkIn.satisfaction_rating}/10
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                    <p>No check-ins found for this date</p>
                    {selectedDate && new Date(selectedDate).toDateString() === new Date().toDateString() && (
                      <Button 
                        variant="link" 
                        className="mt-2" 
                        onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                      >
                        Create your first check-in
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Check-Ins</CardTitle>
              <CardDescription>Your latest emotional check-ins</CardDescription>
            </CardHeader>
            <CardContent>
              {checkIns.length > 0 ? (
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {checkIns.slice(0, 10).map((checkIn) => (
                    <div 
                      key={checkIn.id} 
                      className="border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => handleViewCheckIn(checkIn)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getMoodIcon(checkIn.mood)}
                          <div>
                            <div className="font-medium capitalize">{checkIn.mood}</div>
                            <div className="text-xs text-muted-foreground">
                              {format(new Date(checkIn.timestamp), "MMMM d, yyyy • h:mm a")}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm font-medium">
                          {checkIn.satisfaction_rating}/10
                        </div>
                      </div>
                      {checkIn.reflection && (
                        <div className="mt-2 pl-8 pr-2 text-sm text-muted-foreground line-clamp-2">
                          {checkIn.reflection}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                  <p>No check-ins yet</p>
                  <Button 
                    variant="link" 
                    className="mt-2" 
                    onClick={() => document.querySelector('form')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Create your first check-in
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {isDesktop ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Check-In Details</DialogTitle>
              <DialogDescription>
                Detailed view of your emotional check-in
              </DialogDescription>
            </DialogHeader>
            <CheckInDetails />
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Close</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Drawer open={open} onOpenChange={setOpen}>
          <DrawerContent>
            <DrawerHeader className="text-left">
              <DrawerTitle>Check-In Details</DrawerTitle>
              <DrawerDescription>
                Detailed view of your emotional check-in
              </DrawerDescription>
            </DrawerHeader>
            <div className="px-4">
              <CheckInDetails />
            </div>
            <DrawerFooter className="pt-2">
              <DrawerClose asChild>
                <Button variant="outline">Close</Button>
              </DrawerClose>
            </DrawerFooter>
          </DrawerContent>
        </Drawer>
      )}
    </div>
  );
};

export default CheckInsPage;
