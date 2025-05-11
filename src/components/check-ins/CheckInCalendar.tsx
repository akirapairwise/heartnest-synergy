
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { CheckIn } from '@/types/check-ins';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DayContentProps } from 'react-day-picker';
import CheckInModal from './CheckInModal';
import { toast } from '@/components/ui/use-toast';
import { useMediaQuery } from '@/hooks/use-media-query';

export interface CheckInCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  checkIns: CheckIn[];
  userId?: string;
}

const CheckInCalendar: React.FC<CheckInCalendarProps> = ({ 
  selectedDate, 
  onDateChange,
  checkIns,
  userId 
}) => {
  const [selectedCheckIn, setSelectedCheckIn] = useState<CheckIn | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 640px)");

  // Function to determine if a date has check-ins
  const hasCheckIn = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return checkIns.some(checkIn => {
      const checkInDate = format(new Date(checkIn.timestamp), 'yyyy-MM-dd');
      return checkInDate === dateString;
    });
  };

  // Function to get check-in for a specific date
  const getCheckInForDate = (date: Date): CheckIn | null => {
    const dateString = format(date, 'yyyy-MM-dd');
    return checkIns.find(checkIn => {
      const checkInDate = format(new Date(checkIn.timestamp), 'yyyy-MM-dd');
      return checkInDate === dateString;
    }) || null;
  };

  // Handle day click to show the modal with check-in details
  const handleDayClick = (date: Date) => {
    const checkIn = getCheckInForDate(date);
    if (checkIn) {
      setSelectedCheckIn(checkIn);
      setIsModalOpen(true);
    } else {
      toast({
        title: "No check-in found",
        description: `No check-in was recorded for ${format(date, 'MMMM d, yyyy')}`,
      });
    }
  };
  
  return (
    <div>
      <Calendar
        mode="single"
        selected={selectedDate}
        onSelect={(date) => {
          if (date) {
            onDateChange(date);
            handleDayClick(date);
          }
        }}
        className="rounded-md border"
        classNames={{
          month: "space-y-2 sm:space-y-4",
          caption: "flex justify-center pt-1 relative items-center",
          caption_label: "text-sm sm:text-base font-medium",
          nav: "space-x-1 flex items-center",
          nav_button: cn(
            "h-6 w-6 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100"
          ),
          table: "w-full border-collapse space-y-1",
          head_row: "flex",
          head_cell: cn(
            "text-muted-foreground rounded-md w-8 sm:w-9 font-normal text-[0.8rem] sm:text-xs"
          ),
          row: "flex w-full mt-2",
          cell: cn(
            "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-accent",
            isMobile ? "h-7 w-7 sm:h-9 sm:w-9" : "h-9 w-9"
          ),
          day: cn(
            "h-7 w-7 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100"
          ),
          day_today: "bg-accent text-accent-foreground",
        }}
        components={{
          DayContent: ({ date }: DayContentProps) => {
            // Only proceed with styling if we have a valid date
            if (!date) return null;
            
            const hasCheckInOnDate = hasCheckIn(date);
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            
            return (
              <div
                className={cn(
                  "relative flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center p-0 text-xs sm:text-sm",
                  hasCheckInOnDate && !isSelected && "bg-primary/10",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && hasCheckInOnDate && "hover:bg-primary/20"
                )}
              >
                <time dateTime={format(date, 'yyyy-MM-dd')}>
                  {format(date, 'd')}
                </time>
                
                {hasCheckInOnDate && (
                  <div className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
                )}
              </div>
            );
          },
        }}
      />

      <CheckInModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        selectedCheckIn={selectedCheckIn}
      />
    </div>
  );
};

export default CheckInCalendar;
