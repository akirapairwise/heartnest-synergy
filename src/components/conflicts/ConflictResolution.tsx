
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProcessingState from './resolution/ProcessingState';
import { ScrollArea } from '@/components/ui/scroll-area';

type ConflictResolutionProps = {
  conflict: Conflict;
  onUpdate: () => void;
};

const ConflictResolution = ({ conflict, onUpdate }: ConflictResolutionProps) => {
  const { user } = useAuth();

  const markAsResolved = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('conflicts')
        .update({
          resolved_at: new Date().toISOString()
        } as any)
        .eq('id', conflict.id);

      if (error) throw error;

      toast.success("Conflict marked as resolved");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as resolved");
    }
  };

  if (!conflict.ai_resolution_plan) {
    return <ProcessingState />;
  }

  return (
    <div className="w-full">
      <ScrollArea className="max-h-[60vh] md:max-h-[50vh] w-full rounded-md border bg-muted/10 p-3 sm:p-6 md:p-8">
        <div className="whitespace-pre-line space-y-6">
          {conflict.ai_resolution_plan.split('\n\n').map((section, index) => {
            // Highlight each block for clarity
            const hasEmoji = section.includes('🧩') || section.includes('🛠️') || section.includes('💬');
            return (
              <div
                key={index}
                className={`break-words ${index > 0 ? 'mt-4' : ''} ${hasEmoji ? 'font-semibold text-base sm:text-lg' : 'text-sm sm:text-base'} `}
                style={{ wordBreak: 'break-word' }}
              >
                {section}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      {!conflict.resolved_at && (
        <div className="flex justify-end mt-4">
          <Button onClick={markAsResolved} variant="outline">
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Resolved
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConflictResolution;
