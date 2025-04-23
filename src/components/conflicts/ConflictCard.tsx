
import React from 'react';
import { Conflict, ConflictStatus } from '@/types/conflicts';
import { Clock, CheckCircle, X, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import ConflictResolution from './ConflictResolution';
import ConflictResponseDialog from './ConflictResponseDialog';
import { getStatusInfo, formatDate } from './utils/ConflictStatusUtils';
import { ScrollArea } from '@/components/ui/scroll-area';

type ConflictCardProps = {
  conflict: Conflict;
  status: ConflictStatus;
  userId: string;
  onSuccess: () => void;
  onArchive?: (conflictId: string) => void;
  isArchived?: boolean;
};

const ConflictCard = ({
  conflict,
  status,
  userId,
  onSuccess,
  onArchive,
  isArchived = false
}: ConflictCardProps) => {
  const [selectedConflict, setSelectedConflict] = React.useState<Conflict | null>(null);
  const statusInfo = getStatusInfo(status);
  const isUserResponder = userId === conflict.responder_id;
  const needsResponse = status === 'pending_response' && isUserResponder;

  // Styling for the resolved/archived states
  const opacityClass = isArchived ? "opacity-60 pointer-events-none" : "";
  
  return (
    <div className={`border rounded-lg p-4 bg-white shadow-sm transition-all group hover:shadow-md relative ${opacityClass}`}>
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-medium truncate pr-2">
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
      <div className="mt-3 flex justify-between items-center">
        {/* Left (archive button if not archived/resolved) */}
        {!conflict.resolved_at && !isArchived && !!onArchive && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Archive conflict"
            className="text-muted-foreground opacity-70 hover:opacity-100 ml-1"
            onClick={() => onArchive(conflict.id)}
            title="Archive this conflict"
          >
            <Archive className="h-5 w-5" />
          </Button>
        )}
        {isArchived && (
          <div className="flex items-center text-sm text-muted-foreground gap-1 pl-1">
            <Archive className="h-4 w-4" />
            Archived
          </div>
        )}
        {/* Right (response dialog, resolution drawer) */}
        <div className="flex items-center space-x-2">
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
                  variant="harmony"
                  size="sm"
                  className="hover-scale flex items-center"
                  onClick={() => setSelectedConflict(conflict)}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  View Resolution
                </Button>
              </SheetTrigger>
              <SheetContent 
                className="sm:max-w-md md:max-w-lg lg:max-w-xl p-0 bg-white/90 border-0 rounded-none rounded-l-xl shadow-xl animate-slide-in-right flex flex-col"
                side="right"
              >
                <div className="relative h-full flex flex-col">
                  {/* Sticky Header */}
                  <SheetHeader className="sticky top-0 z-10 bg-white/90 px-6 py-4 border-b">
                    <div className="flex justify-between items-center">
                      <div>
                        <SheetTitle className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-harmony-500" />
                          Conflict Resolution
                        </SheetTitle>
                        <SheetDescription>
                          AI-generated guidance to resolve this conflict
                        </SheetDescription>
                      </div>
                      <SheetClose asChild>
                        <button
                          className="flex items-center justify-center rounded-full bg-muted/80 hover:bg-muted text-muted-foreground w-8 h-8 transition-all ml-2"
                          aria-label="Close"
                          type="button"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </SheetClose>
                    </div>
                  </SheetHeader>
                  {/* Scrollable Content */}
                  <ScrollArea className="flex-1 min-h-0 max-h-[72vh] w-full px-6 py-4">
                    {selectedConflict && (
                      <div>
                        <ConflictResolution 
                          conflict={selectedConflict}
                          onUpdate={onSuccess}
                        />
                      </div>
                    )}
                  </ScrollArea>
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConflictCard;
