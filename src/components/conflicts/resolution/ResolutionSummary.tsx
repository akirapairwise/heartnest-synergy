
import React from "react";
import { MessageCircleHeart } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionSummaryProps = {
  summary: string;
};

const ResolutionSummary: React.FC<ResolutionSummaryProps> = ({ summary }) => (
  <Card className="p-5 rounded-xl border card-gradient-love animate-fade-in">
    <div className="flex flex-row gap-3 items-start">
      <MessageCircleHeart className="text-love-500 mr-2 mt-1" size={26} />
      <div className="flex-1">
        <div className="font-extrabold text-lg sm:text-xl text-love-600 mb-2 uppercase tracking-wider">
          🌈 Shared Understanding
        </div>
        <div className="text-justify text-muted-foreground leading-relaxed whitespace-pre-line text-base sm:text-base">
          {summary}
        </div>
      </div>
    </div>
  </Card>
);

export default ResolutionSummary;
