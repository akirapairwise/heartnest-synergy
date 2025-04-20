
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
