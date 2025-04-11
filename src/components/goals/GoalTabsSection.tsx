
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
    <Tabs defaultValue="all-goals">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all-goals">All Goals</TabsTrigger>
        <TabsTrigger value="my-goals">My Goals</TabsTrigger>
        <TabsTrigger value="shared-goals">Shared Goals</TabsTrigger>
      </TabsList>
      
      <TabsContent value="all-goals" className="mt-6 space-y-8">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : (
          <>
            <Card className="border-l-4 border-l-primary">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  My Personal Goals
                </CardTitle>
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

            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-blue-500" />
                  Goals Shared With My Partner
                </CardTitle>
                <CardDescription>
                  Goals you've created and shared with your partner
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList 
                  goals={mySharedGoals}
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  isSharedView={true}
                  partnerId={partnerId}
                />
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Share2 className="h-5 w-5 text-purple-500" />
                  Goals Shared By My Partner
                </CardTitle>
                <CardDescription>
                  Goals your partner has shared with you
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GoalsList 
                  goals={partnerSharedGoals}
                  onEdit={onEdit} 
                  onDelete={onDelete}
                  onRefresh={onRefresh}
                  isPartnerView={true}
                />
              </CardContent>
            </Card>
          </>
        )}
      </TabsContent>
      
      <TabsContent value="my-goals" className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading goals...</p>
          </div>
        ) : (
          <GoalsList 
            goals={myGoals} 
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
          />
        )}
      </TabsContent>
      
      <TabsContent value="shared-goals" className="mt-6">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Loading shared goals...</p>
          </div>
        ) : (
          <GoalsList 
            goals={sharedGoals}
            onEdit={onEdit} 
            onDelete={onDelete}
            onRefresh={onRefresh}
            isSharedView={true}
            partnerId={partnerId}
          />
        )}
      </TabsContent>
    </Tabs>
  );
}
