
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { Smile, Handshake, Lightbulb, Heart, CheckCircle, Copy } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProcessingState from './resolution/ProcessingState';
import { ScrollArea } from '@/components/ui/scroll-area';

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

  // Helper for copying text and showing toast
  const handleCopy = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success("Copied to clipboard!");
  };

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="w-full flex-1 max-h-[70vh] pb-2">
        <div className="flex flex-col gap-5 py-1">
          {!isJson && (
            <div className="p-5 rounded-xl shadow-sm border bg-white">
              <div className="whitespace-pre-line text-muted-foreground">
                {plan.raw}
              </div>
            </div>
          )}
          {isJson && (
            <>
              {/* Summary */}
              <div className="p-5 rounded-xl shadow-sm border card-gradient-harmony animate-fade-in flex flex-row gap-3 items-start">
                <Smile className="text-harmony-500 mr-2 mt-1" size={26} />
                <div className="flex-1">
                  <div className="font-semibold text-base sm:text-lg text-harmony-600 mb-1">
                    Conflict Summary
                  </div>
                  <div className="text-justify text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {plan.summary}
                  </div>
                </div>
              </div>
              {/* Tips as bullet list */}
              <div className="p-5 rounded-xl shadow-sm border card-gradient-love animate-fade-in flex flex-row gap-3 items-start">
                <Lightbulb className="text-love-500 mt-1" size={26} />
                <div className="flex-1">
                  <div className="font-semibold text-base sm:text-lg text-love-600 mb-1">
                    Resolution Tips
                  </div>
                  <ul className="list-disc ml-5 text-sm sm:text-base text-justify">
                    {/* Support both dash-delineated and newlines */}
                    {plan.resolution_tips?.split(/\n|•/g)
                      .map(item => item.replace(/^- /, '').trim())
                      .filter(Boolean)
                      .map((tip, idx) => (
                        <li key={idx} className="mb-1">
                          <span className="inline-flex items-center gap-1">
                            <Lightbulb className="text-yellow-400 inline mr-1" size={16} />
                            {tip}
                          </span>
                        </li>
                    ))}
                  </ul>
                </div>
              </div>
              {/* Empathy block from A to B */}
              {plan.empathy_prompts?.partner_a && (
                <div className="relative p-5 rounded-xl shadow-sm border bg-gradient-to-br from-blue-100/90 to-blue-50/80 animate-fade-in flex items-start gap-3">
                  <Heart className="text-calm-500 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base text-calm-600">Empathy from You</span>
                    </div>
                    <blockquote className="italic rounded px-3 py-2 border-l-4 border-calm-400 bg-calm-50 text-calm-700 text-justify text-[15px] whitespace-pre-line">
                      {plan.empathy_prompts.partner_a}
                    </blockquote>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-blue-500 hover:bg-blue-100"
                    onClick={() => handleCopy(plan.empathy_prompts!.partner_a!)}
                    aria-label="Copy empathy"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
              )}
              {/* Empathy block from B to A */}
              {plan.empathy_prompts?.partner_b && (
                <div className="relative p-5 rounded-xl shadow-sm border bg-gradient-to-br from-pink-100/90 to-pink-50/80 animate-fade-in flex items-start gap-3">
                  <Handshake className="text-love-500 mt-1" size={24} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-base text-love-700">
                        Empathy from Your Partner
                      </span>
                    </div>
                    <blockquote className="italic rounded px-3 py-2 border-l-4 border-love-400 bg-love-50 text-love-700 text-justify text-[15px] whitespace-pre-line">
                      {plan.empathy_prompts.partner_b}
                    </blockquote>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-4 text-pink-500 hover:bg-pink-100"
                    onClick={() => handleCopy(plan.empathy_prompts!.partner_b!)}
                    aria-label="Copy empathy"
                    title="Copy to clipboard"
                  >
                    <Copy size={18} />
                  </Button>
                </div>
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
