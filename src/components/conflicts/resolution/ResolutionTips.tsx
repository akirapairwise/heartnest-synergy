
import React from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionTipsProps = {
  tips: string;
};

const ResolutionTips: React.FC<ResolutionTipsProps> = ({ tips }) => (
  <Card className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-calm-50 to-harmony-50 animate-fade-in">
    <div className="flex flex-col">
      <div className="font-bold text-xl sm:text-2xl text-harmony-700 mb-3 tracking-wide flex items-center gap-2">
        <Lightbulb className="text-harmony-500" size={24} /> Resolution Tips
      </div>
      <ul className="list-disc space-y-3 text-base sm:text-lg text-calm-900">
        {tips
          .split(/\n|•/g)
          .map(item => item.replace(/^- /, '').trim())
          .filter(Boolean)
          .map((tip, idx) => (
            <li key={idx} className="ml-5">
              {tip}
            </li>
          ))}
      </ul>
    </div>
  </Card>
);

export default ResolutionTips;
