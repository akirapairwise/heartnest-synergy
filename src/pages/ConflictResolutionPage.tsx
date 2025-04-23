
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Conflict } from "@/types/conflicts";
import ProcessingState from "@/components/conflicts/resolution/ProcessingState";
import ResolutionSummary from "@/components/conflicts/resolution/ResolutionSummary";
import ResolutionTips from "@/components/conflicts/resolution/ResolutionTips";
import HeaderBar from "@/components/conflicts/resolution/HeaderBar";
import EmpathyMessages from "@/components/conflicts/resolution/EmpathyMessages";
import JournalNote from "@/components/conflicts/resolution/JournalNote";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type Plan = {
  summary?: string;
  resolution_tips?: string;
  empathy_prompts?: { partner_a?: string; partner_b?: string; };
  raw?: string;
};

function tryParseAIPlan(plan: string): Plan {
  try {
    const json = JSON.parse(plan);
    if (
      typeof json.summary === "string" &&
      typeof json.resolution_tips === "string" &&
      typeof json.empathy_prompts === "object"
    ) {
      return json;
    }
    return { raw: plan };
  } catch {
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
  const isJson = !!plan.summary;

  return (
    <div className="max-w-2xl mx-auto py-6 flex flex-col gap-7 w-full animate-fade-in">
      <HeaderBar dateStr={conflict.created_at} onBack={() => navigate("/dashboard")} />
      <Card className="p-5 border card-gradient-harmony">
        <ResolutionSummary summary={plan.summary || plan.raw || ""} />
      </Card>
      {isJson && (
        <>
          <Card className="p-5 border card-gradient-love">
            <ResolutionTips tips={plan.resolution_tips || ""} />
          </Card>
          <Card className="p-5 border bg-love-50 card-gradient-calm">
            <EmpathyMessages empathy_prompts={plan.empathy_prompts || {}} />
          </Card>
        </>
      )}
      <JournalNote conflict={conflict} userId={user?.id || ""} />
    </div>
  );
};

export default ConflictResolutionPage;
