import React, { useState } from 'react';
import { Heart, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from '@/contexts/AuthContext';
import { MoodEntry } from '@/types/check-ins';
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import MoodTracker from '../moods/MoodTracker';
import { useDailyMood } from '@/hooks/useDailyMood';

// Import refactored components and hooks
import { useMoodData } from './mood/useMoodData';
import { getMoodDisplay, getUserName, getPartnerName } from './mood/MoodUtils';
import LoadingState from './mood/LoadingState';
import ErrorState from './mood/ErrorState';
import UserMoodCard from './mood/UserMoodCard';
import PartnerMoodCard from './mood/PartnerMoodCard';
import MoodDetailModal from './mood/MoodDetailModal';

const MoodDisplay = () => {
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
  
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { dailyMood, fetchDailyMood } = useDailyMood();
  const { userMood, partnerMood, partnerProfile, isLoading, error, fetchLatestMoods } = useMoodData();
  
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
  
  // Get emoji and label based on mood value
  const userMoodDisplay = getMoodDisplay(defaultUserMood.mood);
  const partnerMoodDisplay = partnerMood ? getMoodDisplay(partnerMood.mood) : null;
  
  // Get user's and partner's names
  const userDisplayName = getUserName(profile);
  const partnerDisplayName = getPartnerName(partnerProfile);

  if (isLoading) {
    return <LoadingState />;
  }
  
  if (error) {
    return <ErrorState error={error} onRetry={fetchLatestMoods} />;
  }
  
  return (
    <>
      <Card className="elevated-card soft-gradient-background overflow-hidden">
        <CardContent className="p-6">
          <h3 className="font-medium text-base mb-5 flex items-center text-harmony-700">
            <Heart className="h-5 w-5 text-love-500 mr-2 animate-pulse-soft" />
            Today's Mood
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-5">
            {/* User's mood card */}
            <UserMoodCard 
              userMoodDisplay={userMoodDisplay} 
              moodData={defaultUserMood}
              profile={profile}
              userName={userDisplayName}
              isDefaultMood={defaultUserMood.id === "default-user"}
              onViewDetails={() => openMoodDetails(false, userMoodDisplay, userDisplayName)}
            />
            
            {/* Partner's mood card or invite prompt */}
            <PartnerMoodCard 
              hasPartner={Boolean(profile?.partner_id)}
              partnerProfile={partnerProfile}
              partnerName={partnerDisplayName}
              partnerMood={partnerMood}
              isMoodVisible={isMoodVisible}
              partnerMoodDisplay={partnerMoodDisplay}
              onViewDetails={() => openMoodDetails(true, partnerMoodDisplay, partnerDisplayName)}
            />
          </div>
          
          <div className="mt-6 text-center">
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setIsMoodDialogOpen(true)}
              className="w-full bg-gradient-to-r from-love-50 to-harmony-50 hover:from-love-100 hover:to-harmony-100 border-gray-200 text-harmony-700"
            >
              <Heart className="h-4 w-4 mr-2 text-love-500" />
              {defaultUserMood.id !== "default-user" ? "Update Your Mood" : "Log Your Mood"}
            </Button>
            
            <a 
              href="/moods"
              className="inline-flex items-center text-xs text-harmony-600 hover:text-harmony-700 mt-3 hover:underline"
            >
              View mood history
            </a>
          </div>
        </CardContent>
      </Card>
      
      {/* Mood update dialog */}
      <Dialog open={isMoodDialogOpen} onOpenChange={setIsMoodDialogOpen}>
        <DialogContent className="sm:max-w-[500px] rounded-xl bg-gradient-to-b from-white to-gray-50">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">How are you feeling today?</DialogTitle>
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
            ? (partnerMood?.timestamp || partnerMood?.date || new Date().toISOString()) 
            : (defaultUserMood.timestamp || defaultUserMood.date || new Date().toISOString())}
        />
      )}
    </>
  );
};

export default MoodDisplay;
