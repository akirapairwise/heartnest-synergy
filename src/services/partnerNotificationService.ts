
import { supabase } from "@/integrations/supabase/client";
import { createNotification } from "./notificationsService";

// Function to create a notification when a partner updates their mood
export const notifyPartnerMoodUpdate = async (
  partnerId: string, 
  mood: string,
  isVisible: boolean
) => {
  // Only notify if the mood is set to visible
  if (!isVisible) return;
  
  try {
    // Create notification for the partner
    await createNotification({
      userId: partnerId,
      type: 'partner_mood_update',
      title: 'Partner Mood Update',
      message: `Your partner updated their mood to ${mood}`,
    });
    
    console.log('Partner mood notification sent');
  } catch (error) {
    console.error('Error sending mood notification:', error);
  }
};

// Function to create a notification when a partner updates a shared goal
export const notifyPartnerGoalUpdate = async (
  partnerId: string,
  goalId: string,
  goalTitle: string,
  action: 'created' | 'updated' | 'completed' | 'progress'
) => {
  try {
    let title = 'Goal Update';
    let message = '';
    
    switch (action) {
      case 'created':
        title = 'New Shared Goal';
        message = `Your partner created a new shared goal: "${goalTitle}"`;
        break;
      case 'updated':
        title = 'Goal Updated';
        message = `Your partner updated the shared goal: "${goalTitle}"`;
        break;
      case 'completed':
        title = 'Goal Completed';
        message = `Your partner marked the goal "${goalTitle}" as complete!`;
        break;
      case 'progress':
        title = 'Goal Progress';
        message = `Your partner made progress on "${goalTitle}"`;
        break;
    }
    
    await createNotification({
      userId: partnerId,
      type: 'partner_goal_update',
      title,
      message,
      relatedId: goalId
    });
    
    console.log('Partner goal notification sent');
  } catch (error) {
    console.error('Error sending goal notification:', error);
  }
};

// Function to create a notification when a partner creates or updates a shared event
export const notifyPartnerEventUpdate = async (
  partnerId: string,
  eventId: string,
  eventTitle: string,
  action: 'created' | 'updated' | 'cancelled'
) => {
  try {
    let title = 'Event Update';
    let message = '';
    
    switch (action) {
      case 'created':
        title = 'New Event Added';
        message = `Your partner added a new event: "${eventTitle}"`;
        break;
      case 'updated':
        title = 'Event Updated';
        message = `Your partner updated the event: "${eventTitle}"`;
        break;
      case 'cancelled':
        title = 'Event Cancelled';
        message = `Your partner cancelled the event: "${eventTitle}"`;
        break;
    }
    
    await createNotification({
      userId: partnerId,
      type: 'partner_event_update',
      title,
      message,
      relatedId: eventId
    });
    
    console.log('Partner event notification sent');
  } catch (error) {
    console.error('Error sending event notification:', error);
  }
};
