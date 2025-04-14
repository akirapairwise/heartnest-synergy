
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { EyeOff, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isToday, formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';

interface PartnerMoodCardProps {
  hasPartner: boolean;
  partnerProfile: any;
  partnerName: string;
  partnerMood: any;
  isMoodVisible: boolean;
  partnerMoodDisplay: any;
  onViewDetails: () => void;
}

const PartnerMoodCard: React.FC<PartnerMoodCardProps> = ({
  hasPartner,
  partnerProfile,
  partnerName,
  partnerMood,
  isMoodVisible,
  partnerMoodDisplay,
  onViewDetails
}) => {
  const navigate = useNavigate();

  // Format the mood timestamp
  const formatMoodTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Use the timestamp if available, otherwise use the date
      const timeString = partnerMood.timestamp || dateString;
      const timeDate = new Date(timeString);
      
      if (isToday(timeDate)) {
        // If it's today, show "today at X:XX PM"
        return `Today at ${format(timeDate, 'h:mm a')}`;
      } else {
        // If it's not today, show relative time like "2 days ago"
        return formatDistanceToNow(timeDate, { addSuffix: true });
      }
    } catch (e) {
      return '';
    }
  };

  // Generate initials for avatar fallback
  const getInitials = () => {
    if (!partnerProfile?.full_name) return 'PA';
    return partnerProfile.full_name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  if (!hasPartner) {
    return (
      <div className="flex-1 bg-gradient-to-br from-gray-50 to-white p-5 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-col items-center justify-center h-full min-h-[100px] text-center">
          <UserPlus className="h-8 w-8 text-harmony-400 mb-3" />
          <p className="text-sm text-muted-foreground mb-3">Connect with your partner to see their mood</p>
          <Button
            size="sm"
            onClick={() => navigate('/connect')}
            variant="outline"
            className="bg-white hover:bg-harmony-50 border-harmony-200 text-harmony-700 hover:text-harmony-800"
          >
            Invite Partner
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex-1 ${
        partnerMood && isMoodVisible 
          ? `${partnerMoodDisplay?.bgColor}/40 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer` 
          : 'bg-gray-50'
      } p-5 rounded-xl shadow-sm border border-gray-100`}
      onClick={() => partnerMood && isMoodVisible && onViewDetails()}
      tabIndex={partnerMood && isMoodVisible ? 0 : -1}
      role={partnerMood && isMoodVisible ? "button" : "presentation"}
      aria-label={partnerMood && isMoodVisible ? `View ${partnerName}'s mood details` : undefined}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
          <AvatarImage src={partnerProfile?.avatar_url} alt={partnerName} />
          <AvatarFallback className="bg-harmony-100 text-harmony-800">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-width-0">
          <p className="text-sm font-medium text-gray-700">{partnerName}</p>
          
          {partnerMood ? (
            isMoodVisible ? (
              <div className="flex items-center gap-2.5 mt-1">
                <span className="text-4xl drop-shadow-sm" aria-label={`Mood: ${partnerMoodDisplay?.label}`}>
                  {partnerMoodDisplay?.emoji}
                </span>
                <div>
                  <p className={`font-bold ${partnerMoodDisplay?.color}`}>{partnerMoodDisplay?.label}</p>
                  {partnerMood.note && (
                    <p className="text-sm text-muted-foreground truncate max-w-[150px] italic">
                      "{partnerMood.note}"
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-muted-foreground gap-2 mt-2 bg-white/80 p-2 rounded-lg">
                <EyeOff className="h-4 w-4" />
                <span className="text-sm">Private mood</span>
              </div>
            )
          ) : (
            <div className="text-sm text-muted-foreground mt-2 bg-white/80 p-2 rounded-lg">
              No mood shared yet
            </div>
          )}
        </div>
      </div>
      
      {partnerMood && isMoodVisible && (
        <p className="text-xs text-right text-muted-foreground mt-3 font-medium">
          {formatMoodTime(partnerMood.date)}
        </p>
      )}
    </div>
  );
};

export default PartnerMoodCard;
