
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import EventSuggestionsSection from '@/components/events/EventSuggestionsSection';

const EventSuggestionsPage = () => {
  useDocumentTitle('Event Suggestions');
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Event Suggestions</h1>
      <p className="text-muted-foreground mb-6">Discover personalized activities for you and your partner</p>
      
      <EventSuggestionsSection />
    </div>
  );
};

export default EventSuggestionsPage;
