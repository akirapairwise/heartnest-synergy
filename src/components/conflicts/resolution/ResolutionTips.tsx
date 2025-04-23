
import React from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionTipsProps = {
  tips: string;
};

const ResolutionTips: React.FC<ResolutionTipsProps> = ({ tips }) => (
  <Card className="p-5 rounded-xl border card-gradient-love animate-fade-in">
    <div className="flex flex-row gap-3 items-start">
      <Lightbulb className="text-love-500 mt-1" size={26} />
      <div className="flex-1">
        <div className="font-semibold text-base sm:text-lg text-love-600 mb-1">
          🛠️ Resolution Tips
        </div>
        <ul className="list-disc ml-5 text-sm sm:text-base text-justify">
          {/* Support both dash-delineated and newlines */}
          {tips.split(/\n|•/g)
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
);

export default ResolutionTips;
