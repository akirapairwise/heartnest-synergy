
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, ArrowRight, Loader2, User } from "lucide-react";
import { toast } from "sonner";
import { usePartnerConnection } from '@/hooks/usePartnerConnection';
import { formatToken } from '@/hooks/partner-invites/utils';
import { useAuth } from '@/contexts/AuthContext';

const CodeInputForm = () => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { connectWithPartner, isLoading } = usePartnerConnection();
  const { profile } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code) {
      toast.error('Please enter an invitation code');
      return;
    }

    if (profile?.partner_id) {
      toast.error('You are already connected with a partner');
      return;
    }

    const formattedCode = formatToken(code);
    const success = await connectWithPartner(formattedCode);

    if (!success) {
      setError('Failed to connect with partner. Please check the code and try again.');
    }
  };

  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-center mb-4">
          <div className="bg-love-100 text-love-600 p-4 rounded-full">
            <User className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Enter Partner Code</CardTitle>
        <CardDescription>Connect with your partner by entering their invitation code</CardDescription>
      </CardHeader>
      
      <CardContent className="px-0">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter invitation code"
              className="flex-1"
              disabled={isLoading || !!profile?.partner_id}
              autoComplete="off"
            />
            <Button 
              type="submit" 
              disabled={isLoading || !code || !!profile?.partner_id}
              className="gap-1"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          {error && (
            <div className="flex items-center text-destructive gap-2 text-sm">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
};

export default CodeInputForm;
