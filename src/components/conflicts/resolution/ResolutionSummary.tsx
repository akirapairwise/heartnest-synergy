
import React from "react";
import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionSummaryProps = {
  summary: string;
};

const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ summary }) => (
  <Card className="p-4 sm:p-6 rounded-xl border shadow-md bg-gradient-to-br from-harmony-50 to-calm-50 animate-fade-in w-full">
    <div className="flex flex-col sm:flex-row gap-4 items-start">
      <div className="rounded-full bg-harmony-200 p-2 shadow-sm hidden sm:block">
        <BrainCircuit className="text-love-600" size={24} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-lg sm:text-xl text-harmony-700 mb-3 tracking-wide flex items-center gap-2">
          <BrainCircuit className="text-love-500 sm:hidden" size={20} />
          <span>AI Summary</span>
        </div>
        <div className="text-justify text-calm-900 leading-relaxed whitespace-pre-line text-sm sm:text-base">
          {summary.split('\n').map((paragraph, i) => (
            paragraph.trim() ? (
              <p key={`para-${i}`} className="mb-3 last:mb-0">
                {paragraph}
              </p>
            ) : null
          ))}
        </div>
      </div>
    </div>
  </Card>
);

export default ResolutionSummary;
