
import React, { useState } from "react";
import { Conflict } from "@/types/conflicts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type JournalNoteProps = {
  conflict: Conflict;
  userId: string;
};

const JournalNote: React.FC<JournalNoteProps> = ({ conflict, userId }) => {
  const [note, setNote] = useState(conflict.user_journal_note || "");
  const [loading, setLoading] = useState(false);
  const [resolved, setResolved] = useState(!!conflict.resolved_at);

  // Save note to Supabase (if userId present)
  const saveNote = async () => {
    if (!userId || !conflict.id) return;
    setLoading(true);
    const { error } = await supabase
      .from("conflicts")
      .update({ user_journal_note: note })
      .eq("id", conflict.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to save note.");
    } else {
      toast.success("Note saved!");
    }
  };

  // Mark as resolved (update resolved_at)
  const markAsResolved = async () => {
    if (!userId || !conflict.id) return;
    setLoading(true);
    const { error } = await supabase
      .from("conflicts")
      .update({ resolved_at: new Date().toISOString() })
      .eq("id", conflict.id);
    setLoading(false);
    if (error) {
      toast.error("Failed to mark as resolved.");
    } else {
      setResolved(true);
      toast.success("Conflict marked as resolved!");
    }
  };

  return (
    <div>
      <div className="font-semibold text-base mb-2 text-calm-700">📝 Journal or Reflect (optional)</div>
      <Textarea
        disabled={resolved}
        className="mb-3"
        minRows={3}
        maxRows={7}
        placeholder="Write reflections, outcomes, or follow-ups here (private to you)..."
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <div className="flex flex-wrap gap-2">
        <Button onClick={saveNote} disabled={loading || resolved} variant="outline">
          💾 Save Note
        </Button>
        <Button onClick={markAsResolved} disabled={loading || resolved} variant="harmony">
          ✅ Mark as Resolved
        </Button>
      </div>
      {resolved && (
        <div className="mt-2 text-green-600 font-medium">
          This conflict has been marked as resolved.
        </div>
      )}
    </div>
  );
};

export default JournalNote;
