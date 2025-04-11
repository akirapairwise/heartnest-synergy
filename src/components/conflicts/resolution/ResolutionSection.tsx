
import React from 'react';
import { LucideIcon } from "lucide-react";

type ResolutionSectionProps = {
  icon: React.ReactNode;
  title: string;
  content: string | null;
  iconColor: string;
};

const ResolutionSection = ({ icon, title, content, iconColor }: ResolutionSectionProps) => {
  if (!content) return null;
  
  return (
    <div className="bg-muted/30 p-4 rounded-md">
      <div className="flex items-center gap-2 mb-3">
        {icon}
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="text-sm">{content}</p>
    </div>
  );
};

export default ResolutionSection;
