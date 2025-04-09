
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, Copy, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnerInvitations } from "@/hooks/usePartnerInvitations";

const ConnectPartner = () => {
  const [copied, setCopied] = useState(false);
  const [method, setMethod] = useState<'invite' | 'connect'>('invite');
  const [inviteCode, setInviteCode] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    activeInvitation,
    isLoading,
    sendInvitation,
    acceptInvitation
  } = usePartnerInvitations();
  
  const handleCopyInvite = () => {
    navigator.clipboard.writeText(activeInvitation?.invitation_code || '');
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your invitation code has been copied.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { error } = await acceptInvitation(inviteCode);
    
    if (!error) {
      toast({
        title: "Connection successful!",
        description: "You're now connected with your partner.",
      });
      navigate('/dashboard');
    }
  };
  
  const handleInviteSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = (e.target as HTMLFormElement).email.value;
    
    const { error } = await sendInvitation(email);
    
    if (!error) {
      toast({
        title: "Invitation sent!",
        description: "Share the code with your partner to complete the connection.",
      });
    }
  };
  
  const handleSkip = () => {
    toast({
      title: "Skipped for now",
      description: "You can connect with your partner anytime from your profile.",
    });
    navigate('/dashboard');
  };
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Heart className="h-12 w-12 text-love-500" />
            <UserPlus className="h-5 w-5 text-harmony-500 absolute bottom-0 right-0 bg-white rounded-full p-0.5" />
          </div>
        </div>
        <CardTitle className="text-2xl gradient-heading">Connect With Your Partner</CardTitle>
        <CardDescription>
          Link your account with your partner to unlock all relationship features
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="flex justify-center">
          <div className="inline-flex rounded-md border p-1">
            <Button
              variant={method === 'invite' ? 'default' : 'ghost'}
              className={method === 'invite' ? 'bg-primary' : ''}
              onClick={() => setMethod('invite')}
            >
              Invite Partner
            </Button>
            <Button
              variant={method === 'connect' ? 'default' : 'ghost'}
              className={method === 'connect' ? 'bg-primary' : ''}
              onClick={() => setMethod('connect')}
            >
              Enter Code
            </Button>
          </div>
        </div>
        
        {method === 'invite' ? (
          <div className="space-y-4 animate-fade-in">
            {activeInvitation ? (
              <div className="p-4 bg-muted rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-2">Share this invitation code with your partner</p>
                <div className="flex items-center justify-center space-x-2">
                  <div className="bg-background px-3 py-2 rounded border text-lg font-medium tracking-wider">
                    {activeInvitation.invitation_code}
                  </div>
                  <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleInviteSend} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Partner's Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email"
                    placeholder="partner@example.com"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full btn-primary-gradient"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Invitation"}
                </Button>
              </form>
            )}
            
            <div className="space-y-2">
              <p className="text-sm text-center text-muted-foreground">Or share via</p>
              <div className="flex justify-center space-x-3">
                <Button variant="outline" size="sm">
                  Email
                </Button>
                <Button variant="outline" size="sm">
                  Message
                </Button>
                <Button variant="outline" size="sm">
                  WhatsApp
                </Button>
              </div>
            </div>
            
            <div className="bg-love-50 p-3 rounded-lg border border-love-100">
              <p className="text-sm text-love-700">
                Once your partner accepts the invitation, you'll be connected and can start using all features together.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleConnect} className="space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Label htmlFor="invite-code">Enter Invitation Code</Label>
              <Input 
                id="invite-code" 
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                placeholder="e.g. ABCD-1234-EFGH" 
                className="text-center uppercase tracking-wider"
              />
              <p className="text-xs text-muted-foreground text-center">
                Enter the code your partner shared with you
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-primary-gradient"
              disabled={isLoading || !inviteCode}
            >
              {isLoading ? "Connecting..." : "Connect With Partner"}
              {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </form>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-center pt-0">
        <Button variant="link" onClick={handleSkip}>
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectPartner;
