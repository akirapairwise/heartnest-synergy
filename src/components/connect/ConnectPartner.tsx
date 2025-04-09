
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, Copy, Check, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnerInvite } from "@/hooks/usePartnerInvite";

const ConnectPartner = () => {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const {
    isLoading,
    inviteUrl,
    createInvitation,
    acceptInvitation,
    activeInvite
  } = usePartnerInvite();
  
  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast({
      title: "Copied to clipboard!",
      description: "Your invitation link has been copied.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      toast({
        title: "Error",
        description: "Please enter an invitation token",
      });
      return;
    }
    
    const { error } = await acceptInvitation(token);
    
    if (!error) {
      toast({
        title: "Connection successful!",
        description: "You're now connected with your partner.",
      });
      navigate('/dashboard');
    }
  };
  
  const handleCreateInvite = async () => {
    await createInvitation();
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
        {inviteUrl ? (
          <div className="space-y-4 animate-fade-in">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">Share this invitation link with your partner</p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="bg-background px-3 py-2 rounded border text-xs overflow-hidden text-ellipsis w-full">
                  {inviteUrl}
                </div>
                <Button size="sm" variant="outline" onClick={handleCopyInvite}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                When your partner clicks this link, they'll be able to connect with you
              </p>
            </div>
            
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
          <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col space-y-4">
              <Button 
                onClick={handleCreateInvite} 
                className="w-full gap-2 btn-primary-gradient"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="animate-spin">⚙️</span>
                    Creating...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Create Invitation Link
                  </>
                )}
              </Button>
              
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              
              <form onSubmit={handleConnect} className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm">Have an invitation token?</p>
                  <div className="flex items-center gap-2">
                    <Input 
                      value={token}
                      onChange={(e) => setToken(e.target.value)}
                      placeholder="Enter token" 
                      className="flex-1"
                    />
                    <Button 
                      type="submit" 
                      disabled={isLoading || !token}
                      className="gap-1"
                    >
                      {isLoading ? (
                        <span className="animate-spin">⚙️</span>
                      ) : (
                        <ArrowRight className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
            
            <div className="bg-love-50 p-3 rounded-lg border border-love-100">
              <p className="text-sm text-love-700">
                Connecting with your partner allows you to share goals, track relationship health, and access partner-specific features.
              </p>
            </div>
          </div>
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
