
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/contexts/AuthContext';
import { generateInviteUrl } from '@/hooks/partner-invites/utils';

const PartnerCodeGenerator = () => {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { user, profile } = useAuth();

  const generatePartnerCode = async () => {
    if (!user) {
      toast.error('You must be logged in to generate a code');
      return;
    }

    setIsLoading(true);
    try {
      // Calculate expiration date (48 hours from now)
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 48);
      
      // Delete any existing codes for this user
      await supabase
        .from('partner_codes')
        .delete()
        .eq('inviter_id', user.id)
        .eq('is_used', false);
      
      // Generate a random code
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let generatedCode = '';
      for (let i = 0; i < 6; i++) {
        generatedCode += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      
      // Insert the new code
      const { error } = await supabase
        .from('partner_codes')
        .insert({
          code: generatedCode,
          inviter_id: user.id,
          is_used: false,
          created_at: new Date().toISOString(),
          expires_at: expiresAt.toISOString()
        });

      if (error) {
        console.error('Error generating partner code:', error);
        toast.error('Failed to generate partner code');
        return;
      }

      setCode(generatedCode);
      toast.success('Partner code generated successfully');
    } catch (error) {
      console.error('Unexpected error generating partner code:', error);
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Initial code generation if no partner exists
    if (user && !profile?.partner_id && !code) {
      generatePartnerCode();
    }
  }, [user, profile]);

  const handleCopyCode = () => {
    if (!code) return;
    
    const inviteUrl = generateInviteUrl(code);
    navigator.clipboard.writeText(inviteUrl);
    setCopied(true);
    toast.success('Invite link copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };

  if (profile?.partner_id) {
    return (
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardHeader>
          <CardTitle>Already Connected</CardTitle>
          <CardDescription>You are already connected with a partner</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader>
        <CardTitle>Generate Partner Code</CardTitle>
        <CardDescription>Create a code for your partner to connect with you</CardDescription>
      </CardHeader>
      
      <CardContent>
        {code ? (
          <div className="space-y-4">
            <div className="p-6 bg-gradient-to-br from-harmony-50 to-white rounded-lg border border-harmony-100 shadow-sm text-center">
              <p className="text-sm text-harmony-700 font-medium mb-2">
                Share this code with your partner
              </p>
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className="bg-white px-6 py-4 rounded-md border border-harmony-200 text-xl font-mono font-semibold tracking-wider text-harmony-700 shadow-inner">
                  {code}
                </div>
                <Button 
                  size="sm" 
                  variant={copied ? "outline" : "secondary"}
                  onClick={handleCopyCode}
                  className={`transition-all ${copied ? 'bg-green-50 text-green-600 border-green-200' : 'bg-harmony-100 text-harmony-700 border-harmony-200 hover:bg-harmony-200'}`}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-center text-xs text-harmony-600">
                <Clock className="h-3 w-3 mr-1" />
                <span>Expires in 48 hours</span>
              </div>
            </div>
            
            <div className="flex justify-center">
              <Button 
                variant="outline" 
                onClick={generatePartnerCode}
                disabled={isLoading}
              >
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Regenerate Code
              </Button>
            </div>
          </div>
        ) : (
          <Button 
            onClick={generatePartnerCode} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              'Generate Partner Code'
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerCodeGenerator;
