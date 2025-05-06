
import React from "react";
import { MessageSquare, MessageCircle, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

type EmpathyMessagesProps = {
  empathy_prompts: { partner_a?: string; partner_b?: string };
  currentUserId: string;
  initiatorId: string;
};

const handleCopy = (txt: string) => {
  navigator.clipboard.writeText(txt);
  toast.success("Message copied! Ready to share 💌");
};

const shareViaWhatsApp = (text: string) => {
  const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank");
};

const EmpathyMessages: React.FC<EmpathyMessagesProps> = ({ 
  empathy_prompts, 
  currentUserId, 
  initiatorId 
}) => {
  // Determine if the current user is the initiator or responder
  const isInitiator = currentUserId === initiatorId;
  
  // Show only the message meant for the current user to send
  // partner_a is for the initiator to send to the responder
  // partner_b is for the responder to send to the initiator
  const messageToSend = isInitiator ? empathy_prompts?.partner_a : empathy_prompts?.partner_b;

  if (!messageToSend) {
    return null;
  }

  return (
    <section className="mt-2">
      {/* Message for the current user to send to their partner */}
      <div className="p-4 rounded-xl border-l-4 border-love-400 bg-love-50/80 shadow-sm">
        <div className="flex items-center gap-2 font-semibold text-harmony-700 mb-2">
          <MessageSquare className="text-love-500 mt-1" size={22} />
          <span className="text-base">Your Message to Share</span>
        </div>
        <ScrollArea className="rounded bg-white/70 px-3 py-2 mb-2 text-[15px] whitespace-pre-line text-calm-800 max-h-[180px] border border-dashed">
          {messageToSend}
        </ScrollArea>
        <div className="flex flex-wrap gap-2 mt-2">
          <Button
            variant="outline"
            size="sm"
            className="text-love-600 border-love-300 hover:bg-love-100"
            onClick={() => handleCopy(messageToSend)}
          >
            <Heart size={14} className="mr-1" />
            Copy Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="text-love-600 border-love-300 hover:bg-love-100"
            onClick={() => shareViaWhatsApp(messageToSend)}
          >
            <MessageCircle size={14} className="mr-1" />
            Share via WhatsApp
          </Button>
        </div>
        <div className="text-sm text-muted-foreground mt-1 ml-1">
          Share this message with your partner when you feel ready.
        </div>
      </div>
    </section>
  );
};

export default EmpathyMessages;
