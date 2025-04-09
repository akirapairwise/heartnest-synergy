
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, CalendarHeart, Gift } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const PartnerCard = () => {
  return (
    <Card className="heart-card overflow-hidden">
      <div className="bg-gradient-to-r from-love-100 to-harmony-100 h-16"></div>
      <CardContent className="pt-0">
        <div className="flex flex-col items-center -mt-8 mb-4">
          <Avatar className="h-16 w-16 border-4 border-background">
            <AvatarImage src="https://i.pravatar.cc/150?img=39" alt="Partner" />
            <AvatarFallback>JP</AvatarFallback>
          </Avatar>
          <h3 className="font-medium mt-2">Jamie Parker</h3>
          <p className="text-sm text-muted-foreground">Partner</p>
          
          <div className="flex items-center mt-1">
            <div className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
              Connected
            </div>
          </div>
        </div>
        
        <div className="flex justify-between mt-2 gap-2">
          <Button variant="outline" size="sm" className="flex-1">
            <MessageSquare className="h-4 w-4 mr-1" />
            Message
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <CalendarHeart className="h-4 w-4 mr-1" />
            Date
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <Gift className="h-4 w-4 mr-1" />
            Surprise
          </Button>
        </div>
        
        <div className="mt-4 space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Today's mood</p>
            <div className="flex items-center space-x-1 text-yellow-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-4 h-4"
              >
                <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                className="w-4 h-4"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                stroke="currentColor"
                fill="none"
                className="w-4 h-4"
                strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
              </svg>
              <span className="text-xs ml-1">Neutral</span>
            </div>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Anniversary</p>
            <p className="text-sm">June 15th (68 days)</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground mb-1">Birthday</p>
            <p className="text-sm">August 22nd</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PartnerCard;
