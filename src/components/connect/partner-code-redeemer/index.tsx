
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import ProfileChecker from './ProfileChecker';
import LoadingState from './LoadingState';
import AlreadyConnectedState from './AlreadyConnectedState';
import CodeInputForm from './CodeInputForm';

/**
 * Main component that orchestrates the partner code redemption flow
 */
const PartnerCodeRedeemer = () => {
  const [error, setError] = useState<string | null>(null);
  const { isLoading, profile } = useAuth();
  
  const hasPartner = Boolean(profile?.partner_id);
  
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };
  
  // Show loading state while profile is initializing
  if (isLoading) {
    return <LoadingState />;
  }
  
  if (hasPartner) {
    return <AlreadyConnectedState />;
  }
  
  return (
    <>
      <ProfileChecker onError={handleError} />
      <CodeInputForm />
    </>
  );
};

export default PartnerCodeRedeemer;
