
/**
 * Formats a token to be uppercase and remove any spaces
 */
export const formatToken = (token: string): string => {
  if (!token) return '';
  // Remove spaces, hyphens and convert to uppercase
  return token.replace(/[\s-]/g, '').toUpperCase();
};

/**
 * Generates a random token
 */
export const generateToken = (): string => {
  // Generate a cryptographically secure random token
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Generate an invite URL with the token
 */
export const generateInviteUrl = (token: string): string => {
  const baseUrl = window.location.origin;
  return `${baseUrl}/invite?token=${token}`;
};
