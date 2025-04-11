
// Define mood emojis and their mapping
export const moodEmojis = {
  1: { emoji: "😢", label: "Struggling", color: "text-red-500", bgColor: "bg-red-50" },
  2: { emoji: "😐", label: "Disconnected", color: "text-orange-400", bgColor: "bg-orange-50" },
  3: { emoji: "🙂", label: "Neutral", color: "text-yellow-500", bgColor: "bg-yellow-50" },
  4: { emoji: "😊", label: "Connected", color: "text-green-400", bgColor: "bg-green-50" },
  5: { emoji: "🥰", label: "Thriving", color: "text-green-600", bgColor: "bg-green-50" },
};

// Get emoji and label based on mood value
export const getMoodDisplay = (moodValue: number) => {
  return moodEmojis[moodValue as keyof typeof moodEmojis] || { 
    emoji: "❓", 
    label: "Unknown", 
    color: "text-gray-500", 
    bgColor: "bg-gray-50" 
  };
};

// Helper to get user's name or default
export const getUserName = (profile: any) => {
  if (profile?.nickname) return profile.nickname;
  if (profile?.full_name) return profile.full_name.split(' ')[0];
  return 'You';
};

// Helper to get partner's name or default
export const getPartnerName = (partnerProfile: any) => {
  if (partnerProfile?.nickname) return partnerProfile.nickname;
  if (partnerProfile?.full_name) return partnerProfile.full_name.split(' ')[0];
  return 'Partner';
};
