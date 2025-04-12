
import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { CheckIn } from '@/types/check-ins';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

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
        Day: ({ date, ...props }: React.ComponentProps<typeof Calendar.Day> & { date: Date }) => {
          const hasCheckInOnDate = hasCheckIn(date);
          
          return (
            <button
              {...props}
              className={cn(
                props.className,
                hasCheckInOnDate && 'bg-primary/10 text-primary font-medium relative'
              )}
            >
              {props.children}
              {hasCheckInOnDate && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-primary rounded-full" />
              )}
            </button>
          );
        },
      }}
    />
  );
};

export default CheckInCalendar;
