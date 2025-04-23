
import React from "react";
import { Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";

type ResolutionTipsProps = {
  tips: string;
};

const ResolutionTips: React.FC<ResolutionTipsProps> = ({ tips }) => (
  <Card className="p-6 rounded-xl border shadow-md bg-gradient-to-br from-calm-50 to-harmony-50 animate-fade-in">
    <div className="flex flex-row gap-4 items-start">
      <div className="rounded-full bg-harmony-200 p-2 mr-2 shadow">
        <Lightbulb className="text-harmony-700" size={32} />
      </div>
      <div className="flex-1">
        <div className="font-bold text-xl sm:text-2xl text-harmony-700 mb-2 tracking-wide flex items-center gap-2 uppercase">
          <Lightbulb className="text-harmony-500" size={24} /> Resolution Tips
        </div>
        <ul className="list-disc ml-6 text-base sm:text-lg text-calm-900 text-justify">
          {tips
            .split(/\n|•/g)
            .map(item => item.replace(/^- /, '').trim())
            .filter(Boolean)
            .map((tip, idx) => (
              <li key={idx} className="mb-2">
                <span className="inline-flex items-center gap-2">
                  <Lightbulb className="text-harmony-500 inline" size={18} />
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
