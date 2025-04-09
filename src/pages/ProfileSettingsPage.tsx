
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import AccountSettings from '@/components/profile/AccountSettings';
import ProfileSettings from '@/components/profile/ProfileSettings';
import PartnerSettings from '@/components/profile/PartnerSettings';
import MoodSettings from '@/components/profile/MoodSettings';
import LogoutButton from '@/components/profile/LogoutButton';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

const ProfileSettingsPage = () => {
  useDocumentTitle('Profile Settings');
  const { isLoading } = useAuth();

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
      
      <div className="space-y-8">
        <section id="account-settings">
          <h2 className="text-lg font-medium mb-4">Account Information</h2>
          <AccountSettings />
        </section>
        
        <Separator />
        
        <section id="profile-settings">
          <h2 className="text-lg font-medium mb-4">Profile Information</h2>
          <ProfileSettings />
        </section>
        
        <Separator />
        
        <section id="partner-settings">
          <h2 className="text-lg font-medium mb-4">Partner Management</h2>
          <PartnerSettings />
        </section>
        
        <Separator />
        
        <section id="mood-settings">
          <h2 className="text-lg font-medium mb-4">Mood & Avatar Settings</h2>
          <MoodSettings />
        </section>
        
        <Separator />
        
        <section id="logout" className="pt-4">
          <LogoutButton />
        </section>
      </div>
    </div>
  );
};

export default ProfileSettingsPage;
