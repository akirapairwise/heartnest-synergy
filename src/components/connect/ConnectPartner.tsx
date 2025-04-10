
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, Heart, UserPlus, LinkIcon } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import PartnerCodeGenerator from './PartnerCodeGenerator';
import PartnerCodeRedeemer from './PartnerCodeRedeemer';

const ConnectPartner = () => {
  const [activeTab, setActiveTab] = useState<string>("generate");
  const { profile } = useAuth();
  const navigate = useNavigate();
  
  // If user already has a partner, redirect to dashboard
  if (profile?.partner_id) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Heart className="h-12 w-12 text-love-500" />
          </div>
          <CardTitle className="text-2xl gradient-heading">Already Connected</CardTitle>
          <CardDescription>
            You're already connected with a partner
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="mb-4">You already have a partner connection established.</p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <Heart className="h-12 w-12 text-love-500" />
            <LinkIcon className="h-5 w-5 text-harmony-500 absolute bottom-0 right-0 bg-white rounded-full p-0.5" />
          </div>
        </div>
        <CardTitle className="text-2xl gradient-heading">Connect With Your Partner</CardTitle>
        <CardDescription>
          Link your account with your partner to unlock all relationship features
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="generate">Generate Code</TabsTrigger>
            <TabsTrigger value="redeem">Enter Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="generate">
            <PartnerCodeGenerator />
          </TabsContent>
          
          <TabsContent value="redeem">
            <PartnerCodeRedeemer />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button variant="link" onClick={() => navigate('/dashboard')}>
          Skip for now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ConnectPartner;
