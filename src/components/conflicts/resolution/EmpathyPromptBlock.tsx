
import React from "react";
import { Copy, Share2, Heart, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

type EmpathyPromptBlockProps = {
  direction: "a" | "b";
  prompt: string;
};

const blockConfig = {
  a: {
    label: "Partner A ➡️ B",
    color: "calm",
    icon: <Heart className="text-calm-500 mt-1" size={24} />,
    border: "border-l-4 border-calm-400 bg-calm-50 text-calm-700",
    button: "text-calm-600 border-calm-300 hover:bg-calm-100"
  },
  b: {
    label: "Partner B ➡️ A",
    color: "love",
    icon: <Handshake className="text-love-500 mt-1" size={24} />,
    border: "border-l-4 border-love-400 bg-love-50 text-love-700",
    button: "text-love-600 border-love-300 hover:bg-love-100"
  }
};

const handleCopy = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast.success("Copied to clipboard!");
};

const shareViaWhatsApp = (text: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const shareViaSMS = (text: string) => {
  const url = `sms:?&body=${encodeURIComponent(text)}`;
  window.open(url, '_blank');
};

const EmpathyPromptBlock: React.FC<EmpathyPromptBlockProps> = ({ direction, prompt }) => {
  const config = blockConfig[direction];

  return (
    <Card className="p-5 rounded-xl border bg-gradient-to-br from-blue-100/90 to-blue-50/80 animate-fade-in">
      <div className="flex items-start gap-3">
        {config.icon}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`font-semibold text-base text-${config.color}-600`}>{config.label}</span>
          </div>
          <ScrollArea className="max-h-[250px]">
            <blockquote className={`italic rounded px-3 py-2 ${config.border} text-justify text-[15px] whitespace-pre-line`}>
              {prompt}
            </blockquote>
          </ScrollArea>
          <div className="flex flex-wrap gap-2 mt-3">
            <Button
              variant="outline"
              size="sm"
              className={config.button}
              onClick={() => handleCopy(prompt)}
            >
              <Copy size={14} className="mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={config.button}
              onClick={() => shareViaWhatsApp(prompt)}
            >
              <Share2 size={14} className="mr-1" />
              WhatsApp
            </Button>
            <Button
              variant="outline"
              size="sm"
              className={config.button}
              onClick={() => shareViaSMS(prompt)}
            >
              <Share2 size={14} className="mr-1" />
              SMS
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmpathyPromptBlock;
