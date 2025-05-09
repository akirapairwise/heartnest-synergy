
import React from 'react';

interface SocialLoginButtonsProps {
  setError: (error: string | null) => void;
}

const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({ setError }) => {
  // Component kept for future social login implementations
  // Google auth has been removed temporarily
  return null;
};

export default SocialLoginButtons;
