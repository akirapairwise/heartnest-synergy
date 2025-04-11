
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatToken } from '@/hooks/partner-invites/utils';
import { Loader2, Check, AlertCircle, Bug } from "lucide-react";

/**
 * Debug component to test partner code validation
 */
const PartnerCodeDebugger = () => {
  const [enteredCode, setEnteredCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastResult, setLastResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);
  
  const validateCode = async () => {
    if (!enteredCode.trim()) {
      toast.error("Please enter a code to validate");
      return;
    }
    
    setIsLoading(true);
    setLastResult(null);
    const formattedCode = formatToken(enteredCode);
    
    try {
      console.log('Validating code:', formattedCode);
      
      // Query to check if the code exists in partner_codes
      const { data, error } = await supabase
        .from("partner_codes")
        .select("*")
        .eq("code", formattedCode)
        .eq("is_used", false)
        .limit(1)
        .maybeSingle();
      
      if (error) {
        console.error('Error validating code:', error);
        toast.error("❌ Error: " + error.message);
        setLastResult({
          success: false,
          message: "❌ Error: " + error.message,
        });
        return;
      }
      
      if (!data) {
        console.log('No valid code found');
        toast.error("🚫 This code is invalid or expired.");
        setLastResult({
          success: false,
          message: "🚫 This code is invalid or expired.",
        });
        return;
      }
      
      console.log('Valid code found:', data);
      toast.success("✅ Code is valid. Inviter ID: " + data.inviter_id);
      setLastResult({
        success: true,
        message: "✅ Code is valid. Inviter ID: " + data.inviter_id,
        data: data,
      });
      
    } catch (err) {
      console.error('Unexpected error validating code:', err);
      toast.error("❌ Unexpected error: " + (err instanceof Error ? err.message : String(err)));
      setLastResult({
        success: false,
        message: "❌ Unexpected error: " + (err instanceof Error ? err.message : String(err)),
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bug className="h-5 w-5 text-muted-foreground" />
          <CardTitle>Partner Code Debugger</CardTitle>
        </div>
        <CardDescription>
          Test partner code validation before attempting to connect
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              placeholder="Enter partner code"
              className="flex-1"
              disabled={isLoading}
            />
            <Button 
              onClick={validateCode}
              disabled={isLoading || !enteredCode}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Validate Code
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            Validates if a partner code exists and is usable
          </p>
        </div>
        
        {lastResult && (
          <div className={`p-4 rounded-md ${lastResult.success ? 'bg-green-50 border border-green-100' : 'bg-red-50 border border-red-100'}`}>
            <div className="flex items-start gap-2">
              {lastResult.success ? (
                <Check className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div>
                <p className={`font-medium ${lastResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {lastResult.message}
                </p>
                
                {lastResult.data && (
                  <div className="mt-2 text-xs font-mono bg-black/5 p-2 rounded overflow-auto max-h-40">
                    <pre>{JSON.stringify(lastResult.data, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between text-xs text-muted-foreground">
        <p>Ensure RLS allows SELECT for any user where is_used = false</p>
      </CardFooter>
    </Card>
  );
};

export default PartnerCodeDebugger;
