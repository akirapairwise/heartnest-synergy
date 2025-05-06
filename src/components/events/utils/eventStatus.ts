
/**
 * Utility functions for determining event status
 */

/**
 * Determine if an event is in the past
 */
export const isEventPast = (eventDate: Date): boolean => {
  const now = new Date();
  // Compare by setting hours to 0 to only compare the date part
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const eventStart = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate());
  return eventStart < todayStart;
};

/**
 * Get the event status based on its date
 */
export const getEventStatus = (eventDate: Date): 'upcoming' | 'past' => {
  return isEventPast(eventDate) ? 'past' : 'upcoming';
};

/**
 * Get the event status color class based on days to event
 */
export const getEventStatusColor = (daysToEvent: number): string => {
  if (daysToEvent < 0) return "bg-muted border-muted text-muted-foreground"; // Past events
  if (daysToEvent === 0) return "bg-primary border-primary text-primary-foreground"; // Today
  if (daysToEvent === 1) return "bg-primary/90 border-primary/90 text-primary-foreground"; // Tomorrow
  if (daysToEvent <= 3) return "bg-primary/80 border-primary/80 text-primary-foreground"; // Soon
  if (daysToEvent <= 7) return "bg-primary/70 border-primary/70 text-primary-foreground"; // This week
  return "bg-muted border-muted/50 text-foreground"; // Later
};
