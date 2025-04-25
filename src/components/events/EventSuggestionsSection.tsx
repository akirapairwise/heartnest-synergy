
import React, { useState } from 'react';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Heart, MapPin, PartyPopper, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  generateEventSuggestions, 
  fetchSavedEventSuggestions,
  EventSuggestion, 
  EventSuggestionParams 
} from '@/services/eventSuggestionService';
import { toast } from 'sonner';
import EventSuggestionCard from './EventSuggestionCard';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { useForm } from 'react-hook-form';

const EventSuggestionsSection = () => {
  const [suggestions, setSuggestions] = useState<EventSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  const form = useForm<EventSuggestionParams>({
    defaultValues: {
      location: '',
      mood: '',
      interests: '',
      dietaryPreferences: '',
      budget: 'medium',
      timing: 'weekend',
      specialDates: ''
    }
  });
  
  const loadSavedSuggestions = async () => {
    try {
      const savedSuggestions = await fetchSavedEventSuggestions();
      if (savedSuggestions.length > 0) {
        setSuggestions(savedSuggestions);
      }
    } catch (error) {
      console.error('Error loading saved suggestions:', error);
    }
  };
  
  React.useEffect(() => {
    if (user) {
      loadSavedSuggestions();
    }
  }, [user]);
  
  const handleGenerateSuggestions = async (values: EventSuggestionParams) => {
    if (!user) {
      toast.error('Please sign in to generate suggestions');
      return;
    }
    
    setIsLoading(true);
    try {
      const eventSuggestions = await generateEventSuggestions(values);
      setSuggestions(eventSuggestions);
      toast.success('Successfully generated event suggestions!');
    } catch (error) {
      console.error('Error generating event suggestions:', error);
      toast.error('Failed to generate event suggestions');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <PartyPopper className="h-5 w-5 text-purple-500" />
              Event Suggestions
            </CardTitle>
            <CardDescription>AI-powered event ideas tailored for you and your partner</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleGenerateSuggestions)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2 text-muted-foreground" />
                        <Input placeholder="City or neighborhood" {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low Budget</SelectItem>
                        <SelectItem value="medium">Medium Budget</SelectItem>
                        <SelectItem value="high">High Budget</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="timing"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Preference</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select timing" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="weekday_evening">Weekday Evening</SelectItem>
                        <SelectItem value="weekday_daytime">Weekday Daytime</SelectItem>
                        <SelectItem value="weekend">Weekend</SelectItem>
                        <SelectItem value="weekend_morning">Weekend Morning</SelectItem>
                        <SelectItem value="weekend_evening">Weekend Evening</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="specialDates"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Special Occasion</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2 text-muted-foreground" />
                        <Input placeholder="Anniversary, birthday, etc." {...field} />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="mood"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Mood & Goals</FormLabel>
                    <FormControl>
                      <div className="flex items-center">
                        <Heart className="w-4 h-4 mr-2 text-muted-foreground" />
                        <Input 
                          placeholder="e.g. deepen communication, have fun together, etc." 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="interests"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Interests</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your shared interests, hobbies, or preferences" 
                        rows={2}
                        {...field} 
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <PartyPopper className="mr-2 h-4 w-4" />
                    Generate Event Suggestions
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
        
        {suggestions.length > 0 && (
          <div className="mt-8 space-y-6">
            <h3 className="text-lg font-medium">Suggested Events</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {suggestions.map((suggestion, index) => (
                <EventSuggestionCard 
                  key={`${suggestion.title}-${index}`}
                  suggestion={suggestion}
                />
              ))}
            </div>
          </div>
        )}
        
        {suggestions.length === 0 && !isLoading && (
          <div className="mt-8 text-center py-12">
            <PartyPopper className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Suggestions Yet</h3>
            <p className="text-muted-foreground mt-2">
              Fill out the form above to get personalized event suggestions for you and your partner.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EventSuggestionsSection;
