import React from "react";
import { MessageSquare, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type EmpathyMessagesProps = {
  empathy_prompts: { partner_a?: string; partner_b?: string };
};

const promptConfig = [
  {
    direction: "a",
    label: "Compassionate Words to Your Partner",
    icon: <MessageSquare className="text-love-500 mt-1" size={22} />,
    promptKey: "partner_a",
    instructions: "Share this message with your partner when you feel ready.",
    color: "love",
    border: "border-l-4 border-love-400 bg-love-50/80",
    button: "text-love-600 border-love-300 hover:bg-love-100"
  },
  {
    direction: "b",
    label: "Your Partner's Heartfelt Message",
    icon: <MessageSquare className="text-calm-500 mt-1" size={22} />,
    promptKey: "partner_b",
    instructions: "Your partner's message of understanding and care.",
    color: "calm",
    border: "border-l-4 border-calm-400 bg-calm-50/80",
    button: "text-calm-600 border-calm-300 hover:bg-calm-100"
  },
];

const handleCopy = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast.success("Message copied! Ready to share 💌");
};

const shareViaWhatsApp = (text: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const EmpathyMessages: React.FC<EmpathyMessagesProps> = ({ empathy_prompts }) => {
  return (
    <section className="mt-2">
      <div className="flex flex-col gap-5">
        {promptConfig.map(({ direction, label, icon, promptKey, instructions, border, button }) => {
          const text = empathy_prompts?.[promptKey];
          if (!text) return null;
          return (
            <div key={direction} className={`p-4 rounded-xl ${border} shadow-sm`}>
              <div className="flex items-center gap-2 font-semibold text-harmony-700 mb-2">
                {icon} <span className={`text-base`}>{label}</span>
              </div>
              <ScrollArea className="rounded bg-white/70 px-3 py-2 mb-2 text-[15px] whitespace-pre-line text-calm-800 max-h-[180px] border border-dashed">
                {text}
              </ScrollArea>
              <div className="flex flex-wrap gap-2 mt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={button}
                  onClick={() => handleCopy(text)}
                >
                  <Heart size={14} className="mr-1" />
                  Copy Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={button}
                  onClick={() => shareViaWhatsApp(text)}
                >
                  <MessageCircle size={14} className="mr-1" />
                  Share via WhatsApp
                </Button>
              </div>
              <div className="text-sm text-muted-foreground mt-1 ml-1">{instructions}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default EmpathyMessages;
