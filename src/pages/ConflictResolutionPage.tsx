
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Conflict, AIResolutionPlan } from "@/types/conflicts";
import ProcessingState from "@/components/conflicts/resolution/ProcessingState";
import ResolutionSummary from "@/components/conflicts/resolution/ResolutionSummary";
import ResolutionTips from "@/components/conflicts/resolution/ResolutionTips";
import HeaderBar from "@/components/conflicts/resolution/HeaderBar";
import EmpathyMessages from "@/components/conflicts/resolution/EmpathyMessages";
import JournalNote from "@/components/conflicts/resolution/JournalNote";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { BrainCircuit, Lightbulb, MessageCircle } from "lucide-react";

// Helper to detect new JSON format
function tryParseAIPlan(plan: string): AIResolutionPlan | { raw?: string } {
  try {
    const json = JSON.parse(plan);
    // New schema (with empathy_prompts as object)
    if (
      typeof json.summary === "string" &&
      typeof json.resolution_tips === "string" &&
      typeof json.empathy_prompts === "object"
    ) {
      return json as AIResolutionPlan;
    }
    // Legacy fallback
    return { raw: plan };
  } catch {
    // Legacy fallback
    return { raw: plan };
  }
}

const ConflictResolutionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    async function fetchConflict() {
      setLoading(true);
      const { data, error } = await supabase
        .from("conflicts")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) {
        toast.error("Error fetching conflict");
        setLoading(false);
        return;
      }
      setConflict(data);
      setLoading(false);
    }
    fetchConflict();
  }, [id]);

  if (loading) return <ProcessingState />;
  if (!conflict) return (
    <div className="p-6 text-center text-muted-foreground">
      Conflict not found.
      <div>
        <button
          onClick={() => navigate("/dashboard")}
          className="mt-4 px-4 py-2 rounded bg-muted hover:bg-muted/80"
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const plan = conflict.ai_resolution_plan
    ? tryParseAIPlan(conflict.ai_resolution_plan)
    : { raw: "No resolution plan available." };
  const isJson = 'summary' in plan;

  return (
    <div className="max-w-3xl mx-auto py-6 flex flex-col gap-7 w-full px-4 sm:px-6">
      <HeaderBar dateStr={conflict.created_at} onBack={() => navigate("/dashboard")} />

      {/* Conflict Summary Section */}
      <section className="rounded-xl shadow card-gradient-harmony p-6 border border-harmony-100">
        <h2 className="font-bold text-xl flex items-center gap-2 text-harmony-700 mb-3">
          <BrainCircuit className="text-harmony-500" size={24} />
          Conflict Summary
        </h2>
        {!isJson && (
          <Card className="p-5 rounded-xl bg-white">
            <div className="whitespace-pre-line text-muted-foreground">{plan.raw}</div>
          </Card>
        )}
        {isJson && (
          <>
            <ResolutionSummary summary={plan.summary || ""} />
            <div className="mt-6">
              <ResolutionTips tips={plan.resolution_tips || ""} />
            </div>
          </>
        )}
      </section>

      {/* Personalized Empathy Messages Section */}
      {isJson && user && (
        <section className="rounded-xl shadow card-gradient-love p-6 border border-love-100">
          <h2 className="font-bold text-xl flex items-center gap-2 text-love-700 mb-3">
            <MessageCircle className="text-love-500" size={24} />
            Personalized Empathy Messages
          </h2>
          <EmpathyMessages 
            empathy_prompts={plan.empathy_prompts || {}} 
            currentUserId={user.id}
            initiatorId={conflict.initiator_id}
          />
        </section>
      )}

      {/* Journal Section */}
      <section className="rounded-xl shadow card-gradient-calm p-6 border border-calm-100">
        <h2 className="font-bold text-xl flex items-center gap-2 text-calm-700 mb-3">
          <Lightbulb className="text-calm-500" size={24} />
          Reflection Journal
        </h2>
        <JournalNote conflict={conflict} userId={user?.id || ""} />
      </section>
    </div>
  );
};

export default ConflictResolutionPage;
