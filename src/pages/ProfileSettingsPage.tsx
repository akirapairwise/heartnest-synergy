
import React, { useState } from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import AccountSettings from '@/components/profile/AccountSettings';
import ProfileSettings from '@/components/profile/ProfileSettings';
import PartnerSettings from '@/components/profile/PartnerSettings';
import MoodSettings from '@/components/profile/MoodSettings';
import LogoutButton from '@/components/profile/LogoutButton';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ProfileSettingsPage = () => {
  useDocumentTitle('Profile Settings');
  const { isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('account');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-6 px-4 md:px-6 space-y-8">
      <h1 className="text-2xl font-bold">Profile Settings</h1>
      
      <Tabs 
        defaultValue="account" 
        value={activeTab}
        onValueChange={setActiveTab}
        className="w-full"
      >
        <TabsList className="w-full mb-6 grid grid-cols-4">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="partner">Partner</TabsTrigger>
          <TabsTrigger value="mood">Mood & Avatar</TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="space-y-6">
          <section id="account-settings">
            <h2 className="text-lg font-medium mb-4">Account Information</h2>
            <AccountSettings />
          </section>
        </TabsContent>
        
        <TabsContent value="profile" className="space-y-6">
          <section id="profile-settings">
            <h2 className="text-lg font-medium mb-4">Profile Information</h2>
            <ProfileSettings />
          </section>
        </TabsContent>
        
        <TabsContent value="partner" className="space-y-6">
          <section id="partner-settings">
            <h2 className="text-lg font-medium mb-4">Partner Management</h2>
            <PartnerSettings />
          </section>
        </TabsContent>
        
        <TabsContent value="mood" className="space-y-6">
          <section id="mood-settings">
            <h2 className="text-lg font-medium mb-4">Mood & Avatar Settings</h2>
            <MoodSettings />
          </section>
        </TabsContent>
      </Tabs>
      
      <Separator />
      
      <section id="logout" className="pt-4">
        <LogoutButton />
      </section>
    </div>
  );
};

export default ProfileSettingsPage;
