
import React from 'react';
import { Button } from '@/components/ui/button';
import { UserX } from 'lucide-react';

interface ConnectedPartnerProps {
  partnerProfile: any;
  onUnlink: () => void;
}

const ConnectedPartner = ({ partnerProfile, onUnlink }: ConnectedPartnerProps) => {
  return (
    <div className="p-4 rounded-lg border">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">Connected Partner</p>
          <p className="font-medium">{partnerProfile?.full_name || 'Partner'}</p>
          {partnerProfile?.location && (
            <p className="text-sm text-muted-foreground">{partnerProfile.location}</p>
          )}
        </div>
        <Button 
          variant="destructive" 
          onClick={onUnlink}
          className="gap-2"
        >
          <UserX className="h-4 w-4" />
          Break Partner Connection
        </Button>
      </div>
    </div>
  );
};

export default ConnectedPartner;
