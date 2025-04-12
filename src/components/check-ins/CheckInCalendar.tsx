
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { CheckIn } from '@/types/check-ins';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DayContentProps } from 'react-day-picker';

export interface CheckInCalendarProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  checkIns: CheckIn[];
}

const CheckInCalendar: React.FC<CheckInCalendarProps> = ({ 
  selectedDate, 
  onDateChange,
  checkIns 
}) => {
  // Function to determine if a date has check-ins
  const hasCheckIn = (date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    return checkIns.some(checkIn => {
      const checkInDate = format(new Date(checkIn.timestamp), 'yyyy-MM-dd');
      return checkInDate === dateString;
    });
  };
  
  return (
    <Calendar
      mode="single"
      selected={selectedDate}
      onSelect={(date) => date && onDateChange(date)}
      className="rounded-md border"
      components={{
        Day: ({ date, ...props }) => {
          // Only proceed with styling if we have a valid date
          if (!date) return <div {...props} />;
          
          const hasCheckInOnDate = hasCheckIn(date);
          
          return (
            <div className="relative">
              <div 
                {...props}
                className={cn(
                  props.className,
                  hasCheckInOnDate && 'bg-primary/10'
                )}
              >
                {props.children}
              </div>
              {hasCheckInOnDate && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </div>
          );
        },
      }}
    />
  );
};

export default CheckInCalendar;
