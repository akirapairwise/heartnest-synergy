
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { Loader2, Smile, SmilePlus, Frown, Meh, Eye, EyeOff } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';

const MoodSettings = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatar, setShowAvatar] = useState(true);
  const [defaultMood, setDefaultMood] = useState('neutral');
  const [isVisibleToPartner, setIsVisibleToPartner] = useState(true);
  const { user, profile, updateProfile } = useAuth();
  
  // Load saved settings on component mount
  useEffect(() => {
    if (profile) {
      loadSettings();
    }
  }, [profile]);
  
  const loadSettings = async () => {
    try {
      setIsLoading(true);
      
      if (profile && profile.mood_settings) {
        // If there are saved settings, apply them
        const settings = profile.mood_settings;
        setShowAvatar(settings.showAvatar ?? true);
        setDefaultMood(settings.defaultMood ?? 'neutral');
        setIsVisibleToPartner(settings.isVisibleToPartner !== false); // Default to true if not set
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
      // Save settings to user profile in the correct format
      const { error } = await updateProfile({
        mood_settings: {
          showAvatar,
          defaultMood,
          isVisibleToPartner
        }
      });
      
      if (error) throw error;
      
      toast.success('Mood & avatar settings saved');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsLoading(false);
    }
  };
  
  const hasPartner = !!profile?.partner_id;
  
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border">
        <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-0">
          <Avatar className={`${showAvatar ? 'opacity-100' : 'opacity-50'} h-10 w-10 sm:h-12 sm:w-12`}>
            <AvatarFallback className="bg-primary text-primary-foreground text-sm sm:text-base">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-0.5 sm:space-y-1">
            <h3 className="font-medium text-sm sm:text-base">Show Avatar</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Display your avatar in the app</p>
          </div>
        </div>
        <Switch
          checked={showAvatar}
          onCheckedChange={setShowAvatar}
          className="mt-2 sm:mt-0"
        />
      </div>
      
      <div className="space-y-3 sm:space-y-4 p-3 sm:p-4 rounded-lg border">
        <div>
          <h3 className="font-medium text-sm sm:text-base">Default Mood</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 mb-3 sm:mb-4">
            Choose your default mood for new check-ins
          </p>
        </div>
        
        <RadioGroup
          value={defaultMood}
          onValueChange={setDefaultMood}
          className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2"
        >
          <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="happy" id="happy" />
            <Label htmlFor="happy" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Smile className="h-4 w-4 sm:h-5 sm:w-5 text-green-500" />
                <span className="text-sm sm:text-base">Happy</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="excited" id="excited" />
            <Label htmlFor="excited" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <SmilePlus className="h-4 w-4 sm:h-5 sm:w-5 text-purple-500" />
                <span className="text-sm sm:text-base">Excited</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="neutral" id="neutral" />
            <Label htmlFor="neutral" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Meh className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-500" />
                <span className="text-sm sm:text-base">Neutral</span>
              </div>
            </Label>
          </div>
          
          <div className="flex items-center space-x-2 rounded-lg border p-2.5 sm:p-3 cursor-pointer hover:bg-accent">
            <RadioGroupItem value="sad" id="sad" />
            <Label htmlFor="sad" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2">
                <Frown className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" />
                <span className="text-sm sm:text-base">Sad</span>
              </div>
            </Label>
          </div>
        </RadioGroup>
      </div>
      
      {hasPartner && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 rounded-lg border">
          <div className="space-y-0.5 sm:space-y-1 mb-3 sm:mb-0">
            <h3 className="font-medium text-sm sm:text-base">Default Mood Visibility</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              {isVisibleToPartner 
                ? "Your mood entries are visible to your partner by default" 
                : "Your mood entries are private by default"}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-2 sm:mt-0">
            <span className="text-muted-foreground">
              {isVisibleToPartner ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </span>
            <Switch
              checked={isVisibleToPartner}
              onCheckedChange={setIsVisibleToPartner}
            />
          </div>
        </div>
      )}
      
      <Button 
        onClick={handleSaveSettings} 
        className="w-full mt-2 sm:mt-4"
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
