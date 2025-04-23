
import React from 'react';
import { Conflict, ConflictStatus } from '@/types/conflicts';
import { Clock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger } from "@/components/ui/sheet";
import ConflictResolution from './ConflictResolution';
import ConflictResponseDialog from './ConflictResponseDialog';
import { getStatusInfo, formatDate } from './utils/ConflictStatusUtils';

type ConflictCardProps = {
  conflict: Conflict;
  status: ConflictStatus;
  userId: string;
  onSuccess: () => void;
};

const ConflictCard = ({ conflict, status, userId, onSuccess }: ConflictCardProps) => {
  const [selectedConflict, setSelectedConflict] = React.useState<Conflict | null>(null);
  const statusInfo = getStatusInfo(status);
  const isUserResponder = userId === conflict.responder_id;
  const needsResponse = status === 'pending_response' && isUserResponder;
  
  return (
    <div className="border rounded-lg p-4">
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
            onSuccess={onSuccess}
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
            <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto">
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
                    onUpdate={onSuccess}
                  />
                </div>
              )}
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  );
};

export default ConflictCard;
