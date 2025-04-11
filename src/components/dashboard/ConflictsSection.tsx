
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, Clock, PlusCircle, MessageSquare } from "lucide-react";
import { useAuth } from '@/contexts/AuthContext';
import { Conflict, ConflictStatus } from '@/types/conflicts';
import { fetchUserConflicts, getConflictStatus, generateAIResolution } from '@/services/conflictService';
import ConflictFormDialog from '../conflicts/ConflictFormDialog';
import ConflictResponseDialog from '../conflicts/ConflictResponseDialog';
import ConflictResolution from '../conflicts/ConflictResolution';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const ConflictsSection = () => {
  const { user, profile } = useAuth();
  const [conflicts, setConflicts] = useState<Conflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  
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
  
  const getStatusInfo = (status: ConflictStatus) => {
    switch (status) {
      case 'resolved':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-500" />,
          label: 'Resolved',
          bg: 'bg-green-50',
          border: 'border-green-100',
          text: 'text-green-700'
        };
      case 'pending_response':
        return {
          icon: <Clock className="h-5 w-5 text-amber-500" />,
          label: 'Awaiting Response',
          bg: 'bg-amber-50',
          border: 'border-amber-100',
          text: 'text-amber-700'
        };
      case 'pending_ai':
        return {
          icon: <Clock className="h-5 w-5 text-blue-500" />,
          label: 'Processing',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-700'
        };
      case 'active':
        return {
          icon: <AlertCircle className="h-5 w-5 text-red-500" />,
          label: 'Active',
          bg: 'bg-red-50',
          border: 'border-red-100',
          text: 'text-red-700'
        };
      default:
        return {
          icon: <AlertCircle className="h-5 w-5 text-gray-500" />,
          label: 'Unknown',
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          text: 'text-gray-700'
        };
    }
  };
  
  const extractTopic = (statement: string): string => {
    const colonIndex = statement.indexOf(':');
    if (colonIndex > 0) {
      return statement.substring(0, colonIndex).trim();
    }
    return statement.split(' ').slice(0, 3).join(' ') + '...';
  };
  
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };
  
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
          <div className="flex justify-center p-6">
            <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
        ) : conflicts.length === 0 ? (
          <div className="text-center p-6 border rounded-lg bg-muted/20">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No conflicts recorded</h3>
            <p className="text-muted-foreground mb-4">
              Record relationship conflicts to work through them constructively together.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {conflicts.map((conflict) => {
              const status = getConflictStatus(conflict, user?.id || '');
              const statusInfo = getStatusInfo(status);
              const isUserResponder = user?.id === conflict.responder_id;
              const needsResponse = status === 'pending_response' && isUserResponder;
              
              return (
                <div key={conflict.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-medium">
                      {conflict.topic || "Untitled Conflict"}
                    </h3>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${statusInfo.bg}`}>
                      {statusInfo.icon}
                      <span className="text-xs">{statusInfo.label}</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {conflict.initiator_statement}
                  </p>
                  
                  <div className="flex items-center text-xs text-muted-foreground mb-3">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>Recorded on {formatDate(conflict.created_at)}</span>
                  </div>
                  
                  {conflict.resolved_at && (
                    <div className={`p-3 rounded-md ${statusInfo.bg} ${statusInfo.border}`}>
                      <p className={`text-sm font-medium ${statusInfo.text} mb-1`}>Resolution</p>
                      <p className={`text-sm ${statusInfo.text}`}>
                        Resolved on {formatDate(conflict.resolved_at)}
                      </p>
                    </div>
                  )}
                  
                  <div className="mt-3 flex justify-end space-x-2">
                    {needsResponse && (
                      <ConflictResponseDialog
                        conflict={conflict}
                        onSuccess={loadConflicts}
                      />
                    )}
                    
                    {!conflict.resolved_at && conflict.responder_statement && conflict.ai_resolution_plan && (
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedConflict(conflict)}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            View Resolution
                          </Button>
                        </SheetTrigger>
                        <SheetContent className="sm:max-w-md">
                          <SheetHeader>
                            <SheetTitle>Conflict Resolution</SheetTitle>
                            <SheetDescription>
                              AI-generated guidance to help resolve this conflict
                            </SheetDescription>
                          </SheetHeader>
                          {selectedConflict && (
                            <div className="mt-6">
                              <ConflictResolution 
                                conflict={selectedConflict}
                                onUpdate={loadConflicts}
                              />
                            </div>
                          )}
                        </SheetContent>
                      </Sheet>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ConflictsSection;
