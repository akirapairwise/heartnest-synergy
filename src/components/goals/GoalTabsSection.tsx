
import React, { useEffect, useState } from 'react';
import { Goal } from '@/types/goals';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GoalsList } from '@/components/goals/GoalsList';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Share2, ArrowUpAZ, ArrowDownAZ, SlidersHorizontal } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface GoalTabsSectionProps {
  myGoals: Goal[];
  sharedGoals: Goal[];
  isLoading: boolean;
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
  onRefresh: () => void;
}

type SortOption = 'title' | 'date' | 'status' | 'category';
type SortDirection = 'asc' | 'desc';
type GoalType = 'all' | 'personal' | 'shared';

export function GoalTabsSection({
  myGoals,
  sharedGoals,
  isLoading,
  onEdit,
  onDelete,
  onRefresh
}: GoalTabsSectionProps) {
  const { profile } = useAuth();
  const [sortOption, setSortOption] = useState<SortOption>('date');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [goalTypeFilter, setGoalTypeFilter] = useState<GoalType>('all');
  const [filteredPersonalGoals, setFilteredPersonalGoals] = useState<Goal[]>([]);
  const [filteredSharedGoals, setFilteredSharedGoals] = useState<Goal[]>([]);
  const [partnerId, setPartnerId] = useState<string | null>(null);

  const sortGoals = (goals: Goal[]) => {
    return [...goals].sort((a, b) => {
      let comparison = 0;
      
      switch (sortOption) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'date':
          comparison = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
        case 'category':
          // Handle null categories for sorting
          const categoryA = a.category || '';
          const categoryB = b.category || '';
          comparison = categoryA.localeCompare(categoryB);
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  };

  const filterAndSortGoals = () => {
    let personal: Goal[] = [];
    let shared: Goal[] = [];
    
    if (goalTypeFilter === 'all' || goalTypeFilter === 'personal') {
      personal = sortGoals(myGoals.filter(goal => !goal.is_shared));
    }
    
    if (goalTypeFilter === 'all' || goalTypeFilter === 'shared') {
      shared = sortGoals(sharedGoals);
    }
    
    setFilteredPersonalGoals(personal);
    setFilteredSharedGoals(shared);
  };

  useEffect(() => {
    if (profile?.partner_id) {
      setPartnerId(profile.partner_id);
    }
    
    filterAndSortGoals();
  }, [myGoals, sharedGoals, profile, sortOption, sortDirection, goalTypeFilter]);

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <TabsList className="grid w-full sm:w-auto grid-cols-2 bg-gradient-to-r from-love-100/50 to-harmony-100/50 p-1 rounded-lg">
          <TabsTrigger value="shared" className="data-[state=active]:bg-white">
            <Share2 className="h-4 w-4 mr-2 text-love-500" />
            Shared Goals
          </TabsTrigger>
          <TabsTrigger value="personal" className="data-[state=active]:bg-white">
            <Target className="h-4 w-4 mr-2 text-harmony-500" />
            Personal Goals
          </TabsTrigger>
        </TabsList>

        <div className="flex items-center gap-2">
          {/* Type filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 px-3">
                <SlidersHorizontal className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuLabel>Filter Goals</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={goalTypeFilter} onValueChange={(value) => setGoalTypeFilter(value as GoalType)}>
                <DropdownMenuRadioItem value="all">All Goals</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="personal">Personal Only</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="shared">Shared Only</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Sort options */}
          <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
            <SelectTrigger className="w-[130px] h-9">
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Created Date</SelectItem>
              <SelectItem value="title">Title</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="category">Category</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')}
          >
            {sortDirection === 'asc' ? 
              <ArrowUpAZ className="h-4 w-4" /> : 
              <ArrowDownAZ className="h-4 w-4" />
            }
          </Button>
        </div>
      </div>
      
      <TabsContent value="shared" className="mt-4">
        <Card className="border-love-100 bg-gradient-to-br from-white to-love-50/20">
          <CardHeader className="pb-2 border-b border-love-100">
            <CardTitle className="text-lg text-love-700">Shared Relationship Goals</CardTitle>
            <CardDescription>
              Goals that you and your partner are working on together
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsList 
              goals={filteredSharedGoals} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onRefresh={onRefresh}
              isSharedView={true}
              partnerId={partnerId}
              isLoading={isLoading && !filteredSharedGoals.length}
            />
          </CardContent>
        </Card>
      </TabsContent>
      
      <TabsContent value="personal" className="mt-4">
        <Card className="border-harmony-100 bg-gradient-to-br from-white to-harmony-50/20">
          <CardHeader className="pb-2 border-b border-harmony-100">
            <CardTitle className="text-lg text-harmony-700">My Personal Goals</CardTitle>
            <CardDescription>
              Goals that only you can see and manage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GoalsList 
              goals={filteredPersonalGoals} 
              onEdit={onEdit} 
              onDelete={onDelete}
              onRefresh={onRefresh}
              isLoading={isLoading && !filteredPersonalGoals.length}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
