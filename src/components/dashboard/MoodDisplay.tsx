
import React, { useEffect, useState } from 'react';
import { Heart, Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types/check-ins';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';

const moodLabels = ["Struggling", "Disconnected", "Neutral", "Connected", "Thriving"];
const moodColors = ["text-red-500", "text-orange-400", "text-yellow-500", "text-green-400", "text-green-600"];

const MoodDisplay = () => {
  const [userMood, setUserMood] = useState<MoodEntry | null>(null);
  const [partnerMood, setPartnerMood] = useState<MoodEntry | null>(null);
  const [partnerProfile, setPartnerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  
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
        // We don't set a toast here anymore since the error will be displayed in the card
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
      // Fetch user's latest mood
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
      
      // Fetch partner's mood if partner exists
      if (profile?.partner_id) {
        const { data: partnerData, error: partnerError } = await supabase
          .from('check_ins')
          .select('id, timestamp, mood, reflection')
          .eq('user_id', profile.partner_id)
          .order('timestamp', { ascending: false })
          .limit(1);
          
        if (partnerError) {
          console.error('Error fetching partner mood:', partnerError);
          // We continue anyway since partner mood is optional
        }
        
        if (partnerData && partnerData.length > 0) {
          setPartnerMood({
            id: partnerData[0].id,
            date: partnerData[0].timestamp,
            mood: parseInt(partnerData[0].mood.charAt(0)),
            note: partnerData[0].reflection
          });
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
  
  // Default display if no data is available
  const defaultUserMood: MoodEntry = userMood || { 
    id: "default-user",
    date: new Date().toISOString(), 
    mood: 3, 
    note: "No recent check-in" 
  };
  
  const defaultPartnerMood: MoodEntry = partnerMood || { 
    id: "default-partner",
    date: new Date().toISOString(), 
    mood: 3, 
    note: "No recent check-in" 
  };

  // Check if partner's mood should be visible (respect partner's preference)
  const isMoodVisible = partnerProfile?.mood_settings?.isVisibleToPartner !== false;
  const showAvatar = profile?.mood_settings?.showAvatar !== false;
  
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
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <h3 className="font-medium text-sm mb-3 flex items-center">
          <Heart className="h-4 w-4 text-love-500 mr-1.5" />
          Today's Mood
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {showAvatar && (
                <Avatar className="h-8 w-8">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback>{profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : 'AU'}</AvatarFallback>
                </Avatar>
              )}
              <div>
                <p className="text-xs text-muted-foreground">You</p>
                <p className={`text-sm font-medium ${moodColors[defaultUserMood.mood-1]}`}>{moodLabels[defaultUserMood.mood-1]}</p>
              </div>
            </div>
            <div className="flex">
              {[1, 2, 3, 4, 5].map((star) => (
                <Heart
                  key={star}
                  className={`h-4 w-4 ${star <= defaultUserMood.mood ? moodColors[defaultUserMood.mood-1] : 'text-gray-200'}`}
                  fill={star <= defaultUserMood.mood ? 'currentColor' : 'none'}
                />
              ))}
            </div>
            <p className="text-xs text-muted-foreground line-clamp-1">{defaultUserMood.note}</p>
          </div>
          
          {profile?.partner_id ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {showAvatar && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={partnerProfile?.avatar_url} />
                    <AvatarFallback>{partnerProfile?.full_name ? partnerProfile.full_name.substring(0, 2).toUpperCase() : 'PA'}</AvatarFallback>
                  </Avatar>
                )}
                <div>
                  <p className="text-xs text-muted-foreground">
                    {partnerProfile?.full_name || 'Partner'}
                  </p>
                  {isMoodVisible ? (
                    <p className={`text-sm font-medium ${moodColors[defaultPartnerMood.mood-1]}`}>
                      {moodLabels[defaultPartnerMood.mood-1]}
                    </p>
                  ) : (
                    <p className="text-xs italic text-muted-foreground">Mood not shared</p>
                  )}
                </div>
              </div>
              {isMoodVisible ? (
                <>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Heart
                        key={star}
                        className={`h-4 w-4 ${star <= defaultPartnerMood.mood ? moodColors[defaultPartnerMood.mood-1] : 'text-gray-200'}`}
                        fill={star <= defaultPartnerMood.mood ? 'currentColor' : 'none'}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1">{defaultPartnerMood.note}</p>
                </>
              ) : (
                <p className="text-xs text-muted-foreground pt-2">
                  Your partner has chosen to keep their mood private.
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2 flex items-center justify-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/connect')}
                className="text-xs"
              >
                Connect Partner
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-3 text-center">
          <a 
            href="/moods"
            className="inline-flex items-center text-xs text-harmony-600 hover:text-harmony-700"
          >
            View mood history
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default MoodDisplay;
