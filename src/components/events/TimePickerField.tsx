
import React from 'react';
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Clock } from 'lucide-react';
import { generateTimeOptions } from './utils/timeOptions';
import { UseFormReturn } from 'react-hook-form';

interface TimePickerFieldProps {
  form: UseFormReturn<any>;
}

const TimePickerField = ({ form }: TimePickerFieldProps) => {
  const timeOptions = generateTimeOptions();

  return (
    <FormField
      control={form.control}
      name="event_time"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">Time (Optional)</FormLabel>
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
          >
            <FormControl>
              <SelectTrigger className="rounded-lg">
                <SelectValue placeholder="Select a time">
                  {field.value ? (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {field.value}
                    </div>
                  ) : (
                    "Select a time"
                  )}
                </SelectValue>
              </SelectTrigger>
            </FormControl>
            <SelectContent className="max-h-[40vh] overflow-y-auto">
              <SelectItem value="no-time">No specific time</SelectItem>
              {timeOptions.map((time) => (
                <SelectItem key={time} value={time}>
                  {time}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormDescription className="text-xs sm:text-sm">
            Optional: Set a specific time for your event
          </FormDescription>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default TimePickerField;
