
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoodEntry } from '@/types/check-ins';
import { format, isToday, formatDistanceToNow } from 'date-fns';

interface UserMoodCardProps {
  userMoodDisplay: {
    emoji: string;
    label: string;
    color: string;
    bgColor: string;
  };
  moodData: MoodEntry;
  profile: any;
  userName: string;
  isDefaultMood: boolean;
  onViewDetails: () => void;
}

const UserMoodCard: React.FC<UserMoodCardProps> = ({
  userMoodDisplay,
  moodData,
  profile,
  userName,
  isDefaultMood,
  onViewDetails
}) => {
  // Format the mood timestamp
  const formatMoodTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      
      // Use the timestamp if available, otherwise use the date
      const timeString = moodData.timestamp || dateString;
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
    if (!profile?.full_name) return 'ME';
    return profile.full_name
      .split(' ')
      .map((part: string) => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div 
      className={`flex-1 ${userMoodDisplay.bgColor}/40 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100`}
      onClick={() => !isDefaultMood && onViewDetails()}
      tabIndex={0}
      role="button"
      aria-label={`View ${userName}'s mood details`}
    >
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12 ring-2 ring-white shadow-sm">
          <AvatarImage src={profile?.avatar_url} alt={userName} />
          <AvatarFallback className="bg-love-100 text-love-800">
            {getInitials()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-700">{userName}</p>
          <div className="flex items-center gap-2.5 mt-1">
            <span className="text-4xl drop-shadow-sm" aria-label={`Mood: ${userMoodDisplay.label}`}>
              {userMoodDisplay.emoji}
            </span>
            <div>
              <p className={`font-bold ${userMoodDisplay.color}`}>{userMoodDisplay.label}</p>
              {moodData.note && (
                <p className="text-sm text-muted-foreground truncate max-w-[150px] italic">
                  "{moodData.note}"
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {!isDefaultMood && (
        <p className="text-xs text-right text-muted-foreground mt-3 font-medium">
          {formatMoodTime(moodData.date)}
        </p>
      )}
    </div>
  );
};

export default UserMoodCard;
