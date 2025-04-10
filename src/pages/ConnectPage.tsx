
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerCodeGenerator from '@/components/connect/PartnerCodeGenerator';
import PartnerCodeRedeemer from '@/components/connect/PartnerCodeRedeemer';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const ConnectPage = () => {
  useDocumentTitle('Connect Partner | HeartNest');
  
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-love-50 via-harmony-50 to-calm-50 p-4">
      <div className="w-full max-w-md">
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
