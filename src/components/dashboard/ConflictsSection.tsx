
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Conflict, ConflictStatus } from '@/types/conflicts';
import { fetchUserConflicts, getConflictStatus, generateAIResolution } from '@/services/conflictService';
import ConflictFormDialog from '../conflicts/ConflictFormDialog';
import ConflictCard from '../conflicts/ConflictCard';
import LoadingState from '../conflicts/LoadingState';
import EmptyConflictState from '../conflicts/EmptyConflictState';

const ConflictsSection = () => {
  const { user, profile } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  
  // This would come from the partner relationship in a real app
  const mockPartnerId = "00000000-0000-0000-0000-000000000000";
  
  const loadConflicts = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const data = await fetchUserConflicts(user.id);
      setConflicts(data);
      const needsAiResolution = data.find(
        conflict => conflict.responder_statement && !conflict.ai_resolution_plan
      );
      if (needsAiResolution) {
        await generateAIResolution(needsAiResolution.id);
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

  // Archiving is local-only: just hide from view (add persistence to DB if needed)
  const handleArchive = (conflictId: string) => {
    setArchivedIds(prev => [...prev, conflictId]);
  };

  // Split conflicts into active (unresolved, unarchived), resolved, and archived
  const activeAndPending = conflicts
    .filter(c => !c.resolved_at && !archivedIds.includes(c.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const resolved = conflicts
    .filter(c => !!c.resolved_at && !archivedIds.includes(c.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const archived = conflicts
    .filter(c => archivedIds.includes(c.id))
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

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
        ) : (
          <>
            {(activeAndPending.length === 0 && resolved.length === 0) && <EmptyConflictState />}
            {/* Active/Pending Conflicts */}
            {activeAndPending.length > 0 &&
              <div>
                <h4 className="mb-1 mt-0 text-base font-semibold text-harmony-700 tracking-wide">Active Conflicts</h4>
                <div className="space-y-4">
                  {activeAndPending.map((conflict) => {
                    const status = getConflictStatus(conflict, user?.id || '');
                    return (
                      <ConflictCard 
                        key={conflict.id}
                        conflict={conflict}
                        status={status}
                        userId={user?.id || ''}
                        onSuccess={loadConflicts}
                        onArchive={handleArchive}
                        isArchived={false}
                      />
                    );
                  })}
                </div>
              </div>
            }
            {/* Resolved */}
            {resolved.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-1 text-base font-semibold text-green-700 tracking-wide">Resolved Conflicts</h4>
                <div className="space-y-4 opacity-80">
                  {resolved.map((conflict) => {
                    const status = getConflictStatus(conflict, user?.id || '');
                    return (
                      <ConflictCard 
                        key={conflict.id}
                        conflict={conflict}
                        status={status}
                        userId={user?.id || ''}
                        onSuccess={loadConflicts}
                        onArchive={handleArchive}
                        isArchived={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            {/* Archived toggle */}
            {archived.length > 0 && (
              <div className="mt-8">
                <details>
                  <summary className="cursor-pointer text-sm font-medium text-gray-500">Show archived conflicts ({archived.length})</summary>
                  <div className="space-y-3 mt-2">
                    {archived.map((conflict) => {
                      const status = getConflictStatus(conflict, user?.id || '');
                      return (
                        <ConflictCard 
                          key={conflict.id}
                          conflict={conflict}
                          status={status}
                          userId={user?.id || ''}
                          onSuccess={loadConflicts}
                          onArchive={() => {}} // already archived
                          isArchived={true}
                        />
                      );
                    })}
                  </div>
                </details>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictsSection;

