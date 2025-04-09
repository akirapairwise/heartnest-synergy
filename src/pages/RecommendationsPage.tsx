
import React from 'react';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import SuggestionsSection from '@/components/dashboard/SuggestionsSection';

const RecommendationsPage = () => {
  useDocumentTitle('Recommendations');
  
  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl sm:text-3xl font-bold mb-2">Relationship Recommendations</h1>
      <p className="text-muted-foreground mb-6">Personalized suggestions to enhance your relationship</p>
      
      <SuggestionsSection />
    </div>
  );
};

export default RecommendationsPage;
