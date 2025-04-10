
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check, RefreshCw, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { generatePartnerCode, getCurrentUserCode } from '@/services/partners/partnerCodeService';
import { useToast } from "@/components/ui/use-toast";

const PartnerCodeGenerator = () => {
  const [partnerCode, setPartnerCode] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  useEffect(() => {
    if (user) {
      loadExistingCode();
    }
  }, [user]);
  
  const loadExistingCode = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { code } = await getCurrentUserCode(user.id);
      setPartnerCode(code);
    } catch (error) {
      console.error('Failed to load existing code:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGenerateCode = async () => {
    if (!user) return;
    
    setIsGenerating(true);
    try {
      const { code, error } = await generatePartnerCode(user.id);
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to generate partner code. Please try again.",
          variant: "destructive"
        });
        return;
      }
      
      setPartnerCode(code);
      toast({
        title: "Success",
        description: "Partner code generated successfully!",
      });
    } catch (error) {
      console.error('Error generating partner code:', error);
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopyCode = () => {
    if (!partnerCode) return;
    
    navigator.clipboard.writeText(partnerCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Partner code copied to clipboard",
    });
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex justify-center items-center">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Partner Code</CardTitle>
        <CardDescription>
          Generate a code and share it with your partner to connect
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {partnerCode ? (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-2xl font-mono font-bold tracking-wider bg-primary/10 py-3 px-4 rounded-md inline-block">
                {partnerCode}
              </div>
              <div className="mt-2 flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={handleCopyCode}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Share this code with your partner. They'll need to enter it in their app to connect with you.
            </p>
            <div className="pt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleGenerateCode}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Regenerate Code
                  </>
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-center">
              Generate a unique code to connect with your partner. They'll need to enter this code in their app.
            </p>
            <Button 
              className="w-full"
              onClick={handleGenerateCode}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Partner Code"
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PartnerCodeGenerator;
