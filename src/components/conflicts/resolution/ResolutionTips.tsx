
import React from "react";
import { HeartHandshake } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionTipsProps = {
  tips: string;
};

const ResolutionTips: React.FC<ResolutionTipsProps> = ({ tips }) => (
  <Card className="p-5 rounded-xl border card-gradient-harmony animate-fade-in">
    <div className="flex flex-row gap-3 items-start">
      <HeartHandshake className="text-calm-500 mt-1" size={26} />
      <div className="flex-1">
        <div className="font-extrabold text-lg sm:text-xl text-calm-600 mb-2 uppercase tracking-wider">
          🌿 Growth Pathways
        </div>
        <ul className="list-disc ml-5 text-base sm:text-base text-justify">
          {tips.split(/\n|•/g)
            .map(item => item.replace(/^- /, '').trim())
            .filter(Boolean)
            .map((tip, idx) => (
              <li key={idx} className="mb-2">
                <span className="inline-flex items-center gap-1">
                  <HeartHandshake className="text-calm-400 inline mr-1" size={16} />
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
