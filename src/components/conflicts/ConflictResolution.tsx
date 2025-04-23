
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { CheckCircle, AlertCircle } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
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
  if (!conflict.ai_resolution_plan) {
    return <ProcessingState />;
  }
  
  return (
    <div className="space-y-6">
      <div className="whitespace-pre-line">
        {conflict.ai_resolution_plan.split('\n\n').map((section, index) => {
          // Check if the section contains emoji that we can use to style it
          const hasEmoji = section.includes('🧩') || section.includes('🛠️') || section.includes('💬');
          
          return (
            <div 
              key={index} 
              className={`${index > 0 ? 'mt-4' : ''} ${hasEmoji ? 'font-medium' : ''}`}
            >
              {section}
            </div>
          );
        })}
      </div>
      
      {!conflict.resolved_at && (
        <div className="flex justify-end mt-6">
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
