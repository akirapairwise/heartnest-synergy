
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarHeart, Gift } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const PartnerCard = () => {
  const navigate = useNavigate();
  
  const handleMessagePartner = () => {
    // In a real app, this would navigate to a messaging screen
    toast.info("Coming soon", {
      description: "Messaging feature will be available in the next update"
    });
  };
  
  const handlePlanDate = () => {
    // In a real app, this would navigate to a date planning screen
    navigate('/goals');
  };
  
  const handleGiftIdeas = () => {
    // In a real app, this would navigate to a gift ideas screen
    navigate('/recommendations');
  };
  
  // Calculate upcoming anniversary
  const anniversaryDate = new Date("2024-06-15");
  const today = new Date();
  const nextAnniversary = new Date(today.getFullYear(), anniversaryDate.getMonth(), anniversaryDate.getDate());
  
  if (nextAnniversary < today) {
    nextAnniversary.setFullYear(today.getFullYear() + 1);
  }
  
  const daysUntilAnniversary = Math.ceil((nextAnniversary.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate upcoming birthday
  const birthdayDate = new Date("2024-08-22");
  const nextBirthday = new Date(today.getFullYear(), birthdayDate.getMonth(), birthdayDate.getDate());
  
  if (nextBirthday < today) {
    nextBirthday.setFullYear(today.getFullYear() + 1);
  }
  
  const formattedAnniversary = anniversaryDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const formattedBirthday = birthdayDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  
  return (
    <Card className="shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="https://i.pravatar.cc/150?img=39" alt="Partner" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">Jamie Parker</h3>
            <div className="flex items-center">
              <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                Connected
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleMessagePartner}>
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handlePlanDate}>
            <CalendarHeart className="h-3.5 w-3.5 mr-1" />
            Date
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2" onClick={handleGiftIdeas}>
            <Gift className="h-3.5 w-3.5 mr-1" />
            Gift
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Anniversary</span>
            <span className="text-xs">{formattedAnniversary} ({daysUntilAnniversary} days)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Birthday</span>
            <span className="text-xs">{formattedBirthday}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
