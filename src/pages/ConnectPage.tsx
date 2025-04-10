
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerCodeGenerator from '@/components/connect/PartnerCodeGenerator';
import PartnerCodeRedeemer from '@/components/connect/PartnerCodeRedeemer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const ConnectPage = () => {
  useDocumentTitle('Connect Partner | HeartNest');
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        <Tabs defaultValue="redeem" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="redeem">Enter Code</TabsTrigger>
            <TabsTrigger value="generate">Generate Code</TabsTrigger>
          </TabsList>
          
          <TabsContent value="redeem">
            <PartnerCodeRedeemer />
          </TabsContent>
          
          <TabsContent value="generate">
            <PartnerCodeGenerator />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ConnectPage;
