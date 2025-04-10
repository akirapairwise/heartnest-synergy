
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerCodeGenerator from '@/components/connect/PartnerCodeGenerator';
import PartnerCodeRedeemer from '@/components/connect/PartnerCodeRedeemer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Heart, UserPlus } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ConnectPage = () => {
  useDocumentTitle('Connect Partner | HeartNest');
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md relative">
        <div className="absolute top-0 left-0 -mt-14">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="gap-2 hover:bg-white/30 transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <div className="text-center mb-6 animate-fade-in">
          <div className="inline-flex justify-center items-center mb-4">
            <div className="relative">
              <Heart className="h-12 w-12 text-love-500 animate-pulse-soft" />
              <UserPlus className="h-5 w-5 text-harmony-500 absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm" />
            </div>
          </div>
          <h1 className="text-2xl font-heading font-bold gradient-heading mb-1">Connect With Your Partner</h1>
          <p className="text-muted-foreground">Stay in sync with your significant other</p>
        </div>
        
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-white/40 p-5 animate-fade-in">
          <Tabs defaultValue="redeem" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="redeem" className="data-[state=active]:bg-love-50 data-[state=active]:text-love-600 data-[state=active]:shadow-none">
                <span className="flex items-center gap-2">
                  Enter Code
                </span>
              </TabsTrigger>
              <TabsTrigger value="generate" className="data-[state=active]:bg-harmony-50 data-[state=active]:text-harmony-600 data-[state=active]:shadow-none">
                <span className="flex items-center gap-2">
                  Generate Code
                </span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="redeem" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <PartnerCodeRedeemer />
            </TabsContent>
            
            <TabsContent value="generate" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <PartnerCodeGenerator />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default ConnectPage;
