
import React from 'react';
import { Conflict } from '@/types/conflicts';
import { Button } from "@/components/ui/button";
import { Smile, AlignJustify, Heart, CheckCircle } from "lucide-react";
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import ProcessingState from './resolution/ProcessingState';
import { ScrollArea } from '@/components/ui/scroll-area';

type ConflictResolutionProps = {
  conflict: Conflict;
  onUpdate: () => void;
};

const sectionDetails = [
  {
    label: "Summary",
    icon: <AlignJustify className="text-harmony-500 mr-2" size={22} />,
    emoji: "🧩",
    key: "🧩 Summary:",
    card: "card-gradient-harmony",
  },
  {
    label: "Resolution Tips",
    icon: <Smile className="text-love-500 mr-2" size={22} />,
    emoji: "🛠️",
    key: "🛠️ Resolution Tips:",
    card: "card-gradient-love",
  },
  {
    label: "Empathy Prompts",
    icon: <Heart className="text-calm-500 mr-2" size={22} />,
    emoji: "💬",
    key: "💬 Empathy Prompts:",
    card: "card-gradient-calm",
  },
];

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

  // Split and map over the generation for sectioned display
  const blocks = conflict.ai_resolution_plan.split('\n\n');

  // Helper to extract main content after the first colon (":\n")
  function getSectionContent(section: string) {
    const idx = section.indexOf(':');
    if (idx !== -1 && idx < section.length - 1) {
      return section.slice(idx + 1).trim();
    }
    return section;
  }

  // We match each of the expected sections by the heading key (emojis with text)
  const sectionContent = sectionDetails.map((detail, i) => {
    const found = blocks.find((b) =>
      b.trim().startsWith(detail.key)
    );
    return {
      ...detail,
      content: found ? getSectionContent(found) : "",
    };
  });

  return (
    <div className="w-full h-full flex flex-col">
      <ScrollArea className="w-full flex-1 max-h-[60vh] pb-2">
        <div className="flex flex-col gap-5 py-1">
          {sectionContent.map(
            ({ label, icon, card, content }, idx) =>
              content && (
                <div key={label}
                  className={`p-5 rounded-xl shadow-sm border flex flex-col gap-2 ${card} animate-fade-in`}
                >
                  <div className="flex items-center mb-1">
                    {icon}
                    <span className="font-semibold text-base sm:text-lg text-foreground tracking-wide">{label}</span>
                  </div>
                  <div className="text-justify text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {content}
                  </div>
                </div>
              )
          )}
        </div>
      </ScrollArea>
      {!conflict.resolved_at && (
        <div className="flex justify-end mt-4">
          <Button onClick={markAsResolved} variant="harmony" className="text-white px-5 rounded-md font-medium text-base shadow-md hover:scale-105 transition-transform duration-200">
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark as Resolved
          </Button>
        </div>
      )}
    </div>
  );
};

export default ConflictResolution;

