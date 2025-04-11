
import React, { useEffect, useState } from 'react';
import { Heart, Loader2, AlertCircle, RefreshCw, EyeOff, Plus, UserPlus, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types/check-ins';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import MoodTracker from '../moods/MoodTracker';
import { useDailyMood } from '@/hooks/useDailyMood';
import { format } from 'date-fns';

// Define mood emojis and their mapping
const moodEmojis = {
  1: { emoji: "😢", label: "Struggling", color: "text-red-500" },
  2: { emoji: "😐", label: "Disconnected", color: "text-orange-400" },
  3: { emoji: "🙂", label: "Neutral", color: "text-yellow-500" },
  4: { emoji: "😊", label: "Connected", color: "text-green-400" },
  5: { emoji: "🥰", label: "Thriving", color: "text-green-600" },
};

interface PartnerMood {
  id: string;
  date: string;
  mood: number;
  note: string | null;
  is_visible_to_partner: boolean;
}

interface MoodModalProps {
  open: boolean;
  onClose: () => void;
  name: string;
  mood: {
    emoji: string;
    label: string;
    color: string;
  };
  note: string | null;
  timestamp: string;
}

const MoodDetailModal: React.FC<MoodModalProps> = ({ open, onClose, name, mood, note, timestamp }) => {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{name}'s Mood for Today</DialogTitle>
          <DialogClose className="absolute right-4 top-4">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </DialogClose>
        </DialogHeader>
        <div className="flex flex-col items-center p-4">
          <div className="text-6xl mb-2" aria-label={`Mood: ${mood.label}`}>
            {mood.emoji}
          </div>
          <h3 className={`text-xl font-bold ${mood.color}`}>{mood.label}</h3>
          
          {note && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground mb-1">Note:</p>
              <p className="text-base">"{note}"</p>
            </div>
          )}
          
          <p className="text-xs text-muted-foreground mt-4">
            Logged at {format(new Date(timestamp), 'h:mm a')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MoodDisplay = () => {
  const [userMood, setUserMood] = useState<MoodEntry | null>(null);
  const [partnerMood, setPartnerMood] = useState<PartnerMood | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMoodDialogOpen, setIsMoodDialogOpen] = useState(false);
  const [viewingMoodDetails, setViewingMoodDetails] = useState<{
    isOpen: boolean;
    isPartner: boolean;
    mood: any;
    name: string;
  }>({
    isOpen: false,
    isPartner: false,
    mood: null,
    name: '',
  });
  
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const { dailyMood, fetchDailyMood } = useDailyMood();
  
  useEffect(() => {
    if (user) {
      fetchLatestMoods();
      if (profile?.partner_id) {
        fetchPartnerProfile();
      }
    } else {
      setIsLoading(false);
    }
  }, [user, profile?.partner_id]);
  
  const fetchPartnerProfile = async () => {
    if (!profile?.partner_id) return;
    
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', profile.partner_id)
        .single();
        
      if (error) {
        console.error('Error fetching partner profile:', error);
        return;
      }
      
      if (data) {
        setPartnerProfile(data);
      }
    } catch (error) {
      console.error('Error fetching partner profile:', error);
    }
  };
  
  const fetchLatestMoods = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch today's date in YYYY-MM-DD format
      const today = new Date().toISOString().split('T')[0];
      
      // Fetch user's latest mood from daily_moods
      const { data: userDailyMood, error: userDailyMoodError } = await supabase
        .from('daily_moods')
        .select('id, mood_date, mood_value, note')
        .eq('user_id', user?.id)
        .eq('mood_date', today)
        .maybeSingle();
      
      if (userDailyMoodError) {
        console.error('Error fetching user daily mood:', userDailyMoodError);
      }
      
      // If found in daily_moods, use that
      if (userDailyMood) {
        setUserMood({
          id: userDailyMood.id,
          date: userDailyMood.mood_date,
          mood: userDailyMood.mood_value,
          note: userDailyMood.note
        });
      } else {
        // Fallback to check_ins
        const { data: userData, error: userError } = await supabase
          .from('check_ins')
          .select('id, timestamp, mood, reflection')
          .eq('user_id', user?.id)
          .order('timestamp', { ascending: false })
          .limit(1);
          
        if (userError) {
          console.error('Error fetching user mood:', userError);
          setError('Failed to load your mood data');
          return;
        }
        
        if (userData && userData.length > 0) {
          setUserMood({
            id: userData[0].id,
            date: userData[0].timestamp,
            mood: parseInt(userData[0].mood.charAt(0)),
            note: userData[0].reflection
          });
        }
      }
      
      // Fetch partner's mood if partner exists
      if (profile?.partner_id) {
        // First try daily_moods with visibility check
        const { data: partnerDailyMood, error: partnerDailyMoodError } = await supabase
          .from('daily_moods')
          .select('id, mood_date, mood_value, note, is_visible_to_partner')
          .eq('user_id', profile.partner_id)
          .eq('mood_date', today)
          .maybeSingle();
          
        if (partnerDailyMoodError) {
          console.error('Error fetching partner daily mood:', partnerDailyMoodError);
        }
        
        if (partnerDailyMood) {
          setPartnerMood({
            id: partnerDailyMood.id,
            date: partnerDailyMood.mood_date,
            mood: partnerDailyMood.mood_value,
            note: partnerDailyMood.note,
            is_visible_to_partner: partnerDailyMood.is_visible_to_partner !== false
          });
        } else {
          // Fallback to check_ins (assuming all check_ins are visible)
          const { data: partnerData, error: partnerError } = await supabase
            .from('check_ins')
            .select('id, timestamp, mood, reflection')
            .eq('user_id', profile.partner_id)
            .order('timestamp', { ascending: false })
            .limit(1);
            
          if (partnerError) {
            console.error('Error fetching partner mood:', partnerError);
          }
          
          if (partnerData && partnerData.length > 0) {
            setPartnerMood({
              id: partnerData[0].id,
              date: partnerData[0].timestamp,
              mood: parseInt(partnerData[0].mood.charAt(0)),
              note: partnerData[0].reflection,
              is_visible_to_partner: true // Legacy entries assumed to be visible
            });
          }
        }
      } else {
        // Reset partner mood if no partner
        setPartnerMood(null);
      }
    } catch (error: any) {
      console.error('Error fetching mood data:', error);
      setError('Failed to load mood data');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMoodSaved = () => {
    setIsMoodDialogOpen(false);
    fetchLatestMoods();
    fetchDailyMood();
  };
  
  const openMoodDetails = (isPartner: boolean, moodData: any, name: string) => {
    setViewingMoodDetails({
      isOpen: true,
      isPartner,
      mood: moodData,
      name
    });
  };
  
  // Default display if no data is available
  const defaultUserMood: MoodEntry = userMood || { 
    id: "default-user",
    date: new Date().toISOString(), 
    mood: 3, 
    note: null
  };

  // Check if partner's mood should be visible
  const isMoodVisible = partnerMood?.is_visible_to_partner !== false;
  const showAvatar = profile?.mood_settings?.showAvatar !== false;
  
  // Get emoji and label based on mood value
  const getMoodDisplay = (moodValue: number) => {
    return moodEmojis[moodValue as keyof typeof moodEmojis] || { emoji: "❓", label: "Unknown", color: "text-gray-500" };
  };
  
  const userMoodDisplay = getMoodDisplay(defaultUserMood.mood);
  const partnerMoodDisplay = partnerMood ? getMoodDisplay(partnerMood.mood) : null;
  
  // Format the mood timestamp
  const formatMoodTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'h:mm a');
    } catch (e) {
      return '';
    }
  };
  
  // Get user's name or default
  const getUserName = () => {
    if (profile?.nickname) return profile.nickname;
    if (profile?.full_name) return profile.full_name.split(' ')[0];
    return 'You';
  };
  
  const getPartnerName = () => {
    if (partnerProfile?.nickname) return partnerProfile.nickname;
    if (partnerProfile?.full_name) return partnerProfile.full_name.split(' ')[0];
    return 'Partner';
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 flex justify-center items-center min-h-[200px]">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4 text-center">
          <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
          <p className="text-sm text-red-500 mb-2">{error}</p>
          <button 
            onClick={() => fetchLatestMoods()} 
            className="inline-flex items-center text-sm text-harmony-600 hover:text-harmony-700 gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Try again
          </button>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <>
      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-4">
          <h3 className="font-medium text-sm mb-4 flex items-center">
            <Heart className="h-4 w-4 text-love-500 mr-1.5" />
            Today's Mood
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4">
            {/* User's mood card */}
            <div 
              className="flex-1 bg-love-50/30 p-4 rounded-xl shadow-sm hover:shadow transition-shadow cursor-pointer"
              onClick={() => defaultUserMood.id !== "default-user" && openMoodDetails(
                false, 
                userMoodDisplay, 
                getUserName()
              )}
              tabIndex={0}
              role="button"
              aria-label={`View ${getUserName()}'s mood details`}
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url} alt={getUserName()} />
                  <AvatarFallback>{profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'ME'}</AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">{getUserName()}</p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-3xl" aria-label={`Mood: ${userMoodDisplay.label}`}>
                      {userMoodDisplay.emoji}
                    </span>
                    <div>
                      <p className={`font-bold ${userMoodDisplay.color}`}>{userMoodDisplay.label}</p>
                      {defaultUserMood.note && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          {defaultUserMood.note}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              {defaultUserMood.id !== "default-user" && (
                <p className="text-xs text-right text-muted-foreground mt-2">
                  {formatMoodTime(defaultUserMood.date)}
                </p>
              )}
            </div>
            
            {/* Partner's mood card or invite prompt */}
            {profile?.partner_id ? (
              <div 
                className={`flex-1 ${partnerMood && isMoodVisible ? 'bg-harmony-50/30' : 'bg-gray-50'} p-4 rounded-xl shadow-sm ${partnerMood && isMoodVisible ? 'hover:shadow transition-shadow cursor-pointer' : ''}`}
                onClick={() => partnerMood && isMoodVisible && openMoodDetails(
                  true,
                  partnerMoodDisplay,
                  getPartnerName()
                )}
                tabIndex={partnerMood && isMoodVisible ? 0 : -1}
                role={partnerMood && isMoodVisible ? "button" : "presentation"}
                aria-label={partnerMood && isMoodVisible ? `View ${getPartnerName()}'s mood details` : undefined}
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={partnerProfile?.avatar_url} alt={getPartnerName()} />
                    <AvatarFallback>{partnerProfile?.full_name ? partnerProfile.full_name.substring(0, 2).toUpperCase() : 'PA'}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-width-0">
                    <p className="text-xs text-muted-foreground">{getPartnerName()}</p>
                    
                    {partnerMood ? (
                      isMoodVisible ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-3xl" aria-label={`Mood: ${partnerMoodDisplay?.label}`}>
                            {partnerMoodDisplay?.emoji}
                          </span>
                          <div>
                            <p className={`font-bold ${partnerMoodDisplay?.color}`}>{partnerMoodDisplay?.label}</p>
                            {partnerMood.note && (
                              <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                                {partnerMood.note}
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center text-muted-foreground gap-1.5 mt-2">
                          <EyeOff className="h-4 w-4" />
                          <span className="text-sm">Private mood</span>
                        </div>
                      )
                    ) : (
                      <div className="text-sm text-muted-foreground mt-2">
                        No mood shared yet
                      </div>
                    )}
                  </div>
                </div>
                
                {partnerMood && isMoodVisible && (
                  <p className="text-xs text-right text-muted-foreground mt-2">
                    {formatMoodTime(partnerMood.date)}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-gray-50 p-4 rounded-xl">
                <div className="flex flex-col items-center justify-center h-full min-h-[80px] text-center">
                  <UserPlus className="h-6 w-6 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground mb-2">Connect with your partner to see their mood</p>
                  <Button
                    size="sm"
                    onClick={() => navigate('/connect')}
                    variant="outline"
                  >
                    Invite Partner
                  </Button>
                </div>
              </div>
            )}
          </div>
          
          <div className="mt-4 text-center">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsMoodDialogOpen(true)}
              className="w-full"
            >
              {defaultUserMood.id !== "default-user" ? "Update Your Mood" : "Log Your Mood"}
            </Button>
            
            <a 
              href="/moods"
              className="inline-flex items-center text-xs text-harmony-600 hover:text-harmony-700 mt-2"
            >
              View mood history
            </a>
          </div>
        </CardContent>
      </Card>
      
      {/* Mood update dialog */}
      <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>How are you feeling today?</DialogTitle>
          </DialogHeader>
          <MoodTracker 
            onMoodSaved={handleMoodSaved} 
            dailyMood={dailyMood}
          />
        </DialogContent>
      </Dialog>
      
      {/* Mood details dialog */}
      {viewingMoodDetails.isOpen && viewingMoodDetails.mood && (
        <MoodDetailModal
          open={viewingMoodDetails.isOpen}
          onClose={() => setViewingMoodDetails(prev => ({ ...prev, isOpen: false }))}
          name={viewingMoodDetails.name}
          mood={viewingMoodDetails.mood}
          note={viewingMoodDetails.isPartner 
            ? (partnerMood?.note || null) 
            : (defaultUserMood.note || null)}
          timestamp={viewingMoodDetails.isPartner 
            ? (partnerMood?.date || new Date().toISOString()) 
            : (defaultUserMood.date || new Date().toISOString())}
        />
      )}
    </>
  );
};

export default MoodDisplay;
