
import React, { useEffect, useState } from 'react';
import { Goal } from '@/types/goals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalsList } from '@/components/goals/GoalsList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Share2 } from 'lucide-react';

interface GoalTabsSectionProps {
  myGoals: Goal[];
  sharedGoals: Goal[];
  isLoading: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

export function GoalTabsSection({
  myGoals,
  sharedGoals,
  isLoading,
  onEdit,
  onDelete,
  onRefresh
}: GoalTabsSectionProps) {
  const { profile } = useAuth();
  const [personalGoals, setPersonalGoals] = useState<Goal[]>([]);
  const [mySharedGoals, setMySharedGoals] = useState<Goal[]>([]);
  const [partnerSharedGoals, setPartnerSharedGoals] = useState<Goal[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  useEffect(() => {
    // Set partner ID from profile
    if (profile && profile.partner_id) {
      setPartnerId(profile.partner_id);
    }
    
    // Filter my personal goals (not shared)
    const personal = myGoals.filter(goal => !goal.is_shared);
    setPersonalGoals(personal);
    
    // Filter my shared goals
    const shared = myGoals.filter(goal => goal.is_shared);
    setMySharedGoals(shared);
    
    // Filter partner's shared goals - ensuring we only get goals shared by the partner
    const partnerShared = sharedGoals.filter(goal => 
      goal.is_shared && goal.owner_id !== profile?.id
    );
    setPartnerSharedGoals(partnerShared);
  }, [myGoals, sharedGoals, profile]);
  
  // Set up subscription for real-time updates on goals
  useEffect(() => {
    const channel = supabase
      .channel('goal-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'goals'
      }, () => {
        // Refresh goals when any change occurs
        onRefresh();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [onRefresh]);
  
  return (
    <Tabs defaultValue="shared">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="shared">
          <Share2 className="h-4 w-4 mr-2" />
          Shared Goals
        </TabsTrigger>
        <TabsTrigger value="personal">
          <Target className="h-4 w-4 mr-2" />
          Personal Goals
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="shared" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Shared Relationship Goals</CardTitle>
            <CardDescription>
              Goals that you and your partner are working on together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsList 
              goals={sharedGoals} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onRefresh={onRefresh}
              isSharedView={true}
              partnerId={partnerId}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="personal" className="mt-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">My Personal Goals</CardTitle>
            <CardDescription>
              Goals that only you can see and manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsList 
              goals={personalGoals} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onRefresh={onRefresh}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
