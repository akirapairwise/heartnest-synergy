
import React, { useState } from 'react';
import { Calendar } from "@/components/ui/calendar";
import { CheckIn } from '@/types/check-ins';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DayContentProps } from 'react-day-picker';
import CheckInModal from './CheckInModal';
import { toast } from '@/components/ui/use-toast';

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
        components={{
          DayContent: ({ date }: DayContentProps) => {
            // Only proceed with styling if we have a valid date
            if (!date) return null;
            
            const hasCheckInOnDate = hasCheckIn(date);
            const isSelected = selectedDate && format(selectedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd');
            
            return (
              <div
                className={cn(
                  "relative flex h-9 w-9 items-center justify-center p-0",
                  hasCheckInOnDate && !isSelected && "bg-primary/10",
                  isSelected && "bg-primary text-primary-foreground",
                  !isSelected && hasCheckInOnDate && "hover:bg-primary/20"
                )}
              >
                <time dateTime={format(date, 'yyyy-MM-dd')}>
                  {format(date, 'd')}
                </time>
                
                {hasCheckInOnDate && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
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
