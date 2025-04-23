
import React from "react";
import { Copy, Share2, Heart, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type EmpathyMessagesProps = {
  empathy_prompts: { partner_a?: string; partner_b?: string };
};

const promptConfig = [
  {
    direction: "a",
    label: "👤 From You to Your Partner",
    icon: <Heart className="text-calm-500 mt-1" size={22} />,
    promptKey: "partner_a",
    instructions: "Share this message with your partner if it feels right.",
  },
  {
    direction: "b",
    label: "👤 From Your Partner to You",
    icon: <Handshake className="text-love-500 mt-1" size={22} />,
    promptKey: "partner_b",
    instructions: "Optionally, let your partner share the message below with you.",
  },
];

const handleCopy = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast.success("Copied to clipboard!");
};

const shareViaWhatsApp = (text: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const EmpathyMessages: React.FC<EmpathyMessagesProps> = ({ empathy_prompts }) => {
  return (
    <div>
      <div className="font-semibold text-base mb-3 text-love-700">
        💬 Empathy Messages
      </div>
      <div className="flex flex-col gap-4">
        {promptConfig.map(({ direction, label, icon, promptKey, instructions }) => {
          const text = (empathy_prompts as any)[promptKey];
          if (!text) return null;
          return (
            <div key={direction} className="mb-1 last:mb-0">
              <div className="flex items-center gap-2 font-medium text-harmony-700 mb-1">
                {icon} <span>{label}</span>
              </div>
              <ScrollArea className="rounded border bg-white/70 px-3 py-2 mb-1 text-[15px] whitespace-pre-line text-calm-800">
                {text}
              </ScrollArea>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-calm-600 border-calm-300 hover:bg-calm-100"
                  onClick={() => handleCopy(text)}
                >
                  <Copy size={14} className="mr-1" />
                  Copy
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-calm-600 border-calm-300 hover:bg-calm-100"
                  onClick={() => shareViaWhatsApp(text)}
                >
                  <Share2 size={14} className="mr-1" />
                  WhatsApp
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-1 ml-1">{instructions}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EmpathyMessages;
