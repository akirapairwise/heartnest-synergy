
import React from 'react';
import MoodCard from '@/components/dashboard/MoodCard';
import GoalsCard from '@/components/dashboard/GoalsCard';
import InsightsCard from '@/components/dashboard/InsightsCard';
import PartnerCard from '@/components/dashboard/PartnerCard';

const DashboardPage = () => {
  return (
    <div className="animate-fade-in">
      <h1 className="text-3xl font-bold mb-2">Welcome back, Alex</h1>
      <p className="text-muted-foreground mb-6">Here's an overview of your relationship</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <MoodCard />
            <GoalsCard />
          </div>
          <InsightsCard />
        </div>
        <div>
          <PartnerCard />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
