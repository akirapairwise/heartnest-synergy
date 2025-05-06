
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
import { createNotification } from '@/services/notificationsService';
import { Button } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem, PaginationLink } from "@/components/ui/pagination";

// Number of conflicts to load at a time
const CONFLICTS_PER_PAGE = 3;

const ConflictsSection = () => {
  const { user, profile } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [archivedIds, setArchivedIds] = useState<string[]>([]);
  const [totalConflicts, setTotalConflicts] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  
  // This would come from the partner relationship in a real app
  const mockPartnerId = "00000000-0000-0000-0000-000000000000";
  
  const loadConflicts = async (page = 0, append = false) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const offset = page * CONFLICTS_PER_PAGE;
      const { conflicts: fetchedConflicts, total } = await fetchUserConflicts(
        user.id, 
        CONFLICTS_PER_PAGE, 
        offset
      );
      
      setTotalConflicts(total);
      setHasMore(offset + fetchedConflicts.length < total);
      
      if (append) {
        setConflicts(prevConflicts => [...prevConflicts, ...fetchedConflicts]);
      } else {
        setConflicts(fetchedConflicts);
      }
      
      const needsAiResolution = fetchedConflicts.find(
        conflict => conflict.responder_statement && !conflict.ai_resolution_plan
      );
      
      if (needsAiResolution) {
        await generateAIResolution(needsAiResolution.id);
        const { conflicts: updatedConflicts } = await fetchUserConflicts(
          user.id, 
          CONFLICTS_PER_PAGE, 
          offset
        );
        
        if (append) {
          setConflicts(prevConflicts => {
            // Replace the conflicts from the current page
            const previousConflicts = prevConflicts.slice(0, offset);
            return [...previousConflicts, ...updatedConflicts];
          });
        } else {
          setConflicts(updatedConflicts);
        }
      }
    } catch (error) {
      console.error("Error loading conflicts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMoreConflicts = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    loadConflicts(nextPage, true);
  };

  useEffect(() => {
    if (user) {
      loadConflicts(0, false);
    }
  }, [user]);

  // Only allow archiving resolved conflicts
  const handleArchive = (conflictId: string) => {
    const conflict = conflicts.find(c => c.id === conflictId);
    if (conflict && conflict.resolved_at) {
      setArchivedIds(prev => [...prev, conflictId]);
    }
  };

  const handleConflictSuccess = async (conflictId?: string) => {
    await loadConflicts(0, false);
    setCurrentPage(0);
    
    // Create notification for new conflict
    if (conflictId && user) {
      const newConflict = conflicts.find(c => c.id === conflictId);
      if (newConflict && newConflict.responder_id && newConflict.responder_id !== user.id) {
        // This notification is redundant as we already have a database trigger,
        // but included here as an example of manual notification creation
        try {
          await createNotification({
            userId: newConflict.responder_id,
            type: 'new_conflict',
            title: 'New Conflict Discussion',
            message: `Your partner has started a conflict discussion about: ${newConflict.topic || 'a relationship issue'}`,
            relatedId: conflictId
          });
        } catch (error) {
          console.error('Failed to create notification:', error);
        }
      }
    }
  };

  // Split conflicts into active (unresolved, unarchived), resolved, and archived
  const activeAndPending = conflicts
    .filter(c => !c.resolved_at && !archivedIds.includes(c.id));
  
  const resolved = conflicts
    .filter(c => !!c.resolved_at && !archivedIds.includes(c.id));
  
  const archived = conflicts
    .filter(c => archivedIds.includes(c.id));

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
              onSuccess={handleConflictSuccess} 
            />
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading && conflicts.length === 0 ? (
          <LoadingState />
        ) : (
          <>
            {(activeAndPending.length === 0 && resolved.length === 0 && !hasMore) && <EmptyConflictState />}
            
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
                        onSuccess={handleConflictSuccess}
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
                        onSuccess={handleConflictSuccess}
                        onArchive={handleArchive}
                        isArchived={false}
                      />
                    );
                  })}
                </div>
              </div>
            )}
            
            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={loadMoreConflicts}
                  variant="outline"
                  className="gap-2"
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load More Conflicts'}
                </Button>
              </div>
            )}
            
            {/* Pagination State */}
            {totalConflicts > CONFLICTS_PER_PAGE && (
              <div className="mt-4 text-xs text-center text-muted-foreground">
                Showing {Math.min(conflicts.length, totalConflicts)} of {totalConflicts} conflicts
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
                          onSuccess={handleConflictSuccess}
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
