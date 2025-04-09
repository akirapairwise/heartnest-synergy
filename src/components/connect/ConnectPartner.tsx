
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from 'react-router-dom';
import { Heart, UserPlus, Copy, Check, ArrowRight, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { usePartnerInvite } from "@/hooks/usePartnerInvite";
import { toast } from 'sonner';
import { Alert, AlertDescription } from "@/components/ui/alert";

const ConnectPartner = () => {
  const [copied, setCopied] = useState(false);
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast: uiToast } = useToast();
  const navigate = useNavigate();
  
  const {
    isLoading,
    inviteUrl,
    activeInvite,
    createInvitation,
    acceptInvitation
  } = usePartnerInvite();
  
  const handleCopyInvite = () => {
    if (!inviteUrl) return;
    
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    uiToast({
      title: "Copied to clipboard!",
      description: "Your invitation link has been copied.",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!token) {
      setError("Please enter an invitation token");
      return;
    }
    
    try {
      const { error } = await acceptInvitation(token);
      
      if (error) {
        setError(error.message || "Failed to accept invitation");
        return;
      }
      
      toast.success("Partner connected successfully!");
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    }
  };
  
  const handleCreateInvite = async () => {
    setError(null);
    try {
      const url = await createInvitation();
      
      if (!url) {
        // If createInvitation returns no url, there was likely an error
        setError("Failed to create invitation. You may already have a partner.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to create invitation");
    }
  };
  
  const handleSkip = () => {
    toast.info("You can connect with your partner anytime from your profile.");
    navigate('/dashboard');
  };
  
  const getInviteExpiration = () => {
    if (!activeInvite?.expires_at) return null;
    
    const expiresAt = new Date(activeInvite.expires_at);
    const now = new Date();
    const diffTime = Math.abs(expiresAt.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1 ? '1 day' : `${diffDays} days`;
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
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
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
              {getInviteExpiration() && (
                <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>Expires in {getInviteExpiration()}</span>
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
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
                    <Loader2 className="h-4 w-4 animate-spin" />
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
                        <Loader2 className="h-4 w-4 animate-spin" />
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
