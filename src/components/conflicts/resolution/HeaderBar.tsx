
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Heart } from "lucide-react";

type HeaderBarProps = { dateStr: string; onBack?: () => void };

function formatDateReadable(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const HeaderBar = ({ dateStr, onBack }: HeaderBarProps) => {
  const navigate = useNavigate();
  return (
    <header className="flex flex-col gap-2 rounded-xl shadow bg-love-50/80 border border-love-100 mb-2 px-2 py-3 sm:px-6 sm:py-4 animate-fade-in">
      <div className="flex items-center justify-between gap-2">
        <button
          onClick={onBack || (() => navigate("/dashboard"))}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-love-500 hover:bg-love-600 text-white font-semibold shadow transition-all duration-150"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Conflicts</span>
          <span className="sm:hidden">Back</span>
        </button>
        <div className="flex-1 flex justify-center">
          <span className="flex items-center font-bold text-xl md:text-2xl text-love-700 tracking-tight gradient-heading">
            💗 Healing Space
          </span>
        </div>
        <div className="flex items-center min-w-fit text-sm text-muted-foreground font-medium gap-2">
          <Heart size={16} className="text-love-400" />
          <span>{formatDateReadable(dateStr)}</span>
        </div>
      </div>
    </header>
  );
};

export default HeaderBar;
