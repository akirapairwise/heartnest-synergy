
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Copy, Check, Clock } from "lucide-react";
import { toast } from "sonner";
import { generatePartnerCode, getActivePartnerCode } from "@/services/partnerCodeService";
import { useAuth } from "@/contexts/AuthContext";

const PartnerCodeGenerator = () => {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { profile } = useAuth();
  
  const hasPartner = Boolean(profile?.partner_id);
  
  useEffect(() => {
    if (!hasPartner) {
      loadExistingCode();
    }
  }, [hasPartner]);
  
  const loadExistingCode = async () => {
    setIsLoading(true);
    try {
      const { code, error } = await getActivePartnerCode();
      if (error) throw error;
      
      if (code) {
        setCode(code);
      }
    } catch (error) {
      console.error('Error loading partner code:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateCode = async () => {
    setIsLoading(true);
    try {
      const { code, error } = await generatePartnerCode();
      if (error) throw error;
      
      setCode(code);
      toast.success('Partner code generated successfully');
    } catch (error) {
      console.error('Error generating partner code:', error);
      toast.error('Failed to generate partner code');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!code) return;
    
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Code copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (hasPartner) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Partner Connection</CardTitle>
          <CardDescription>You're already connected with a partner</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            You are currently connected with a partner and cannot generate a new code.
          </p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Partner Connection</CardTitle>
        <CardDescription>Generate a code to connect with your partner</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {code ? (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg text-center">
              <p className="text-sm text-muted-foreground mb-2">
                Share this code with your partner
              </p>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="bg-background px-6 py-4 rounded border text-lg font-mono font-semibold tracking-wider">
                  {code}
                </div>
                <Button size="sm" variant="outline" onClick={handleCopyCode}>
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <div className="flex items-center justify-center text-xs text-muted-foreground mt-2">
                <Clock className="h-3 w-3 mr-1" />
                <span>Expires in 48 hours</span>
              </div>
            </div>
            
            <p className="text-sm text-center text-muted-foreground">
              Your partner will need to enter this code in their account to connect with you
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border flex flex-col items-center justify-center text-center">
            <p className="mb-4 text-muted-foreground">
              Generate a unique code that your partner can use to connect with you
            </p>
            <Button 
              onClick={handleGenerateCode} 
              disabled={isLoading}
              className="gap-2"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  Generate Partner Code
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
      {code && (
        <CardFooter className="flex justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={handleGenerateCode}
            disabled={isLoading}
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Generate New Code
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default PartnerCodeGenerator;
