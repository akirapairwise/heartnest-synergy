
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Smile, SmilePlus, Frown, Meh } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const MoodSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [defaultMood, setDefaultMood] = useState('neutral');
  const { user } = useAuth();
  
  // Load saved settings on component mount
  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);
  
  const loadSettings = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      // Fetch user settings from a user_settings table or profile
      const { data, error } = await supabase
        .from('user_profiles')
        .select('mood_settings')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data && data.mood_settings) {
        // If there are saved settings, apply them
        const settings = data.mood_settings;
        setShowAvatar(settings.showAvatar ?? true);
        setDefaultMood(settings.defaultMood ?? 'neutral');
      }
    } catch (error) {
      console.error('Error loading mood settings:', error);
      // Don't show error toast here as it's not critical
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSaveSettings = async () => {
    if (!user) {
      toast.error('You must be logged in to save settings');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Save settings to user profile
      const { error } = await supabase
        .from('user_profiles')
        .update({
          mood_settings: {
            showAvatar,
            defaultMood,
          }
        })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Mood & avatar settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between p-4 rounded-lg border">
        <div className="flex items-center gap-4">
          <Avatar className={showAvatar ? 'opacity-100' : 'opacity-50'}>
            <AvatarFallback className="bg-primary text-primary-foreground">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="font-medium">Show Avatar</h3>
            <p className="text-sm text-muted-foreground">Display your avatar in the app</p>
          </div>
        </div>
        <Switch
          checked={showAvatar}
          onCheckedChange={setShowAvatar}
        />
      </div>
      
      <div className="space-y-4 p-4 rounded-lg border">
        <h3 className="font-medium">Default Mood</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Choose your default mood for new check-ins
        </p>
        
        <RadioGroup
          value={defaultMood}
          onValueChange={setDefaultMood}
          className="grid gap-4 md:grid-cols-2"
        >
          <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="happy" id="happy" />
            <Label htmlFor="happy" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Smile className="h-5 w-5 text-green-500" />
                <span>Happy</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="excited" id="excited" />
            <Label htmlFor="excited" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <SmilePlus className="h-5 w-5 text-purple-500" />
                <span>Excited</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="neutral" id="neutral" />
            <Label htmlFor="neutral" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Meh className="h-5 w-5 text-yellow-500" />
                <span>Neutral</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="sad" id="sad" />
            <Label htmlFor="sad" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Frown className="h-5 w-5 text-blue-500" />
                <span>Sad</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      <Button 
        onClick={handleSaveSettings} 
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Saving Settings...
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  );
};

export default MoodSettings;
