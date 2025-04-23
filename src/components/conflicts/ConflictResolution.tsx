
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { Smile, Handshake, Lightbulb, Heart, CheckCircle, Copy, Share2 } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProcessingState from './resolution/ProcessingState';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';

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

  // Helper for sharing via platforms
  const shareViaWhatsApp = (text: string) => {
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const shareViaSMS = (text: string) => {
    const url = `sms:?&body=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

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
              {/* Summary */}
              <Card className="p-5 rounded-xl border card-gradient-harmony animate-fade-in">
                <div className="flex flex-row gap-3 items-start">
                  <Smile className="text-harmony-500 mr-2 mt-1" size={26} />
                  <div className="flex-1">
                    <div className="font-semibold text-base sm:text-lg text-harmony-600 mb-1">
                      🧩 Conflict Summary
                    </div>
                    <div className="text-justify text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                      {plan.summary}
                    </div>
                  </div>
                </div>
              </Card>
              
              {/* Tips as bullet list */}
              <Card className="p-5 rounded-xl border card-gradient-love animate-fade-in">
                <div className="flex flex-row gap-3 items-start">
                  <Lightbulb className="text-love-500 mt-1" size={26} />
                  <div className="flex-1">
                    <div className="font-semibold text-base sm:text-lg text-love-600 mb-1">
                      🛠️ Resolution Tips
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
              </Card>
              
              <div className="font-semibold text-base sm:text-lg mb-3 text-gray-700">
                💬 Empathy Prompts
              </div>
              
              {/* Empathy block from A to B */}
              {plan.empathy_prompts?.partner_a && (
                <Card className="p-5 rounded-xl border bg-gradient-to-br from-blue-100/90 to-blue-50/80 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Heart className="text-calm-500 mt-1" size={24} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base text-calm-600">Partner A ➡️ B</span>
                      </div>
                      <ScrollArea className="max-h-[200px]">
                        <blockquote className="italic rounded px-3 py-2 border-l-4 border-calm-400 bg-calm-50 text-calm-700 text-justify text-[15px] whitespace-pre-line">
                          {plan.empathy_prompts.partner_a}
                        </blockquote>
                      </ScrollArea>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-calm-600 border-calm-300 hover:bg-calm-100"
                          onClick={() => handleCopy(plan.empathy_prompts!.partner_a!)}
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-calm-600 border-calm-300 hover:bg-calm-100"
                          onClick={() => shareViaWhatsApp(plan.empathy_prompts!.partner_a!)}
                        >
                          <Share2 size={14} className="mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-calm-600 border-calm-300 hover:bg-calm-100"
                          onClick={() => shareViaSMS(plan.empathy_prompts!.partner_a!)}
                        >
                          <Share2 size={14} className="mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
              
              {/* Empathy block from B to A */}
              {plan.empathy_prompts?.partner_b && (
                <Card className="p-5 rounded-xl border bg-gradient-to-br from-pink-100/90 to-pink-50/80 animate-fade-in">
                  <div className="flex items-start gap-3">
                    <Handshake className="text-love-500 mt-1" size={24} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-base text-love-700">
                          Partner B ➡️ A
                        </span>
                      </div>
                      <ScrollArea className="max-h-[200px]">
                        <blockquote className="italic rounded px-3 py-2 border-l-4 border-love-400 bg-love-50 text-love-700 text-justify text-[15px] whitespace-pre-line">
                          {plan.empathy_prompts.partner_b}
                        </blockquote>
                      </ScrollArea>
                      
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-love-600 border-love-300 hover:bg-love-100"
                          onClick={() => handleCopy(plan.empathy_prompts!.partner_b!)}
                        >
                          <Copy size={14} className="mr-1" />
                          Copy
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-love-600 border-love-300 hover:bg-love-100"
                          onClick={() => shareViaWhatsApp(plan.empathy_prompts!.partner_b!)}
                        >
                          <Share2 size={14} className="mr-1" />
                          WhatsApp
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-love-600 border-love-300 hover:bg-love-100"
                          onClick={() => shareViaSMS(plan.empathy_prompts!.partner_b!)}
                        >
                          <Share2 size={14} className="mr-1" />
                          SMS
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
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
