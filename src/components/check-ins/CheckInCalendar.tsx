
import React from 'react';
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CalendarIcon } from "lucide-react";
import { CheckIn } from '@/types/check-ins';

interface CheckInCalendarProps {
  checkIns: CheckIn[];
  selectedDate: Date | undefined;
  setSelectedDate: (date: Date | undefined) => void;
}

const CheckInCalendar: React.FC<CheckInCalendarProps> = ({ 
  checkIns, 
  selectedDate, 
  setSelectedDate 
}) => {
  
  const getDayWithCheckIns = (day: Date) => {
    return checkIns.find(checkIn => {
      const checkInDate = new Date(checkIn.timestamp);
      return (
        checkInDate.getDate() === day.getDate() &&
        checkInDate.getMonth() === day.getMonth() &&
        checkInDate.getFullYear() === day.getFullYear()
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5" />
          Calendar View
        </CardTitle>
        <CardDescription>Select a date to view check-ins</CardDescription>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-md border"
          modifiers={{
            hasCheckIn: (date) => !!getDayWithCheckIns(date),
          }}
          modifiersStyles={{
            hasCheckIn: { 
              fontWeight: 'bold',
              backgroundColor: 'hsl(var(--primary) / 0.1)',
              borderRadius: '50%'
            }
          }}
        />
      </CardContent>
    </Card>
  );
};

export default CheckInCalendar;
