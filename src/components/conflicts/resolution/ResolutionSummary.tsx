
import React from "react";
import { BrainCircuit } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionSummaryProps = {
  summary: string;
};

const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ summary }) => (
  <Card className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-harmony-50 to-calm-50 animate-fade-in">
    <div className="flex flex-row gap-4 items-start">
      <div className="rounded-full bg-harmony-200 p-2 mr-2 shadow">
        <BrainCircuit className="text-love-600" size={32} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-xl sm:text-2xl text-harmony-700 mb-2 tracking-wide flex items-center gap-2 uppercase">
          <BrainCircuit className="text-love-500" size={24} /> Summary
        </div>
        <div className="text-justify text-calm-900 leading-relaxed whitespace-pre-line text-base sm:text-lg font-serif">
          {summary}
        </div>
      </div>
    </div>
  </Card>
);

export default ResolutionSummary;
