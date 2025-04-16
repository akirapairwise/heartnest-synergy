
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { usePartnerInvite } from '@/hooks/usePartnerInvite';
import { getInvitationByToken } from '@/services/partnerInviteService';
import { toast } from 'sonner';

export const useInvitePageLogic = (token: string | null) => {
  const { user, isLoading: authLoading, fetchUserProfile } = useAuth();
  const { acceptInvitation } = usePartnerInvite();
  const [status, setStatus] = useState<'loading' | 'valid' | 'invalid' | 'accepted' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const [inviterName, setInviterName] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      // If not logged in, redirect to auth page with return URL
      const returnUrl = encodeURIComponent(`/invite?token=${token}`);
      navigate(`/auth?returnUrl=${returnUrl}`);
      return;
    }

    // Validate the token
    if (token && user && status === 'loading') {
      validateToken(token);
    } else if (!token) {
      setStatus('invalid');
      setErrorMessage('No invitation token provided');
    }
  }, [token, user, authLoading, status, navigate]);

  const validateToken = async (inviteToken: string) => {
    try {
      console.log('Validating token:', inviteToken);
      const { data, error } = await getInvitationByToken(inviteToken);
      
      if (error || !data) {
        console.error('Invalid token:', error);
        setStatus('invalid');
        setErrorMessage(error?.message || 'This invitation link is invalid, expired, or has already been used');
        return;
      }
      
      // Check if user is trying to accept their own invitation
      if (data.inviter_id === user?.id) {
        console.log('User tried to accept their own invitation');
        setStatus('error');
        setErrorMessage('You cannot accept your own invitation');
        return;
      }
      
      // Set the inviter name if available
      if (data.inviter_name) {
        setInviterName(data.inviter_name);
      }
      
      console.log('Token is valid');
      setStatus('valid');
    } catch (error) {
      console.error('Error validating token:', error);
      setStatus('error');
      setErrorMessage('There was a problem processing this invitation');
    }
  };

  const handleAcceptInvitation = async () => {
    if (!token || !user) return;
    
    setIsProcessing(true);
    
    try {
      console.log('Accepting invitation...');
      const { error } = await acceptInvitation(token);
      
      if (error) {
        console.error('Failed to accept invitation:', error);
        setStatus('error');
        setErrorMessage(error.message || 'There was a problem accepting this invitation');
        toast.error(error.message || 'Failed to accept invitation');
      } else {
        console.log('Invitation accepted successfully');
        
        // Refresh user profile to get updated partner information
        // Make multiple attempts if needed
        let profileRefreshed = false;
        let attempts = 0;
        const maxAttempts = 5;  // Increased from 3 to 5
        
        while (!profileRefreshed && attempts < maxAttempts) {
          attempts++;
          try {
            console.log(`Refreshing user profile after connection (attempt ${attempts})...`);
            // Add a small delay before refreshing to allow database updates to propagate
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            if (user && fetchUserProfile) {
              await fetchUserProfile(user.id);
              console.log('Profile refreshed successfully');
              profileRefreshed = true;
            }
          } catch (profileError) {
            console.error(`Error refreshing user profile (attempt ${attempts}):`, profileError);
            
            if (attempts < maxAttempts) {
              // Increase wait time between retries with exponential backoff
              await new Promise(resolve => setTimeout(resolve, 1000 * attempts));
            }
          }
        }
        
        if (!profileRefreshed) {
          console.warn('Could not refresh user profile after multiple attempts');
          // Even if the profile refresh failed, the connection might still be successful
          // We'll proceed anyway, the user can refresh the page if needed
        }
        
        setStatus('accepted');
        toast.success('Partner connection successful!');
        
        // Redirect to dashboard after short delay
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Error accepting invitation:', error);
      setStatus('error');
      setErrorMessage(error.message || 'There was a problem accepting this invitation');
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    status,
    errorMessage,
    inviterName,
    isProcessing,
    authLoading,
    handleAcceptInvitation
  };
};
