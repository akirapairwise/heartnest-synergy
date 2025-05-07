
import React from "react";
import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionSummaryProps = {
  summary: string;
};

const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ summary }) => (
  <Card className="p-4 sm:p-6 rounded-xl border shadow-md bg-gradient-to-br from-harmony-50 to-calm-50 animate-fade-in w-full">
    <div className="flex flex-col gap-3">
      <div className="font-bold text-lg sm:text-xl text-harmony-700 mb-1 tracking-wide flex items-center gap-2">
        <BrainCircuit className="text-love-500" size={18} />
        <span>AI Summary</span>
      </div>
      <div className="text-calm-900 leading-relaxed whitespace-pre-line text-base">
        {summary.split('\n').map((paragraph, i) => (
          paragraph.trim() ? (
            <p key={`para-${i}`} className="mb-3 last:mb-0">
              {paragraph}
            </p>
          ) : null
        ))}
      </div>
    </div>
  </Card>
);

export default ResolutionSummary;
