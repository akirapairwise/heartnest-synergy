
import React from 'react';
import { Card } from '@/components/ui/card';
import { CalendarIcon, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { getDateDisplay } from './utils/dateDisplay';

interface EventPreviewCardProps {
  title: string;
  eventDate: Date;
  eventTime?: string;
  location?: string;
  sharedWithPartner: boolean;
}

const EventPreviewCard = ({
  title,
  eventDate,
  eventTime,
  location,
  sharedWithPartner,
}: EventPreviewCardProps) => {
  const displayTime = eventTime && eventTime !== "no-time" ? eventTime : undefined;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-2 text-sm font-medium">Event Preview</div>
      <Card className="rounded-xl overflow-hidden bg-gradient-to-br from-white to-muted/30 border-muted/30">
        <div className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <h3 className="font-medium leading-none text-lg">{title}</h3>
                {sharedWithPartner && (
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    <Users className="h-3 w-3 mr-1" />
                    Shared
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarIcon className="h-4 w-4" />
                <span>
                  {getDateDisplay(eventDate, displayTime)}
                </span>
              </div>

              {location && (
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  <span className="truncate">{location}</span>
                </div>
              )}
            </div>

            <div className="text-right">
              <div className="text-sm font-medium px-3 py-1 rounded-full bg-primary/10 text-primary">
                {getDateDisplay(eventDate, displayTime)}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

export default EventPreviewCard;
