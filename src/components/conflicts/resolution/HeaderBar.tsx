
import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

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
    <header className="flex items-center justify-between gap-2 px-1 py-3 border-b border-gray-100/70 mb-2">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack || (() => navigate("/dashboard"))}
          className="flex items-center gap-2 text-harmony-600 hover:underline font-semibold"
        >
          <ArrowLeft size={20} />
          Back to Conflicts
        </button>
      </div>
      <div className="flex-1 flex justify-center">
        <span className="font-bold text-xl text-harmony-700">
          🧩 Conflict Resolution
        </span>
      </div>
      <div className="text-sm text-muted-foreground text-right min-w-fit">
        {formatDateReadable(dateStr)}
      </div>
    </header>
  );
};

export default HeaderBar;
