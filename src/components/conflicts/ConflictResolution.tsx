
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { CheckCircle, Lightbulb, ScrollText, Sparkles } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

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
        })
        .eq('id', conflict.id);
        
      if (error) throw error;
      
      toast.success("Conflict marked as resolved");
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || "Failed to mark as resolved");
    }
  };
  
  if (!conflict.ai_summary || !conflict.ai_reflection || !conflict.ai_resolution_plan) {
    return (
      <div className="text-center p-8">
        <Sparkles className="mx-auto h-12 w-12 text-amber-500 mb-4" />
        <h3 className="text-lg font-medium mb-2">AI is working on a resolution</h3>
        <p className="text-muted-foreground">The AI is analyzing both perspectives to provide guidance.</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="bg-muted/30 p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <ScrollText className="h-5 w-5 text-blue-500" />
          <h3 className="font-medium">Summary</h3>
        </div>
        <p className="text-sm">{conflict.ai_summary}</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <Lightbulb className="h-5 w-5 text-amber-500" />
          <h3 className="font-medium">Reflection</h3>
        </div>
        <p className="text-sm">{conflict.ai_reflection}</p>
      </div>
      
      <div className="bg-muted/30 p-4 rounded-md">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-5 w-5 text-purple-500" />
          <h3 className="font-medium">Action Plan</h3>
        </div>
        <p className="text-sm">{conflict.ai_resolution_plan}</p>
      </div>
      
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
