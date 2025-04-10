
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PartnerInvite } from '@/services/partners';
import { Copy, Check, Clock, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { getInviteExpirationText } from '@/hooks/partner/useInviteUtils';

interface ActiveInviteProps {
  inviteUrl: string | null;
  activeInvite: PartnerInvite | null;
  onRegenerateToken: () => Promise<void>;
  isLoading: boolean;
}

const ActiveInvite = ({ 
  inviteUrl, 
  activeInvite, 
  onRegenerateToken,
  isLoading 
}: ActiveInviteProps) => {
  const [copied, setCopied] = useState(false);
  
  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invitation link copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const expirationText = getInviteExpirationText(activeInvite);
  
  return (
    <div className="p-4 rounded-lg border">
      <div className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Partner Invitation</p>
          <p className="font-medium">Share this link with your partner</p>
          <p className="text-sm text-muted-foreground mt-1">
            They'll be able to connect with you after clicking the link
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="bg-muted p-2 rounded font-mono text-xs overflow-hidden text-ellipsis whitespace-nowrap flex-1">
            {inviteUrl}
          </div>
          <Button size="sm" variant="outline" onClick={handleCopyInvite}>
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          </Button>
        </div>
        
        {expirationText && (
          <div className="flex items-center text-sm text-muted-foreground">
            <Clock className="h-4 w-4 mr-1" />
            <span>Expires in {expirationText}</span>
          </div>
        )}
        
        <Button 
          size="sm" 
          variant="outline" 
          onClick={onRegenerateToken} 
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Regenerate Link
        </Button>
      </div>
    </div>
  );
};

export default ActiveInvite;
