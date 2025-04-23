
import React from "react";
import { Smile } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionSummaryProps = {
  summary: string;
};

const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ summary }) => (
  <Card className="p-5 rounded-xl border card-gradient-harmony animate-fade-in">
    <div className="flex flex-row gap-3 items-start">
      <Smile className="text-harmony-500 mr-2 mt-1" size={26} />
      <div className="flex-1">
        <div className="font-semibold text-base sm:text-lg text-harmony-600 mb-1">
          🧩 Conflict Summary
        </div>
        <div className="text-justify text-muted-foreground leading-relaxed whitespace-pre-line text-sm sm:text-base">
          {summary}
        </div>
      </div>
    </div>
  </Card>
);

export default ResolutionSummary;
