
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw, Copy, Check, Clock, ArrowLeft, Sparkles, Share2 } from "lucide-react";
import { toast } from "sonner";
import { generatePartnerCode, getActivePartnerCode } from "@/services/partnerCodeService";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from 'react-router-dom';

const PartnerCodeGenerator = () => {
  const [code, setCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { profile } = useAuth();
  const navigate = useNavigate();
  
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
  
  const handleSkip = () => {
    navigate('/dashboard');
  };
  
  if (hasPartner) {
    return (
      <Card className="w-full border-0 bg-transparent shadow-none">
        <CardHeader className="px-0 pt-0">
          <div className="flex justify-center mb-4">
            <div className="bg-harmony-100 text-harmony-600 p-4 rounded-full">
              <Share2 className="h-6 w-6" />
            </div>
          </div>
          <CardTitle>Already Connected</CardTitle>
          <CardDescription>You're already connected with a partner</CardDescription>
        </CardHeader>
        <CardContent className="text-center px-0">
          <p className="text-muted-foreground">
            You are currently connected with a partner and cannot generate a new code.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center px-0">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hover:bg-harmony-50 hover:text-harmony-600 transition-all"
            onClick={handleSkip}
          >
            <ArrowLeft className="h-4 w-4" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full border-0 bg-transparent shadow-none">
      <CardHeader className="px-0 pt-0">
        <div className="flex justify-center mb-4">
          <div className="bg-harmony-100 text-harmony-600 p-4 rounded-full">
            <Share2 className="h-6 w-6" />
          </div>
        </div>
        <CardTitle>Generate Partner Code</CardTitle>
        <CardDescription>Create a code for your partner to connect with you</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4 px-0">
        {code ? (
          <div className="space-y-4 animate-fade-in">
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
            
            <p className="text-sm text-center text-muted-foreground">
              Your partner will need to enter this code in their account to connect with you
            </p>
          </div>
        ) : (
          <div className="p-6 rounded-lg border border-dashed border-harmony-200 bg-harmony-50/50 flex flex-col items-center justify-center text-center">
            <div className="bg-harmony-100 text-harmony-600 p-3 rounded-full mb-4">
              <Sparkles className="h-5 w-5" />
            </div>
            <p className="mb-4 text-harmony-600">
              Generate a unique code that your partner can use to connect with you
            </p>
            <Button 
              onClick={handleGenerateCode} 
              disabled={isLoading}
              className="gap-2 bg-harmony-500 hover:bg-harmony-600 transition-all shadow-sm"
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
      
      <CardFooter className="flex justify-center gap-2 px-0">
        {code && (
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2 hover:bg-harmony-50 hover:text-harmony-600 transition-all"
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
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="gap-2 hover:text-muted-foreground/80 transition-all"
          onClick={handleSkip}
        >
          <ArrowLeft className="h-4 w-4" />
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PartnerCodeGenerator;
