
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Conflict } from '@/types/conflicts';
import { fetchUserConflicts, getConflictStatus, generateAIResolution } from '@/services/conflictService';
import ConflictFormDialog from '../conflicts/ConflictFormDialog';
import ConflictCard from '../conflicts/ConflictCard';
import LoadingState from '../conflicts/LoadingState';
import EmptyConflictState from '../conflicts/EmptyConflictState';

const ConflictsSection = () => {
  const { user, profile } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  
  // This would come from the partner relationship in a real app
  const mockPartnerId = "00000000-0000-0000-0000-000000000000";
  
  const loadConflicts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await fetchUserConflicts(user.id);
      setConflicts(data);
      
      // Check if any conflicts need AI resolution
      const needsAiResolution = data.find(
        conflict => conflict.responder_statement && !conflict.ai_resolution_plan
      );
      
      if (needsAiResolution) {
        await generateAIResolution(needsAiResolution.id);
        // Refresh conflicts after generating AI resolution
        const updatedData = await fetchUserConflicts(user.id);
        setConflicts(updatedData);
      }
    } catch (error) {
      console.error("Error loading conflicts:", error);
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (user) {
      loadConflicts();
    }
  }, [user]);
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Conflict Management
            </CardTitle>
            <CardDescription>Track and resolve relationship conflicts constructively</CardDescription>
          </div>
          {user && (
            <ConflictFormDialog 
              partnerId={profile?.partner_id || mockPartnerId} 
              onSuccess={loadConflicts} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <LoadingState />
        ) : conflicts.length === 0 ? (
          <EmptyConflictState />
        ) : (
          <div className="space-y-6">
            {conflicts.map((conflict) => {
              const status = getConflictStatus(conflict, user?.id || '');
              
              return (
                <ConflictCard 
                  key={conflict.id}
                  conflict={conflict}
                  status={status}
                  userId={user?.id || ''}
                  onSuccess={loadConflicts}
                />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictsSection;
