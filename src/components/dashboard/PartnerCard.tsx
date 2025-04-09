
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarHeart, Gift } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PartnerCard = () => {
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
          <Button variant="outline" size="sm" className="h-8 text-xs px-2">
            <MessageSquare className="h-3.5 w-3.5 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2">
            <CalendarHeart className="h-3.5 w-3.5 mr-1" />
            Date
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs px-2">
            <Gift className="h-3.5 w-3.5 mr-1" />
            Gift
          </Button>
        </div>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Anniversary</span>
            <span className="text-xs">June 15th (68 days)</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground text-xs">Birthday</span>
            <span className="text-xs">August 22nd</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
