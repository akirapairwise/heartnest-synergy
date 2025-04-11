
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { CheckCircle, Lightbulb, ScrollText, Sparkles } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ResolutionSection from './resolution/ResolutionSection';
import ProcessingState from './resolution/ProcessingState';

type ConflictResolutionProps = {
  conflict: Conflict;
  onUpdate: () => void;
};

const ConflictResolution = ({ conflict, onUpdate }: ConflictResolutionProps) => {
  const { user } = useAuth();
  
  const markAsResolved = async () => {
    if (!user) return;
    
    try {
      // Use type assertion to bypass the TypeScript error
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
  
  // If AI hasn't generated resolution content yet
  if (!conflict.ai_summary || !conflict.ai_reflection || !conflict.ai_resolution_plan) {
    return <ProcessingState />;
  }
  
  return (
    <div className="space-y-6">
      <ResolutionSection 
        icon={<ScrollText className="h-5 w-5 text-blue-500" />}
        title="Summary"
        content={conflict.ai_summary}
        iconColor="text-blue-500"
      />
      
      <ResolutionSection 
        icon={<Lightbulb className="h-5 w-5 text-amber-500" />}
        title="Reflection"
        content={conflict.ai_reflection}
        iconColor="text-amber-500"
      />
      
      <ResolutionSection 
        icon={<Sparkles className="h-5 w-5 text-purple-500" />}
        title="Action Plan"
        content={conflict.ai_resolution_plan}
        iconColor="text-purple-500"
      />
      
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
