
// Helper function to generate a token
export const generateToken = (): string => {
  return Array.from(
    { length: 12 },
    () => Math.floor(Math.random() * 36).toString(36)
  ).join('').toUpperCase();
};

// Helper function to generate the invite URL
export const generateInviteUrl = (token: string): string => {
  return `${window.location.origin}/invite?token=${token}`;
};
