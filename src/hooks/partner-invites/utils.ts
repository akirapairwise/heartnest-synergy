
// Helper function to generate a token
export const generateToken = (): string => {
  // Generate a 6-character token (letters and numbers)
  return Array.from(
    { length: 6 }, 
    () => {
      // Only use easy-to-read characters (no 0/O, 1/I confusion)
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      return chars.charAt(Math.floor(Math.random() * chars.length));
    }
  ).join('');
};

// Helper function to generate the invite URL
export const generateInviteUrl = (token: string): string => {
  // Always ensure uppercase token in URL
  const formattedToken = formatToken(token);
  return `${window.location.origin}/invite?token=${formattedToken}`;
};

// Helper function to format token consistently
export const formatToken = (token: string): string => {
  // Remove spaces, dashes and ensure uppercase
  return token.trim().replace(/-/g, '').toUpperCase();
};
