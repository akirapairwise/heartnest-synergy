
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProcessingState from './resolution/ProcessingState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import ResolutionSummary from './resolution/ResolutionSummary';
import ResolutionTips from './resolution/ResolutionTips';
import EmpathyPromptBlock from './resolution/EmpathyPromptBlock';

// Helper to detect new JSON format
function tryParseAIPlan(plan: string): {
  summary?: string;
  resolution_tips?: string;
  empathy_prompts?: { partner_a?: string; partner_b?: string; };
  raw?: string;
} {
  try {
    const json = JSON.parse(plan);
    // New schema (with empathy_prompts as object)
    if (
      typeof json.summary === "string" &&
      typeof json.resolution_tips === "string" &&
      typeof json.empathy_prompts === "object"
    ) {
      return json;
    }
    // Legacy fallback
    return { raw: plan };
  } catch {
    // Legacy fallback
    return { raw: plan };
  }
}

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
          resolved_at: new Date().toISOString(),
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

  // Handle new JSON or old string format
  const plan = tryParseAIPlan(conflict.ai_resolution_plan);
  const isJson = !!plan.summary;

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="w-full flex-1 max-h-[70vh] px-1">
        <div className="flex flex-col gap-5 py-1">
          {!isJson && (
            <Card className="p-5 rounded-xl bg-white">
              <ScrollArea className="h-full max-h-[500px]">
                <div className="whitespace-pre-line text-muted-foreground">
                  {plan.raw}
                </div>
              </ScrollArea>
            </Card>
          )}
          {isJson && (
            <>
              <ResolutionSummary summary={plan.summary || ""} />
              <ResolutionTips tips={plan.resolution_tips || ""} />
              <div className="font-semibold text-base sm:text-lg mb-3 text-gray-700">
                💬 Empathy Prompts
              </div>
              {plan.empathy_prompts?.partner_a && (
                <EmpathyPromptBlock direction="a" prompt={plan.empathy_prompts.partner_a} />
              )}
              {plan.empathy_prompts?.partner_b && (
                <EmpathyPromptBlock direction="b" prompt={plan.empathy_prompts.partner_b} />
              )}
            </>
          )}
        </div>
      </ScrollArea>
      {!conflict.resolved_at && (
        <div className="flex justify-end mt-4">
          <Button
            onClick={markAsResolved}
            variant="harmony"
            className="text-white px-5 rounded-md font-medium text-base shadow-md hover:scale-105 transition-transform duration-200 bg-gradient-to-r from-green-400 to-emerald-500"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Resolved
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConflictResolution;
