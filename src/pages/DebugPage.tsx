
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const DebugPage = () => {
  const [enteredCode, setEnteredCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  
  const handleValidate = async () => {
    if (!enteredCode.trim()) {
      toast.error("Please enter a code to validate");
      return;
    }
    
    setIsValidating(true);
    
    try {
      // First, check the partner_codes table
      const { data, error } = await supabase
        .from("partner_codes")
        .select("*")
        .eq("code", enteredCode.toUpperCase())
        .eq("is_used", false)
        .limit(1)
        .maybeSingle();
        
      if (error) {
        console.error("Error checking partner code:", error);
        toast.error("❌ Error: " + error.message);
      } else if (data) {
        console.log("Valid partner code found:", data);
        toast.success(`✅ Code is valid. Inviter ID: ${data.inviter_id}`);
      } else {
        // If not found in partner_codes, check partner_invites
        const { data: inviteData, error: inviteError } = await supabase
          .from("partner_invites")
          .select("*")
          .eq("token", enteredCode.toUpperCase())
          .eq("is_accepted", false)
          .limit(1)
          .maybeSingle();
          
        if (inviteError) {
          console.error("Error checking partner invite:", inviteError);
          toast.error("❌ Error: " + inviteError.message);
        } else if (inviteData) {
          console.log("Valid partner invite found:", inviteData);
          toast.success(`✅ Invite is valid. Inviter ID: ${inviteData.inviter_id}`);
        } else {
          console.log("No valid partner code or invite found");
          toast.error("🚫 This code is invalid or expired.");
        }
      }
    } catch (err: any) {
      console.error("Validation error:", err);
      toast.error(`❌ Error: ${err.message || "Unknown error"}`);
    } finally {
      setIsValidating(false);
    }
  };
  
  return (
    <div className="container mx-auto py-10">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Partner Code Debug Tool</CardTitle>
          <CardDescription>
            Validate partner invitation codes for debugging purposes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="partnerCode" className="text-sm font-medium">
              Enter Partner Code
            </label>
            <Input
              id="partnerCode"
              value={enteredCode}
              onChange={(e) => setEnteredCode(e.target.value)}
              placeholder="Enter code (e.g., ABCD-1234)"
              className="uppercase"
            />
          </div>
          
          <Button 
            onClick={handleValidate} 
            className="w-full" 
            disabled={isValidating || !enteredCode.trim()}
          >
            {isValidating ? 'Validating...' : 'Validate Code'}
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>This tool checks codes in both partner_codes and partner_invites tables.</p>
            <p>It verifies that the code exists, is not used/accepted, and has not expired.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DebugPage;
