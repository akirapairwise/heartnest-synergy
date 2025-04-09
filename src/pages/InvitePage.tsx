
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { useInvitePageLogic } from '@/components/invite/useInvitePageLogic';
import InvitePageContent from '@/components/invite/InvitePageContent';
import LoadingState from '@/components/invite/LoadingState';

const InvitePage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  
  const {
    status,
    errorMessage,
    inviterName,
    isProcessing,
    authLoading,
    handleAcceptInvitation
  } = useInvitePageLogic(token);

  if (authLoading) {
    return <LoadingState />;
  }

  return (
    <InvitePageContent
      status={status}
      errorMessage={errorMessage}
      inviterName={inviterName}
      isProcessing={isProcessing}
      handleAcceptInvitation={handleAcceptInvitation}
    />
  );
};

export default InvitePage;
